---
title: Distributed Transactions & Sagas
summary: What to do when one operation must change state in several services — why 2PC is usually the wrong answer, and how compensation works instead.
level: core
minutes: 25
order: 7
tags: [distributed-systems, transactions, architecture]

related:
  - system-design/distributed-systems/idempotency-and-delivery-semantics
  - system-design/architecture-decisions/drawing-service-boundaries
  - data/scaling-data/outbox-and-dual-write-consistency

resources:
  - title: Saga Pattern
    url: https://microservices.io/patterns/data/saga.html
    source: Chris Richardson
    type: article
    minutes: 20
    primary: true
  - title: Life Beyond Distributed Transactions — An Apostate's Opinion
    url: https://www.ics.uci.edu/~cs223/papers/cidr07p15.pdf
    source: Pat Helland
    type: article
    minutes: 45
  - title: Transactional Outbox Pattern
    url: https://microservices.io/patterns/data/transactional-outbox.html
    source: Chris Richardson
    type: article
    minutes: 15
---

## In one line

Across service boundaries you can't have a transaction, so you break the operation into steps that each commit locally and define a compensating action for every step that might need undoing.

## What it is

**Two-phase commit, and why it's rare.** A coordinator asks every participant to prepare, then tells them all to commit. It gives real atomicity — and it holds locks across the whole protocol, so one slow participant stalls everyone, and if the coordinator dies after prepare, participants sit locked and undecided. Availability is the product of every participant's availability. It exists (XA, and inside some databases), and in service-oriented systems it's almost always the wrong choice. Say that, and say why.

**Sagas.** A sequence of local transactions, each publishing an event or invoking the next step. If step 4 fails, run compensating transactions for steps 3, 2, 1 in reverse. Order placement: reserve inventory → charge card → create shipment. If shipment creation fails: refund the charge, release the inventory.

**Compensation is not rollback.** The intermediate state was visible — the customer may have seen the charge, the inventory was genuinely unavailable to others. Compensation is a *new* business action that corrects things, so it has to be a legitimate business operation: a refund, not the erasure of a payment. Some things cannot be compensated at all (an email was sent), which means ordering the steps matters: do the reversible and the risky things first, the irreversible things last.

**Orchestration versus choreography.** *Orchestration* — a central saga coordinator calls each step and knows the whole flow. Easy to reason about, easy to observe, and a component that must be made reliable. *Choreography* — each service reacts to events with no central brain. Loosely coupled, and the overall flow exists nowhere in the code, which makes debugging painful past three steps. For anything non-trivial, orchestration is the better default and the easier one to defend.

**What sagas require.** Every step and every compensation must be **idempotent**, because they will be retried. State must be persisted so the saga survives a crash mid-flow. There's no isolation — other transactions can observe intermediate states, so you may need semantic locks (an order in `pending` state) to stop concurrent operations acting on half-finished work. And you need a plan for a compensation that itself fails, which usually means retry with alerting and a manual path.

**The best answer is often to avoid the problem.** If two things must change atomically, that's strong evidence they belong in the same service and the same database. A saga is the price of a service boundary drawn across a transaction.

## Why it matters

It's the direct consequence of splitting a system into services, so it follows every microservices discussion, and it's the standard follow-up to "what if the payment succeeds and the inventory update fails." Being able to describe a compensating flow, name the idempotency requirement, and then observe that the boundary itself might be wrong is a genuinely senior sequence.

## Key points

- 2PC gives atomicity by holding locks across services and multiplying failure modes — rarely the right choice.
- A saga is local transactions plus compensating actions, applied in reverse on failure.
- Compensation is a new business action, not a rollback; intermediate states were visible to users.
- Order steps so irreversible actions happen last, because some steps cannot be compensated at all.
- Orchestration keeps the flow in one observable place; choreography scatters it and gets hard past three steps.
- Every step and compensation must be idempotent, and saga state must survive a crash.
- Sagas have no isolation — use semantic locks like a `pending` status to guard partial state.
- Two things that must change atomically are evidence the service boundary is in the wrong place.
