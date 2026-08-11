---
title: Outbox & Dual-Write Consistency
summary: You cannot atomically write to your database and send a message, so write the message to the database and publish it afterwards.
level: deep
minutes: 20
order: 6
tags: [data, consistency, messaging, reliability]

related:
  - data/data-pipelines/change-data-capture
  - data/transactions-and-consistency/acid-and-what-each-letter-buys
  - _shared/caching

resources:
  - title: Transactional Outbox Pattern
    url: https://microservices.io/patterns/data/transactional-outbox.html
    source: Chris Richardson
    type: article
    minutes: 15
    primary: true
  - title: Reliable Microservices Data Exchange With the Outbox Pattern
    url: https://debezium.io/blog/2019/02/19/reliable-microservices-data-exchange-with-the-outbox-pattern/
    source: Debezium
    type: article
    minutes: 25
  - title: Idempotent Requests
    url: https://docs.stripe.com/api/idempotent_requests
    source: Stripe
    type: docs
    minutes: 10
---

## In one line

The dual-write problem is that a database commit and a message publish can't be one atomic action — so make the message part of the commit and publish it from there.

## What it is

The broken shape is everywhere: save the order, then publish `order.created`; save the user, then enqueue a welcome email; save the document, then push an embedding job. If the publish fails after the commit, the event is lost silently. If the publish succeeds and the transaction rolls back, you've announced something that never happened. Wrapping the publish inside the transaction doesn't help — the network call has already happened and can't be rolled back.

**The outbox pattern**: in the same transaction as the business write, insert a row into an `outbox` table describing the event. Atomicity is now real, because both are ordinary rows in one database. A separate **relay** then reads unpublished outbox rows, publishes them, and marks them done — either by polling with `FOR UPDATE SKIP LOCKED`, or by tailing the WAL with change data capture, which avoids polling entirely.

**This gives at-least-once delivery, not exactly-once.** The relay can crash after publishing and before marking, so the message goes twice. That is unavoidable in a distributed system, which is why **consumers must be idempotent**: dedupe on an event id, or make the handler naturally repeatable. Every design conversation about queues should end here — "exactly-once" is a property of the consumer's effect, not of the transport.

Ordering is the other caveat: outbox rows are ordered by insertion, but a parallel relay or a partitioned broker can reorder. If order matters, key by entity so all events for one entity go to one partition.

**The inverse pattern, the inbox**, records processed message ids in the same transaction as their effects, which is how a consumer becomes idempotent without hoping the effect is.

Cheaper alternatives worth knowing: if the consumer is just your own job queue, putting the queue *in* the database — a `jobs` table with `SKIP LOCKED` — makes the whole problem disappear, because enqueue is part of the transaction. That is a legitimately good answer for a product-sized system, and it removes a piece of infrastructure.

## Why it matters

Any system with side effects — emails, webhooks, embeddings, analytics, downstream services — hits this, and "what if the process dies between the commit and the publish?" is a standard senior follow-up. Naming the outbox and stating the at-least-once consequence is a compact way to show you think about partial failure.

## Key points

- Writing to a database and a broker in one operation is not atomic; one of them can succeed alone.
- The outbox turns the event into a row in the same transaction, so the commit is the only thing that must succeed.
- A relay publishes outbox rows afterwards, via polling with `SKIP LOCKED` or by tailing the WAL with CDC.
- Delivery is at-least-once — consumers must be idempotent, usually by deduplicating on an event id.
- The inbox pattern records processed ids transactionally with their effects, making the consumer safely repeatable.
- Ordering survives only if events for one entity are keyed to one partition or relayed serially.
- If the only consumer is your own background jobs, a jobs table in the same database removes the problem entirely.
