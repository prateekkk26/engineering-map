---
title: Queues & Workers
summary: What a job queue actually guarantees, how a worker should be written, and why your database is often the right broker.
level: core
minutes: 25
order: 2
tags: [async, queues, workers, architecture]

related:
  - system-design/building-blocks/message-queues-and-brokers
  - backend/async-work/idempotent-consumers
  - backend/async-work/retries-backoff-and-dead-letters

resources:
  - title: BullMQ documentation
    url: https://docs.bullmq.io/
    source: BullMQ
    type: docs
    minutes: 30
  - title: Amazon SQS visibility timeout
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html
    source: AWS
    type: docs
    minutes: 15
    primary: true
  - title: Choose Postgres queue technology
    url: https://adriano.fyi/posts/2023-09-24-choose-postgres-queue-technology/
    source: Adriano Caloiaro
    type: article
    minutes: 15
---

## In one line

A queue is a durable handoff with an at-least-once delivery guarantee and a visibility timeout, and everything a worker does has to be written with those two facts in mind.

## What it is

The mechanism is the same across brokers. A producer writes a message. A worker **leases** it — the message becomes invisible to other workers for a visibility timeout — does the work, then acknowledges, which deletes it. If the worker crashes or the lease expires first, the message reappears and someone else picks it up. That is why delivery is **at-least-once**: the ack can be lost after the work succeeded, so a duplicate is normal operation rather than an error.

Two consequences follow directly. The visibility timeout must exceed your worst-case processing time, or a long job is redelivered while still running and executed twice concurrently — extend the lease periodically for long jobs. And **handlers must be idempotent**, which is not optional advice but the price of the model.

Design the message itself carefully: put an **ID and a version**, not the whole object. A message carrying a full user record is stale by the time it's processed and awkward to change; a message carrying `{ userId, type, v: 1 }` lets the worker read current state. Keep payloads small, and never put secrets in them — queues are persisted and often visible in dashboards.

**Choosing a broker** is mostly a question of what you already run. Postgres with `SELECT ... FOR UPDATE SKIP LOCKED` is a genuinely good queue up to thousands of jobs a minute, and it gives you transactional enqueue with your writes for free — the single biggest correctness advantage available. Redis (BullMQ) adds throughput, delays, priorities and a UI at the cost of persistence guarantees you should read carefully. SQS and similar managed queues remove the operational burden. Kafka is a different tool: a replayable log for streams and fan-out to multiple independent consumers, not a work queue, and choosing it for background jobs usually buys complexity you won't use.

Run workers as a **separate deployment** from the web service. They scale on queue depth rather than request rate, a poisonous job shouldn't be able to take down your API, and separate limits make the resource story legible. Concurrency per worker is a tuning knob: high for I/O-bound jobs, near one for CPU-bound ones.

## Why it matters

Background processing appears in nearly every practical round — uploads, emails, model calls — and the questions that separate candidates are about the guarantee, not the library: what happens if the worker dies mid-job, how you avoid double-processing, why the payload is an ID. "Postgres is probably enough" is also a strong, cost-aware answer that many candidates never consider.

## Key points

- Lease-plus-acknowledge means at-least-once delivery; duplicates are expected behaviour, not failure.
- Visibility timeout must exceed worst-case processing, or long jobs get run twice in parallel.
- Send an ID and a schema version, not a snapshot of the object — payloads go stale and are hard to evolve.
- Postgres with `SKIP LOCKED` is a real queue and gives you transactional enqueue with your data writes.
- Kafka is a log for streams and replay, not a job queue; picking it for jobs imports unused complexity.
- Deploy workers separately so they scale on queue depth and can't take the API down with them.
- Per-worker concurrency should follow the workload: high for I/O-bound, low for CPU-bound.
