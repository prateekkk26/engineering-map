---
title: Design a Notification Service
summary: One service, many channels — fan-out to push, email and SMS with deduplication, preferences, rate limits and third-party failure baked in.
level: core
minutes: 25
order: 5
tags: [system-design, classic-problem, messaging]

related:
  - system-design/building-blocks/message-queues-and-brokers
  - system-design/distributed-systems/idempotency-and-delivery-semantics
  - system-design/frontend-system-design/design-a-notification-system

resources:
  - title: Building a Notification System
    url: https://blog.bytebytego.com/p/design-a-notification-system
    source: ByteByteGo
    type: article
    minutes: 20 # unverified
  - title: Firebase Cloud Messaging — Architectural Overview
    url: https://firebase.google.com/docs/cloud-messaging/fcm-architecture
    source: Google
    type: docs
    minutes: 15
    primary: true
  - title: Retry with Exponential Backoff
    url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
    source: AWS Builders' Library
    type: article
    minutes: 30
---

## In one line

A pipeline that turns an event into zero or more messages across channels, applying preferences and deduplication before it ever touches a third-party sender.

## What it is

**Scope.** Triggers from many services; channels — push (iOS/Android), email, SMS, in-app; user preferences and quiet hours; templates and localisation; delivery tracking; unsubscribes. This is a platform, so the API it exposes to other teams matters as much as the delivery path.

**The pipeline.** Producer service publishes an event → **ingestion API** validates and enqueues → **preference and eligibility filter** → **template rendering** → **per-channel queues** → **channel workers** call the provider (APNs, FCM, SES, Twilio) → **delivery status** recorded from provider callbacks.

**Why the stages are separate.** Each channel has its own rate limits, failure modes and latency. One queue per channel means a Twilio outage backs up SMS without delaying push, and each worker pool scales independently.

**Preferences are the part candidates skip.** Per user, per notification type, per channel, plus global quiet hours in the *user's* timezone, plus regulatory constraints (marketing versus transactional — you may not suppress a password reset, and you may not send marketing without consent). Evaluate these once, centrally, before rendering. Get it wrong and you have both an angry-user problem and a compliance problem.

**Deduplication and throttling.** The same event can arrive twice, and ten events can arrive in a minute. Two mechanisms: an idempotency key per logical notification (so retries don't double-send), and **aggregation windows** — hold for a few minutes and collapse "5 people liked your post" into one message. Per-user caps per hour and per day stop a bug from spamming your entire user base, which is the failure everyone in this domain has seen at least once.

**Third-party providers fail, constantly.** Retry with backoff for transient errors; never retry a hard rejection (invalid token, unsubscribed, bad number). **Prune invalid device tokens** on permanent failure or the invalid set grows forever. Circuit-break a failing provider and, for critical messages, fail over to a secondary provider — which means templates and identity must not be provider-specific.

**Delivery guarantees.** At-least-once, so it must be idempotent at the provider level where possible, and you accept that occasional duplicates are better than silent loss. State that trade explicitly. Transactional notifications get retries and alerting; marketing gets dropped after N failures.

**Scheduling.** Future-dated and recurring notifications need a scheduler with a durable store, not an in-memory timer, and "send at 9am local time" means computing per-user send times across timezones — which produces a spiky, predictable load pattern worth pre-scaling for.

**Tracking.** Sent, delivered, opened, clicked, failed, with the reason. Aggregate for the product; alert on delivery-rate drops, which is the earliest signal a provider or a template is broken.

## Why it matters

Every product has one, it touches queues, fan-out, third-party failure, idempotency and user preferences in a single problem, and it is a real platform-engineering question rather than a puzzle. The strongest answers spend time on preferences, deduplication and provider failure rather than on the obvious pipeline.

## Key points

- Separate queues and worker pools per channel so one provider's outage can't stall the others.
- Evaluate preferences, quiet hours and consent centrally, before rendering or sending.
- Transactional and marketing messages follow different suppression rules — never conflate them.
- An idempotency key per logical notification stops retries becoming duplicate sends.
- Aggregation windows collapse bursts into one message and are what makes the product tolerable.
- Per-user hourly and daily caps are the safety net against a bug spamming everyone.
- Never retry hard rejections; prune invalid device tokens on permanent failure.
- Circuit-break and fail over failing providers, so templates must stay provider-agnostic.
- Schedule future sends from a durable store, and expect timezone-driven spikes.
- Alert on delivery-rate drops — it's the earliest signal something upstream broke.
