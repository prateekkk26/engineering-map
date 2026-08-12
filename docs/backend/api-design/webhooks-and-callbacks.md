---
title: Webhooks & Callbacks
summary: Both sides of an outbound HTTP event — signing and retrying the ones you send, verifying and deduplicating the ones you receive.
level: core
minutes: 25
order: 10
tags: [api, webhooks, integration]

related:
  - backend/async-work/idempotent-consumers
  - _shared/idempotency
  - backend/backend-security/ssrf-and-outbound-requests

resources:
  - title: Webhooks
    url: https://docs.stripe.com/webhooks
    source: Stripe
    type: docs
    minutes: 25
    primary: true
  - title: Standard Webhooks
    url: https://www.standardwebhooks.com/
    source: Standard Webhooks
    type: docs
    minutes: 15
  - title: Webhook best practices
    url: https://docs.svix.com/receiving/verifying-payloads/why
    source: Svix
    type: article
    minutes: 10
---

## In one line

A webhook is your service making an unauthenticated-looking HTTP request to a stranger's server, which is why every rule about them is about proving who sent it and surviving the fact that it will be delivered twice.

## What it is

**Receiving.** The endpoint is public, so the payload is untrusted until you verify the signature — an HMAC over the raw request body with a shared secret, compared in constant time. Verify against the **raw bytes**, not the parsed-then-restringified JSON, because key order and whitespace change the hash; this is the single most common webhook bug in a framework that eagerly parses bodies. The signature header includes a timestamp that you must also check, or a captured request replays forever.

Then: **respond fast and do the work later**. Acknowledge with `2xx` as soon as the event is persisted or enqueued. Providers time out in seconds and treat a slow success as a failure, so processing inline turns a slow database into a retry storm. And **deduplicate on the event ID**, because every provider guarantees at-least-once delivery — the same event will arrive twice, sometimes out of order, and your handler must be idempotent. Reconcile with a polling job for anything financial; webhooks get dropped, and "we never got the event" is not a state you want to discover from a customer.

**Sending.** You owe subscribers the same properties: a stable event schema with a type and an ID, an HMAC signature and timestamp header, retries with exponential backoff over hours, and a way to see and replay failed deliveries. Deliver from a queue, never from the request that caused the event — a subscriber's downtime must not become yours. Disable endpoints that fail persistently and tell the owner.

The security angle people miss is that sending webhooks means **making HTTP requests to URLs users supply**, which is textbook SSRF: block private address ranges, resolve and pin the IP, disable redirects to internal hosts, and set a hard timeout.

## Why it matters

Webhooks are how every payment, auth, and model-provider integration reports asynchronous results, so "how do you handle Stripe events" is a routine practical-round question. The senior answer is signature-verify, enqueue, acknowledge, dedupe by event ID — and the junior one processes inline and assumes exactly-once delivery.

## Key points

- Verify the HMAC signature over the raw request body, in constant time, before parsing anything.
- Check the signature's timestamp, or a replayed request is valid forever.
- Return `2xx` in milliseconds by enqueuing the work; slow handlers get retried and multiply the load.
- Delivery is at-least-once and unordered — dedupe on the provider's event ID and make handlers idempotent.
- Poll or reconcile for critical state; a dropped webhook should be recoverable without a support ticket.
- As a sender: queue deliveries, sign them, back off over hours, and expose a replay UI.
- User-supplied webhook URLs are an SSRF vector — allowlist the address space you'll dial.
