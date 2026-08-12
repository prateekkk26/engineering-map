---
title: Idempotent Consumers
summary: Writing a worker that produces the same result whether a message arrives once or five times, and doing it without a distributed transaction.
level: core
minutes: 25
order: 4
tags: [async, idempotency, correctness]

related:
  - _shared/idempotency
  - backend/async-work/queues-and-workers
  - data/transactions-and-consistency/acid-and-what-each-letter-buys

resources:
  - title: Idempotent consumer pattern
    url: https://microservices.io/patterns/communication-style/idempotent-consumer.html
    source: Chris Richardson
    type: article
    minutes: 15
    primary: true
  - title: Delivery guarantees
    url: https://kafka.apache.org/documentation/#semantics
    source: Apache Kafka
    type: docs
    minutes: 20
  - title: Exactly-once semantics are possible — here's how
    url: https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/
    source: Confluent
    type: article
    minutes: 25
---

## In one line

"Exactly-once delivery" doesn't exist across a network, so the achievable goal is exactly-once *effect*: at-least-once delivery plus a consumer that recognises what it has already done.

## What it is

The reason is simple and worth being able to state: the acknowledgement can always be lost. A worker that processes then acks may crash after processing; a worker that acks then processes may crash before. There is no ordering of those two operations that gives exactly-once, so brokers offer at-least-once and push the deduplication to you. (Kafka's "exactly-once" is real but narrow — it works because producing, consuming and offset-committing happen inside one Kafka transaction, which only covers effects that live in Kafka.)

Three ways to make a consumer idempotent, in order of preference. **Make the operation naturally idempotent**: `UPDATE ... SET status = 'sent'` and upserts don't care how many times they run, while `balance = balance + 10` cares a great deal. **Use a natural unique key**: a `UNIQUE` constraint on `(order_id, type)` turns a duplicate insert into a conflict you can swallow, and the database enforces it under concurrency. **Keep a processed-message ledger** when neither applies: a table of message IDs, checked on entry and inserted as part of the work.

The ledger only works if **the ID insert and the effect commit in the same transaction**. Two separate commits reintroduce the crash window you were closing. And if the effect is *not* in your database — sending an email, calling a payment API — you cannot get atomicity, so you push idempotency to the far side: an idempotency key on the outbound call, or a provider that dedupes for you.

Two operational details. **Concurrency**: two workers can process the same message simultaneously, so a check-then-act read of the ledger is a race; rely on a unique constraint or a lock, not a `SELECT`. And **retention**: the ledger grows forever unless you prune it, so bound it by the maximum redelivery window and delete beyond it.

Ordering deserves its own mention: most queues do not guarantee it. If message B invalidates message A, a consumer that processes them out of order corrupts state — the usual fixes are a per-entity ordering key (FIFO queues, Kafka partitions) or version numbers on the message so stale updates are ignored.

## Why it matters

This is the question hiding behind every queue design: "the worker crashed halfway — what happens?" A candidate who says "make the handler idempotent" and then names the concrete mechanism, including the atomicity requirement, is demonstrably one who has run a queue in production.

## Key points

- Exactly-once delivery is impossible over a network; exactly-once effect through idempotency is what you build.
- Prefer operations that are naturally idempotent — set-a-value and upsert over increment.
- A unique constraint on a natural key is the cheapest deduplication, and it holds under concurrent workers.
- A processed-message ledger must be written in the same transaction as the effect it records.
- When the effect is in another system, push idempotency outward with an idempotency key on the call.
- Check-then-act against the ledger loses to two concurrent deliveries; let the database enforce uniqueness.
- Prune the ledger to the redelivery window, or it becomes your largest table.
- Queues rarely guarantee order — use partition keys or message versions when order affects correctness.
