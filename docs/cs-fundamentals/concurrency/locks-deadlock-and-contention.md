---
title: Locks, deadlock, and contention
summary: Mutual exclusion is the blunt fix for shared state, and it introduces its own failure modes — deadlock, contention, and lost throughput.
level: deep
minutes: 20
order: 3
tags: [concurrency, correctness, fundamentals]

related:
  - cs-fundamentals/concurrency/race-conditions-and-atomicity
  - cs-fundamentals/operating-systems/scheduling-and-context-switching
  - cs-fundamentals/concurrency/backpressure-and-bounded-queues

resources:
  - title: Deadlock
    url: https://en.wikipedia.org/wiki/Deadlock_(computer_science)
    source: Wikipedia
    type: docs
    minutes: 20
    primary: true
  - title: Explicit locking in PostgreSQL
    url: https://www.postgresql.org/docs/current/explicit-locking.html
    source: PostgreSQL
    type: docs
    minutes: 30
  - title: Amdahl's law
    url: https://en.wikipedia.org/wiki/Amdahl%27s_law
    source: Wikipedia
    type: docs
    minutes: 15
  - title: Distributed locks and the Redlock debate
    url: https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
    source: Martin Kleppmann
    type: article
    minutes: 30
---

## In one line

A lock makes a section of code mutually exclusive so only one actor executes it at a time, trading throughput and a set of new failure modes for the disappearance of races.

## What it is

The basic primitive is a **mutex**: acquire, do the critical section, release. Variants exist for different access patterns — a **read-write lock** allows many concurrent readers but one exclusive writer, useful when reads dominate; a **semaphore** allows up to N holders, which is how you cap concurrency rather than serialise it. Databases expose the same ideas as row-level and table-level locks, and `SELECT ... FOR UPDATE` is a lock you take deliberately.

**Deadlock** happens when actors hold locks and wait for each other in a cycle. It requires four conditions simultaneously — mutual exclusion, hold-and-wait, no preemption, and circular wait — and breaking any one prevents it. The practical rule is to break circular wait by imposing a **consistent lock ordering**: if everyone always locks accounts in ascending id order, no cycle can form. The others matter too: acquire-all-or-none avoids hold-and-wait, and timeouts introduce preemption, turning a permanent hang into a retryable error. Postgres detects deadlocks and kills one transaction, which is why "deadlock detected" appears in logs of applications that update multiple rows in inconsistent order.

**Livelock** is the sibling: actors keep responding to each other and making no progress. **Starvation** is one actor never acquiring the lock because others keep taking it first.

The subtler cost is **contention**. A lock everyone wants serialises the program, and Amdahl's law says the serial fraction bounds your speedup no matter how many cores you add — 5% serial caps you at 20×. Symptoms are throughput that stops improving, or falls, as you add workers. The fixes are all about holding less: shrink the critical section, shard the lock so different keys use different locks, use lock-free atomics for simple counters, or restructure so each actor owns its own state and communicates by message. Never do I/O inside a lock — an HTTP call holding a mutex converts a network hiccup into a system-wide stall.

Distributed locks deserve a warning. A lock across machines cannot be made both safe and live in the presence of network partitions and process pauses; a GC pause can leave you believing you hold a lease you have lost. Prefer designs that do not need one — idempotency, fencing tokens, or a single owner per key.

## Why it matters

Even in JavaScript, where you rarely write a mutex, this vocabulary is what you need for the database half of the job: `FOR UPDATE`, deadlock errors from inconsistent update order, and connection-pool exhaustion are all lock problems. It is also the standard follow-up when a system design answer proposes shared mutable state — "what happens when two workers do that at once".

## Key points

- A mutex serialises a critical section; a semaphore caps concurrency at N; a read-write lock optimises for read-heavy access.
- Deadlock needs mutual exclusion, hold-and-wait, no preemption, and circular wait together — breaking any one is enough.
- Consistent lock ordering is the practical deadlock fix, and inconsistent multi-row update order is the usual real cause.
- Timeouts convert a deadlock into a retryable failure, which is a far better production outcome than a permanent hang.
- Contention, not correctness, is usually what bites: Amdahl's law caps speedup at the reciprocal of the serial fraction.
- Shrink critical sections, shard locks by key, or give each actor exclusive ownership instead of taking a bigger lock.
- Never hold a lock across I/O; a slow network call inside a critical section stalls everything waiting on it.
- Distributed locks are not safely achievable under partitions and pauses — prefer idempotency or fencing tokens.
