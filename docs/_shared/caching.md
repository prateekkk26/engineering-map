---
title: Caching Strategies
summary: The read/write patterns behind every cache, and the consistency you trade away for each.
level: core
minutes: 25
tags: [caching, performance, distributed-systems]

# Shared topics declare where they should surface. They live once, appear in many.
surfaced_in:
  - frontend/performance
  - backend/api-design
  - data/postgres-in-depth
  - system-design/building-blocks

related:
  - _shared/cache-invalidation

resources:
  - title: Caching best practices
    url: https://aws.amazon.com/caching/best-practices/
    source: AWS
    type: article
    minutes: 15
    primary: true
  - title: HTTP caching
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
    source: MDN
    type: docs
    minutes: 20
  - title: Scaling Memcache at Facebook
    url: https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170.pdf
    source: USENIX NSDI '13
    type: article
    minutes: 45
---

## In one line

Every cache is a bet that stale data is cheaper than a slow answer, and the strategy you pick decides how stale and how slow.

## What it is

A cache is a faster copy of data that lives closer to the reader. The interesting part isn't storage — it's the read and write patterns, because those determine what happens on a miss and how long a wrong answer can survive.

**Cache-aside** (lazy loading) is the default. The application checks the cache; on a miss it reads the source, writes the result into the cache, and returns it. The cache only holds what's actually been asked for, and a cache failure degrades to a slow path rather than an outage. The cost is that every miss pays full latency, and a cold cache after a restart is a thundering herd waiting to happen.

**Read-through** moves that logic into the cache layer itself, so the application only talks to the cache. Cleaner call sites; less control over the miss path.

**Write-through** writes to the cache and the store together, so the cache is never stale. Reads are always fresh; writes are always slower, and you pay to cache data nobody may ever read.

**Write-behind** (write-back) writes to the cache and flushes to the store asynchronously. Fast writes, and a real risk of data loss if the cache dies before the flush. Appropriate for metrics and counters, rarely for anything you'd be sad to lose.

Layered on top of the pattern is **eviction** — LRU by default, LFU when access is skewed, TTL when staleness has a hard bound — and the fact that most systems run several caches at once: browser, CDN, application, database buffer pool. Each layer has its own copy and its own staleness window, and debugging means knowing which one lied to you.

## Why it matters

Caching shows up in almost every system design round, and the shallow version — "we'll add Redis" — doesn't survive follow-up questions. The senior signal is naming the specific pattern, the consistency you're giving up, and what happens the moment the cache goes down or comes back empty.

It's also one of the highest-leverage real-world levers you have: the difference between a 200ms and a 5ms response is usually a cache, and the difference between a working system and a 3am incident is usually a cache stampede nobody planned for.

## Key points

- Cache-aside is the right default: the cache holds only what's asked for, and a cache outage degrades to slow rather than broken.
- Write-through buys freshness with write latency, and caches data that may never be read. Only worth it on read-heavy data that must not be stale.
- Write-behind is the fastest and the only one that can lose data — reserve it for things you'd tolerate losing.
- A cold cache is a load-bearing failure mode: a restart or mass eviction sends full traffic at the origin. Mitigate with request coalescing, staggered TTLs, or pre-warming.
- Concurrent misses on the same hot key can stampede the origin — a single-flight lock or probabilistic early refresh is the standard fix.
- TTL is a staleness budget, not a performance knob. Set it from how wrong the data is allowed to be, then tune performance elsewhere.
- Most requests pass through several independent caches. When debugging stale data, identify the layer before changing anything.

<!-- This topic is an example of the _shared/ mechanism: caching is genuinely owned by
     frontend, backend, data, and system design. It exists once here and surfaces in all
     four via `surfaced_in`. See docs/_meta/CONVENTIONS.md § 1. -->
