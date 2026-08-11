---
title: Clocks & Ordering
summary: Why wall-clock timestamps can't order events across machines, and what to use instead — logical clocks, vector clocks and monotonic IDs.
level: deep
minutes: 20
order: 5
tags: [distributed-systems, ordering, time]

related:
  - system-design/distributed-systems/consistency-models
  - system-design/classic-problems/design-a-url-shortener
  - system-design/distributed-systems/replication-and-quorums

resources:
  - title: Time, Clocks, and the Ordering of Events in a Distributed System
    url: https://lamport.azurewebsites.net/pubs/time-clocks.pdf
    source: Leslie Lamport
    type: article
    minutes: 40
  - title: There Is No Now
    url: https://queue.acm.org/detail.cfm?id=2745385
    source: ACM Queue
    type: article
    minutes: 25
    primary: true
  - title: Announcing Snowflake
    url: https://blog.x.com/engineering/en_us/a/2010/announcing-snowflake
    source: Twitter Engineering
    type: article
    minutes: 10 # unverified
---

## In one line

Two machines never agree exactly on the time, so any correctness argument that relies on comparing their timestamps is wrong — order events by causality or by a coordinated ID scheme instead.

## What it is

**Why wall clocks fail.** NTP keeps machines within milliseconds to tens of milliseconds of each other, usually. Clocks drift, get stepped backwards by corrections, and leap seconds have caused real outages. So `timestamp_a < timestamp_b` does not reliably mean A happened first, and last-write-wins conflict resolution based on wall clocks silently discards writes. Also: use a **monotonic** clock for measuring elapsed time — a wall-clock correction mid-measurement can produce a negative duration, which is a real bug people ship.

**Lamport clocks.** Each node keeps a counter, increments it on every event, and attaches it to messages; a receiver sets its counter to `max(local, received) + 1`. This guarantees that if A causally happened before B, then `L(A) < L(B)`. The converse does not hold — a smaller counter doesn't prove causality — so Lamport clocks give you a consistent total order, not the ability to detect concurrency.

**Vector clocks.** One counter per node, so you can compare two events and tell whether one preceded the other or they were **concurrent**. That's what you need to detect conflicts rather than silently resolve them — the Dynamo model surfaces concurrent versions as siblings for the application to merge. The cost is size proportional to the number of nodes.

**Hybrid logical clocks and TrueTime.** HLCs combine physical time with a logical counter, so timestamps are close to real time and still respect causality. Google's Spanner takes the other approach: expensive hardware makes clock *uncertainty* bounded and explicit, and transactions wait out the uncertainty window to get globally consistent snapshots. Both are worth knowing by name.

**Ordered IDs, the practical version.** Most product engineering needs "a unique ID that roughly sorts by creation time" rather than a full causality theory. Snowflake-style IDs — timestamp bits, machine ID bits, sequence bits — give 64-bit, roughly time-ordered, coordination-free identifiers. UUIDv7 is the standardised modern equivalent and the right default; UUIDv4 is random and destroys index locality, which is a real write-performance issue in Postgres.

## Why it matters

It's the theory under several practical questions that do get asked: how you generate IDs at scale, why last-write-wins loses data, and how a system knows which of two conflicting updates is newer. Interviewers reach for it as a follow-up to multi-leader replication or ID generation, and the honest answer — "you can't trust their clocks, so here's what I'd order by instead" — is short and specific.

## Key points

- Clocks on different machines disagree and can jump backwards; comparing them is not a valid ordering.
- Measure elapsed time with a monotonic clock, never with wall-clock differences.
- Lamport clocks preserve causal order but can't distinguish concurrent events.
- Vector clocks can detect concurrency, at a size cost proportional to node count.
- Last-write-wins by wall clock silently loses writes — say so whenever it's proposed.
- Hybrid logical clocks approximate real time while respecting causality; Spanner instead bounds and waits out clock uncertainty.
- Snowflake-style or UUIDv7 IDs give time-sortable uniqueness without coordination.
- UUIDv4 primary keys destroy index locality; prefer UUIDv7 or a sequence.
