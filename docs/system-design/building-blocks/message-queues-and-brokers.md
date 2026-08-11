---
title: Message Queues & Brokers
summary: Decoupling a producer from a consumer in time — what a queue actually buys you, and the delivery guarantees you have to design around.
level: core
minutes: 25
order: 4
tags: [async, messaging, reliability]

related:
  - system-design/distributed-systems/idempotency-and-delivery-semantics
  - system-design/building-blocks/event-logs-and-stream-processing
  - cs-fundamentals/concurrency/backpressure-and-bounded-queues

resources:
  - title: Amazon SQS Developer Guide — How Queues Work
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-how-it-works.html
    source: AWS
    type: docs
    minutes: 20
  - title: Enterprise Integration Patterns — Messaging Patterns Overview
    url: https://www.enterpriseintegrationpatterns.com/patterns/messaging/
    source: Hohpe & Woolf
    type: docs
    minutes: 30
  - title: What Do You Mean "Event-Driven"?
    url: https://martinfowler.com/articles/201701-event-driven.html
    source: Martin Fowler
    type: article
    minutes: 20
    primary: true
---

## In one line

A queue lets a producer hand off work and return immediately, absorbing bursts and surviving consumer downtime — at the price of at-least-once delivery and no ordering guarantee you didn't ask for.

## What it is

A broker holds messages until a consumer processes and acknowledges them. Four things this buys you:

**Latency decoupling.** The upload API returns in 50ms and thumbnailing happens later. Any work the user doesn't need the result of belongs behind a queue.

**Burst absorption.** Producers at 10,000/s and consumers at 1,000/s is fine if the burst is short — the queue is a buffer. Sustained, the queue grows forever and you have a capacity problem the queue is only hiding. Queue depth is the metric to alert on.

**Failure isolation.** If the email provider is down, messages wait instead of failing user requests.

**Fan-out.** Publish/subscribe: one event, many independent consumers, added without touching the producer.

**Delivery semantics, which is the real content.** At-most-once loses messages. At-least-once is what real brokers give you: the message is redelivered if the ack doesn't arrive, so **duplicates are guaranteed to happen eventually** and consumers must be idempotent. Exactly-once end to end doesn't exist across a network — what systems call exactly-once is at-least-once plus deduplication somewhere. Design for duplicates and this stops being a problem.

**Ordering.** Most queues don't guarantee it globally; with several consumers, messages are processed concurrently and out of order. If you need order, you need a per-key partition with one consumer per partition — which caps parallelism at the partition count. Ask whether you really need it: usually order matters per user or per entity, not globally.

**The operational parts you should name.** *Visibility timeout* — how long a message is invisible while being processed; too short and you get duplicate processing, too long and a crashed consumer stalls the message. *Dead-letter queue* — after N failed attempts the message moves aside instead of poisoning the consumer forever; a DLQ with no alert on it is a silent data-loss machine. *Retry with backoff and jitter*, so a failing dependency isn't hammered.

**Queue versus log.** A queue deletes on ack and is for work distribution. A log (Kafka) retains an ordered record that many consumers read at their own offsets, replayable. Different tools; picking the wrong one is a common design-round mistake.

## Why it matters

Queues appear in almost every design past a certain size, and the interviewer's follow-up is never "what is a queue" — it's "what happens if the consumer crashes halfway", "what if the message is delivered twice", and "what if consumers can't keep up". Those three answers are the whole topic.

## Key points

- Put work behind a queue when the user doesn't need its result in the response.
- A queue absorbs bursts; if it grows without draining you have a capacity problem, not a queueing one.
- Real brokers deliver at-least-once, so consumers must be idempotent — duplicates are certain, not hypothetical.
- Exactly-once delivery doesn't exist across a network; it's at-least-once plus deduplication.
- Global ordering costs you parallelism — use per-key partitions and check whether you need order at all.
- Visibility timeout must exceed worst-case processing time or messages get processed twice.
- Every queue needs a dead-letter queue, and every DLQ needs an alert.
- A queue is for work distribution; a replayable, multi-reader ordered record is a log instead.
