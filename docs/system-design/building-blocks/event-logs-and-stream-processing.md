---
title: Event Logs & Stream Processing
summary: Kafka's model — a partitioned, replayable, ordered log — and when that's the right thing to draw instead of a queue.
level: core
minutes: 25
order: 5
tags: [messaging, streaming, data]

related:
  - system-design/building-blocks/message-queues-and-brokers
  - data/data-pipelines/batch-vs-streaming
  - system-design/classic-problems/design-a-metrics-pipeline

resources:
  - title: The Log — What Every Software Engineer Should Know About Real-Time Data's Unifying Abstraction
    url: https://web.archive.org/web/20240105095933/https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying
    source: Jay Kreps (archived)
    type: article
    minutes: 45
    primary: true
  - title: Kafka Design
    url: https://kafka.apache.org/documentation/#design
    source: Apache Kafka
    type: docs
    minutes: 30
  - title: Turning the Database Inside-Out
    url: https://martin.kleppmann.com/2015/11/05/database-inside-out-at-oredev.html
    source: Martin Kleppmann
    type: video
    minutes: 55
---

## In one line

A log is an append-only, partitioned, ordered sequence of records that consumers read at their own pace and can re-read from any point — which makes it storage as much as transport.

## What it is

**The model.** A topic is split into partitions. Each partition is an append-only file with a monotonic offset per record. Producers append; consumers track their own offset and read forward. Records are retained by time or size, not deleted on read, so a new consumer can start at offset zero and replay all of history. That single property — replay — is what a queue can't do and why the log became the backbone of data infrastructure.

**Ordering is per partition, not per topic.** The partition key decides placement: key by `user_id` and all events for that user are ordered, while different users process in parallel. This is the standard answer to "how do you get ordering and parallelism" — you get order within a key and concurrency across keys.

**Consumer groups.** Partitions are distributed across a group's members, one consumer per partition at a time. Parallelism is capped by partition count, so partition count is a capacity decision you make early and change awkwardly. Multiple independent groups each get the full stream at their own offsets — a real-time consumer and a warehouse loader read the same topic without interfering.

**Delivery semantics again.** Default is at-least-once. Kafka's transactional producer gives exactly-once *within* Kafka (read-process-write across topics), but the moment you write to an external system, you're back to at-least-once plus idempotent writes. Say that precisely; it's a common bluff.

**Stream processing** sits on top: filter, enrich, and aggregate over windows (tumbling, hopping, sliding), joins between streams, and stateful operators with a materialised store. The hard parts are event time versus processing time, and late-arriving data — a "count per minute" is ambiguous until you say which clock and how long you wait for stragglers. Watermarks are how systems express that trade.

**When a log beats a queue.** Multiple independent consumers of the same events; replay after a bug or for a new consumer; ordering per key; event sourcing or CDC feeding a warehouse. **When it doesn't:** a single consumer doing background jobs. A managed queue is far less to operate, and reaching for Kafka to send welcome emails is a textbook over-engineering signal.

## Why it matters

"Kafka" is one of the most name-dropped words in design rounds and one of the least understood; being precise about partitions, ordering, consumer groups and what exactly-once actually covers is a strong differentiator. Replay is also the honest answer to several real design problems — rebuilding a derived store, backfilling a new feature, recovering from a consumer bug — and it's hard to argue for those without the log model.

## Key points

- A log retains records after they're read, so consumers can replay from any offset — the defining difference from a queue.
- Ordering is guaranteed per partition; the partition key is what buys you per-entity order with cross-entity parallelism.
- Consumer parallelism is capped by partition count, so partition count is an early capacity decision.
- Independent consumer groups read the same stream at their own offsets without affecting each other.
- Exactly-once is scoped to Kafka-internal read-process-write; external writes still need idempotency.
- Event time versus processing time, and how long to wait for late data, is the core stream-processing question.
- Choose a log for multi-consumer, replayable, per-key-ordered event flow; choose a queue for background jobs.
