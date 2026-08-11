---
title: Event-Driven vs Request-Response
summary: When to publish an event instead of making a call — decoupling and resilience against traceability and eventual consistency.
level: core
minutes: 20
order: 3
tags: [architecture, messaging, tradeoffs]

related:
  - system-design/building-blocks/message-queues-and-brokers
  - system-design/architecture-decisions/drawing-service-boundaries
  - system-design/distributed-systems/idempotency-and-delivery-semantics

resources:
  - title: What Do You Mean by "Event-Driven"?
    url: https://martinfowler.com/articles/201701-event-driven.html
    source: Martin Fowler
    type: article
    minutes: 20
    primary: true
  - title: Event-Driven Architecture
    url: https://aws.amazon.com/event-driven-architecture/
    source: AWS
    type: article
    minutes: 15
  - title: The Many Meanings of Event-Driven Architecture
    url: https://www.youtube.com/watch?v=STKCRSUsyP0
    source: Martin Fowler / GOTO
    type: video
    minutes: 50
---

## In one line

Make a request when you need an answer to continue; publish an event when you're telling the world something happened and don't care who reacts.

## What it is

**Request-response.** The caller knows the callee, waits for a result, and inherits its latency and availability. Simple to reason about, easy to debug — one stack trace — and it's the right default for anything the user is waiting on. The cost is coupling: A must know B exists, and when B is down, A is degraded.

**Event-driven.** The producer publishes a fact — `OrderPlaced` — and doesn't know or care who consumes it. New consumers are added without touching the producer, consumers can be down and catch up later, and the producer's latency doesn't include theirs. The cost is that no single place describes the flow, the sequence of what happened is spread across services, and everything downstream is eventually consistent.

**The distinction worth being precise about.** *Event notification* — "this happened", with an ID, and consumers fetch what they need. *Event-carried state transfer* — the event carries enough data that consumers don't need to call back, which is faster and duplicates data that can go stale. *Event sourcing* — the event log is the source of truth and state is derived from it; powerful, and a much bigger commitment than the other two. Most systems that say "event-driven" mean the first or second; conflating them with event sourcing is a common muddle.

**Events are facts, in the past tense, and they belong to the producer.** `OrderPlaced`, not `SendConfirmationEmail` — the moment an event names what a consumer should do, you've built a queue-shaped RPC and re-coupled the two sides. Include an ID, a timestamp, a version, and the minimum payload consumers actually need.

**What you take on.** At-least-once delivery, so consumers must be idempotent. No global ordering, so design for out-of-order arrival or partition by entity key. Schema evolution across producers and consumers that deploy independently — add optional fields, never repurpose existing ones. And the debugging problem: without a correlation ID propagated through every event and distributed tracing, "why didn't this email send?" becomes an afternoon.

**Consistency is the honest trade.** After the event is published, downstream state is stale for a while. That's fine for notifications, analytics and search indexing; it's not fine when the next screen must show the result. Say which case you're in.

**Most real systems are both:** synchronous on the user's critical path, events for everything downstream of it. Placing an order writes synchronously and returns; inventory, email, analytics and the warehouse all react to the event. That hybrid, stated deliberately, is the answer.

## Why it matters

It follows every service-decomposition discussion, and it's where candidates most often over-commit — proposing full event-driven architecture and then struggling with "how does the user see the result immediately?" Naming the hybrid, and naming idempotency and schema evolution as the costs, is a much stronger position.

## Key points

- Request-response when the caller needs the result to proceed; events when you're announcing a fact.
- Events decouple deployment and availability at the price of traceability and immediate consistency.
- Distinguish notification, state transfer, and event sourcing — they're very different commitments.
- Name events as past-tense facts owned by the producer; naming a consumer's action re-couples them.
- At-least-once delivery makes idempotent consumers mandatory.
- Design for out-of-order arrival, or partition by entity key to get per-entity ordering.
- Evolve schemas additively; producers and consumers deploy independently.
- Propagate a correlation ID through every event, or debugging a flow becomes archaeology.
- The usual right answer is hybrid: synchronous on the critical path, events for everything after it.
