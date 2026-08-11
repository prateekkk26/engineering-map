---
title: Drawing Service Boundaries
summary: Splitting by business capability rather than technical layer, and using the data — who writes what — as the test for whether a boundary is real.
level: core
minutes: 20
order: 2
tags: [architecture, boundaries, ddd]

related:
  - system-design/architecture-decisions/monolith-vs-microservices
  - system-design/distributed-systems/distributed-transactions-and-sagas
  - system-design/architecture-decisions/event-driven-vs-request-response

resources:
  - title: Bounded Context
    url: https://martinfowler.com/bliki/BoundedContext.html
    source: Martin Fowler
    type: article
    minutes: 15
    primary: true
  - title: Decompose by Business Capability
    url: https://microservices.io/patterns/decomposition/decompose-by-business-capability.html
    source: Chris Richardson
    type: article
    minutes: 15
  - title: Domain-Driven Design Reference
    url: https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf
    source: Eric Evans
    type: book
---

## In one line

A good boundary owns its data and can change without coordinating; if two services must be deployed together or write the same table, the boundary is in the wrong place.

## What it is

**Split by capability, not by layer.** `Orders`, `Payments`, `Inventory`, `Notifications` — each owning its data, its rules and its API. Not `API service`, `business logic service`, `data access service`, which is a layered monolith spread across a network: every feature touches all three, so nothing deploys independently and you've bought only latency.

**The data test is the sharp one.** Each piece of data has exactly one service that writes it; everyone else reads through that service's API or via events it publishes. Two services writing the same table is not a boundary, it's a shared database with extra network hops — and it produces consistency bugs nobody can reproduce.

**Bounded contexts, and the same word meaning different things.** "Customer" in billing (payment methods, invoices, tax status) is not "customer" in support (tickets, sentiment, history). Trying to build one canonical model that serves both produces an object with forty fields where every consumer uses eight. Let each context have its own model and translate at the boundary — that translation is a feature, not duplication.

**Test the boundary against change.** Which features would touch two services? If most of your roadmap crosses a particular line, that line is wrong. The point of a boundary is that changes land inside it.

**Symptoms that a boundary is misplaced:** services that must be released together; a transaction that has to span two of them; long synchronous chains where A calls B calls C to serve one request; a shared library that keeps changing because both sides depend on it; and the same data being updated in two places.

**Communication style follows from the boundary.** Synchronous when the caller genuinely needs the answer now, and then you own its latency and availability. Asynchronous events when the other side just needs to know something happened — which decouples availability and is usually right for cross-capability notification.

**Start coarse.** Fewer, larger services are far easier to work with than many small ones, and splitting a service later is much cheaper than merging two that should never have been separate. When unsure, put it on one side and move it when the pain is measurable.

## Why it matters

It's the decision behind most of the pain in service-oriented systems: wrong boundaries produce chatty calls, distributed transactions and cross-team coordination on every feature. In interviews it's the natural follow-up to any microservices answer, and the data-ownership rule is a short, concrete test you can apply out loud to your own diagram.

## Key points

- Split by business capability; splitting by technical layer gives you a monolith with network hops.
- One writer per piece of data — everyone else reads via API or events.
- The same noun means different things in different contexts; translate at the boundary rather than unifying.
- Test boundaries against your roadmap: if most changes cross a line, the line is wrong.
- Services that must deploy together, or that need a transaction between them, are one service.
- Use synchronous calls only when the caller needs the answer now; otherwise publish an event.
- Start with fewer, coarser services — splitting later is much cheaper than merging.
