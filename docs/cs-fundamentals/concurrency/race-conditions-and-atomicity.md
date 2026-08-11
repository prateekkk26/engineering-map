---
title: Race conditions and atomicity
summary: Bugs whose existence depends on timing, why single-threaded JavaScript has them anyway, and what makes an operation safe to interleave.
level: core
minutes: 25
order: 2
tags: [concurrency, correctness, fundamentals]

related:
  - cs-fundamentals/concurrency/locks-deadlock-and-contention
  - _shared/concurrency-models
  - frontend/state-and-data/optimistic-updates-and-rollback

resources:
  - title: Race condition
    url: https://en.wikipedia.org/wiki/Race_condition
    source: Wikipedia
    type: docs
    minutes: 15
  - title: Time-of-check to time-of-use
    url: https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use
    source: Wikipedia
    type: docs
    minutes: 10
  - title: AbortController
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
    source: MDN
    type: docs
    minutes: 15
    primary: true
  - title: Transaction isolation levels
    url: https://www.postgresql.org/docs/current/transaction-iso.html
    source: PostgreSQL
    type: docs
    minutes: 25
---

## In one line

A race condition exists when the correctness of a result depends on the relative timing of operations that the system is free to interleave in any order.

## What it is

The classic shape is **read-modify-write**. Two actors read a counter at 5, both add one, both write 6, and one increment vanished. Nothing is wrong with either actor in isolation; the bug lives in the gap between the read and the write. The general form is **time-of-check to time-of-use**: you check that a file exists, a username is free, or a balance is sufficient, and act on that check after it may have stopped being true. TOCTOU is also a security bug class, not just a correctness one.

The common belief that single-threaded JavaScript is immune is wrong, and understanding why is the interesting part. What JavaScript guarantees is that a synchronous block runs to completion without interleaving — no torn reads, no need for mutexes on a plain variable. But every `await` is a yield point. Between the two halves of an async function, arbitrary other code runs. So the interleaving is coarser and deterministic per run, but the race is real, and it produces very familiar bugs: a `useEffect` fetch whose slow response arrives after a fast later one and overwrites fresh data with stale; a "check then create" that double-creates because two clicks both passed the check; a component that sets state after unmount; a debounce that fires against a changed input.

The fixes are the same family everywhere. **Make the operation atomic** so there is no gap: `UPDATE counter SET n = n + 1` instead of select-then-update, a database unique constraint instead of a "does this email exist" check, `Atomics.add` on a `SharedArrayBuffer`, or an upsert. **Serialise access** with a lock, a queue, or a single owner of the state. **Detect and retry** with optimistic concurrency: attach a version number or ETag, and reject the write if it changed underneath you — this is what `If-Match` and Postgres' `SERIALIZABLE` isolation do. **Make it idempotent** so a duplicate is harmless.

In frontend code specifically, the everyday tools are `AbortController` to cancel superseded requests, a request-id or sequence check so only the latest response is applied, disabling a submit button while in flight, and a client-generated idempotency key on mutations so a retried POST does not create two orders.

## Why it matters

Stale-response overwrites and double-submits are two of the most common real bugs in React applications, and both are races. In a take-home or practical round, cancelling in-flight requests and guarding against double submission is a visible senior signal — reviewers explicitly score whether loading, error, and race handling were considered rather than only the happy path.

## Key points

- A race is a correctness dependency on timing; read-modify-write and check-then-act are the two shapes it almost always takes.
- Single-threaded JavaScript still races, because every `await` is a yield point where other code runs.
- Out-of-order async responses overwriting fresh state is the canonical frontend race, and it needs cancellation or a sequence check.
- The strongest fix is atomicity — one operation with no gap, such as a database-side increment or a unique constraint.
- Optimistic concurrency with a version or ETag turns a lost update into a detectable conflict you can retry or surface.
- Idempotency keys make duplicate submissions harmless, which is more robust than trying to prevent them client-side.
- TOCTOU is a security bug class too: validating and then acting on a mutable resource is exploitable, not just flaky.
- Races are non-deterministic by nature, so "it passed locally" proves nothing — reason about the interleaving instead of testing for it.
