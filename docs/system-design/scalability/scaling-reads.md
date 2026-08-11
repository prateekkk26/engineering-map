---
title: Scaling Reads
summary: Replicas, caches and precomputation — the three ways to serve more reads, and the staleness each one introduces.
level: core
minutes: 20
order: 3
tags: [scalability, caching, replication]

related:
  - _shared/caching
  - data/scaling-data/replication-and-read-replicas
  - system-design/distributed-systems/consistency-models

resources:
  - title: Caching Strategies and How to Choose the Right One
    url: https://codeahoy.com/2017/08/11/caching-strategies-and-how-to-choose-the-right-one/
    source: CodeAhoy
    type: article
    minutes: 20
  - title: Scaling Memcache at Facebook
    url: https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf
    source: USENIX NSDI
    type: article
    minutes: 45
    primary: true
  - title: High Availability — PostgreSQL Replication
    url: https://www.postgresql.org/docs/current/high-availability.html
    source: PostgreSQL
    type: docs
    minutes: 25
---

## In one line

Most systems are read-heavy, and there are only three answers — copy the data (replicas), keep it closer (caches), or compute it in advance (materialised views) — each paying in staleness.

## What it is

**Read replicas.** Stream the primary's changes to copies and send reads there. Nearly free in operational terms with managed databases, and it scales linearly-ish. The cost is **replication lag** — usually milliseconds, seconds under load — which produces the classic bug: a user updates their profile, is redirected, reads from a replica, and sees the old value. The fixes are all forms of routing: send reads to the primary inside a short window after a write, or route by session, or read your own writes from the primary and everything else from replicas. Say that out loud; it's the follow-up every time.

**Caching.** A cache in front of the database absorbs the hot subset — and access is almost always skewed, so a small cache takes a large share of traffic. The decisions are the pattern (cache-aside is the default), the TTL, and how invalidation works. Three failure modes worth naming: **stampede** (a hot key expires and a thousand requests hit the database at once — fix with a lock or stale-while-revalidate), **penetration** (repeated misses for keys that don't exist — cache the negative result), and the fact that a cache which the system can't survive losing is not a cache, it's a database with no durability.

**Precomputation.** If the read is expensive and the data changes rarely, compute it on write instead. Materialised views, denormalised counters, a fan-out-on-write feed. Reads become a single key lookup; writes get more expensive and the derived data can be wrong until the job that maintains it catches up.

**Choosing between them.** Replicas when the query is fine but there are too many. Caching when the same small set of results is requested repeatedly. Precomputation when the query itself is expensive and the answer is reused. Most real systems use all three at different layers, and the layering — browser, CDN, application cache, database — is worth drawing explicitly, because each layer has its own TTL and its own invalidation story.

**The precondition for all three:** an explicit answer to "how stale can this be?" Without that number, none of these decisions can be made, which is why it's in the scoping list.

## Why it matters

Read scaling is the most common actual scaling work in product engineering, and every option trades consistency for throughput. Interviewers push on exactly that trade: what does the user see when the replica lags, when the cache is stale, when the precomputed view hasn't caught up. Having a specific answer per layer is the difference between "we'd add a cache" and a design.

## Key points

- Read-heavy is the normal case; replicas, caches and precomputation are the only three levers.
- Replication lag breaks read-your-own-writes — route post-write reads to the primary.
- Access is skewed, so a small cache absorbs a disproportionate share of reads.
- Guard against stampedes with a lock or stale-while-revalidate on hot key expiry.
- Cache negative results too, or missing-key lookups pass straight through every time.
- Precomputation moves cost from read to write and makes the derived data eventually correct, not correct.
- Every caching layer needs its own stated TTL and invalidation path.
- None of these decisions can be made without an explicit staleness budget from the requirements.
