---
title: Hot Keys & Load Imbalance
summary: Why an evenly sharded system still ends up with one machine at 100% — celebrity users, viral content, and the fixes for each.
level: core
minutes: 20
order: 5
tags: [scalability, performance, caching]

related:
  - data/scaling-data/hot-rows-and-write-contention
  - system-design/scalability/sharding-and-partitioning
  - system-design/classic-problems/design-a-news-feed

resources:
  - title: Scaling Memcache at Facebook
    url: https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf
    source: USENIX NSDI
    type: article
    minutes: 45
  - title: Best Practices for Designing Partition Keys
    url: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html
    source: AWS
    type: docs
    minutes: 20 # unverified
  - title: The Tail at Scale
    url: https://research.google/pubs/the-tail-at-scale/
    source: Dean & Barroso / Google
    type: article
    minutes: 30
    primary: true
---

## In one line

Real traffic follows a power law, so partitioning by a key that's uniformly *distributed* still produces shards that are wildly unequally *loaded*.

## What it is

Sharding assumes traffic spreads with the data. It doesn't. A hundred million users partitioned by `user_id` are perfectly balanced by row count, and then one celebrity account with forty million followers lands on shard 7 and shard 7 falls over. Same shape everywhere: a viral post, a flash-sale product, a single enterprise tenant that's a thousand times the size of the median, a partition key of "today" that takes every write.

**Detect it before designing for it.** Per-key request counters, sampled top-N tracking at the cache or proxy layer, or per-shard utilisation compared against the fleet median. A design answer that includes "here's how I'd know which key is hot" is much stronger than one that just proposes a fix.

**Fixes for hot *reads*.** Cache the hot key aggressively — the skew that causes the problem also means a tiny cache absorbs most of it. Add a small local in-process cache in front of the shared cache, which removes even the network hop for the top few keys. Replicate the hot key to several shards and read from a random one. For genuinely extreme cases, promote the item to the CDN.

**Fixes for hot *writes*.** Key salting: shard by `key + random(0..N)` so writes spread across N sub-keys, then merge on read. Aggregate instead of updating — insert events and roll up, rather than incrementing one row. Batch or coalesce updates in a window. Move the counter to Redis and flush periodically.

**Fixes at the design level.** Handle celebrities as a different case entirely: the standard feed answer is fan-out-on-write for normal users and fan-out-on-read for high-follower accounts, precisely because writing to forty million inboxes is not viable. Naming that hybrid is one of the highest-value things you can say in a feed design.

**Watch out for time-based keys.** Partitioning by date puts 100% of writes on the newest partition. Fine if the goal was cheap archival, bad if the goal was write throughput.

## Why it matters

This is the follow-up to every sharding answer, and it's where a plausible design meets real traffic. It's also a genuine production failure class: uniform partitioning plus power-law traffic is why a system that looked balanced in staging has one node pegged in production. In AI products the same shape appears as one tenant sending most of the tokens.

## Key points

- Uniform key distribution does not imply uniform load; real access follows a power law.
- Instrument per-key traffic and per-shard utilisation, so you can name the hot key before you fix it.
- Skew helps you on reads: a very small cache absorbs a very large share of hot-key traffic.
- Local in-process caching in front of the shared cache removes the network hop for the top keys.
- Replicating a hot read key across shards lets you spread reads randomly.
- Salt hot write keys into N sub-keys and merge on read, or switch from update to insert-and-aggregate.
- Handle celebrity cases as a separate path — hybrid fan-out is the standard feed answer.
- Date-based partition keys concentrate all writes on the newest partition by construction.
