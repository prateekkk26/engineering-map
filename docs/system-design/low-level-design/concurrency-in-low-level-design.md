---
title: Concurrency in Low-Level Design
summary: Designing a component several things touch at once — what to make immutable, what to lock, and why the answer in JavaScript is different.
level: deep
minutes: 20
order: 4
tags: [lld, concurrency, correctness]

related:
  - cs-fundamentals/concurrency/race-conditions-and-atomicity
  - cs-fundamentals/concurrency/locks-deadlock-and-contention
  - _shared/concurrency-models

resources:
  - title: Java Concurrency in Practice
    url: https://jcip.net/
    source: Brian Goetz
    type: book
    primary: true
  - title: The Event Loop
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model
    source: MDN
    type: docs
    minutes: 20
  - title: Optimistic Concurrency Control
    url: https://en.wikipedia.org/wiki/Optimistic_concurrency_control
    source: Wikipedia
    type: article
    minutes: 15
---

## In one line

Shared mutable state accessed concurrently is the whole problem — so remove the sharing, remove the mutability, or serialise the access, in that order of preference.

## What it is

**The three moves, cheapest first.**

*Don't share.* Give each unit of work its own copy. Thread-local or per-request state has no coordination cost and no bugs. This solves more problems than people expect.

*Don't mutate.* Immutable objects are safe to read from anywhere with no synchronisation. Return copies rather than internal references, and build new values instead of editing in place. In TypeScript, `readonly` and `Readonly<T>` document the intent and catch accidental writes.

*Serialise what's left.* Only when state genuinely must be shared and mutable. Then: hold the lock for as short a time as possible, never across I/O, and if you need more than one lock, acquire them in a globally consistent order — inconsistent ordering is the entire cause of deadlock.

**JavaScript is a different world, and saying so is the right answer in these loops.** A single-threaded event loop means no data races on plain objects — but *not* no race conditions. Anything with an `await` in it can be interleaved with other work: two concurrent calls can both read a value, both compute, and both write, losing one update. The fixes are in-flight request deduplication (one promise per key, shared by later callers), sequencing by key, cancellation of superseded work, and checking for staleness after every await. Web Workers reintroduce real parallelism with message passing and no shared memory, which is a much simpler model — and `SharedArrayBuffer` reintroduces the real thing, complete with atomics.

**Optimistic beats pessimistic in most product code.** Rather than locking, read a version number, do the work, and write conditionally on the version being unchanged; retry on conflict. It scales better under low contention, which is the normal case, and it maps cleanly to HTTP (`ETag` / `If-Match`) and to databases.

**Make the concurrency contract explicit.** Every shared component should state whether it's safe to call from multiple contexts and what the caller is responsible for. Undocumented, it will be used wrongly — and the resulting bug will be intermittent and load-dependent, which is the worst kind to diagnose.

**Bound your queues.** An unbounded work queue turns overload into memory exhaustion instead of backpressure. Bound it and decide what happens when it's full — block, drop, or shed.

## Why it matters

`deep` here because these loops don't run threading rounds — but the JavaScript half is genuinely everyday: double-submitted forms, stale responses overwriting fresh ones, two components fetching the same thing. Being able to say "single-threaded doesn't mean race-free, and here's the interleaving" is a differentiator in a frontend deep dive.

## Key points

- Prefer eliminating sharing, then eliminating mutability, and only then locking.
- Hold locks briefly, never across I/O, and always acquire multiple locks in a consistent order.
- JavaScript has no data races on plain objects but plenty of race conditions across `await` points.
- Deduplicate in-flight requests by key so concurrent callers share one promise.
- Re-check for staleness after every await; the world may have moved while you were suspended.
- Optimistic concurrency with a version check beats locking under normal, low-contention load.
- Document every shared component's concurrency contract, or it will be misused.
- Bound queues so overload produces backpressure rather than memory exhaustion.
