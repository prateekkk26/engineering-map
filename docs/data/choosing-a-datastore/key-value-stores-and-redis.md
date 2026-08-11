---
title: Key-Value Stores & Redis
summary: What Redis is genuinely good at — caching, rate limits, queues, ephemeral state — and why it is a bad primary database.
level: core
minutes: 20
order: 2
tags: [data, redis, caching]

related:
  - _shared/caching
  - data/scaling-data/hot-rows-and-write-contention
  - data/choosing-a-datastore/relational-vs-document

resources:
  - title: Redis Data Types
    url: https://redis.io/docs/latest/develop/data-types/
    source: Redis
    type: docs
    minutes: 25
    primary: true
  - title: Redis Persistence
    url: https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/
    source: Redis
    type: docs
    minutes: 15
  - title: How to do distributed locking
    url: https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
    source: Martin Kleppmann
    type: article
    minutes: 20
---

## In one line

Redis is an in-memory data structure server: microsecond access to strings, hashes, sorted sets and streams, at the price of everything fitting in RAM.

## What it is

The value is that it is not just a key-value map. **Sorted sets** give you leaderboards, sliding-window rate limiters and priority queues. **Hashes** hold small objects field-addressably. **Streams** are an append-only log with consumer groups — a real queue with acknowledgement and replay. **Sets** do membership and deduplication. **`INCR` with `EXPIRE`** is a rate limiter in two commands. Everything is single-threaded for command execution, so operations are atomic without you doing anything, and Lua scripts or `MULTI` make multi-key sequences atomic too.

The jobs it does well: **caching** (with TTLs and an eviction policy), **rate limiting**, **session and ephemeral state**, **job queues** (via streams or lists, or a library like BullMQ), **pub/sub fan-out** for realtime, and **short-lived coordination** like locks and idempotency keys.

**Why it is a poor primary store.** The dataset must fit in memory, which is expensive and hard-capped. Persistence is a spectrum, not a guarantee: RDB snapshots lose everything since the last snapshot, AOF with `everysec` loses up to a second, and the default failover is asynchronous, so an acknowledged write can be lost when a replica is promoted. There are no joins, no secondary indexes worth the name, and no constraints. Redis is the right place for data you can rebuild, and the wrong place for the only copy of anything.

Two specifics worth carrying. **Distributed locks with Redis are not safe by default** — the Redlock debate is worth knowing about; a lock without a fencing token can be held by two clients after a pause or a failover, so don't protect money with one. And **eviction policy is a decision**: with `noeviction` a full cache starts erroring writes, with `allkeys-lru` it silently discards data — the right choice depends on whether you are running a cache or a store, and if you can't answer that, you have a design problem.

Note also that Redis licensing changed in 2024 and Valkey is the community fork; for interview purposes they are interchangeable.

## Why it matters

Redis appears in nearly every production architecture and in most design rounds, usually as "add a cache". The senior differentiator is naming the failure modes — what happens when it is full, when it fails over, when the cache is cold — and picking the right data structure rather than serialising JSON into a string.

## Key points

- Redis's advantage is data structures with atomic operations, not merely being a fast map.
- Sorted sets and `INCR`+`EXPIRE` implement leaderboards and rate limiters in a couple of commands.
- Commands are atomic because execution is single-threaded; multi-key atomicity comes from `MULTI` or Lua.
- Persistence is best-effort: RDB loses the window since the last snapshot, AOF `everysec` loses about a second.
- Replication is asynchronous by default, so an acknowledged write can vanish on failover — never store the only copy.
- Eviction policy is an explicit decision; `noeviction` fails writes, `allkeys-lru` drops data silently.
- Redis locks need fencing tokens to be safe; don't guard financial operations with a bare lock.
