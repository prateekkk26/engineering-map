---
title: Rate Limiting & Backpressure
summary: Protecting a system from more load than it can serve — the four algorithms, where the counter lives, and what the client should do about it.
level: core
minutes: 20
order: 6
tags: [scalability, reliability, api]

related:
  - system-design/classic-problems/design-a-rate-limiter
  - cs-fundamentals/concurrency/backpressure-and-bounded-queues
  - system-design/reliability-and-operations/graceful-degradation-and-load-shedding

resources:
  - title: Rate Limiting
    url: https://redis.io/glossary/rate-limiting/
    source: Redis
    type: article
    minutes: 15
  - title: How We Built Rate Limiting Capable of Scaling to Millions of Domains
    url: https://blog.cloudflare.com/counting-things-a-lot-of-different-things/
    source: Cloudflare
    type: article
    minutes: 25
  - title: Using Load Shedding to Avoid Overload
    url: https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/
    source: AWS Builders' Library
    type: article
    minutes: 25
    primary: true
---

## In one line

Rate limiting rejects excess work at the edge so the system degrades predictably instead of collapsing, and backpressure is the same idea applied inward, between your own components.

## What it is

**The algorithms**, in the order you'd consider them:

*Fixed window* — count per key per minute, reset on the boundary. Trivial, and allows a 2× burst straddling the boundary.

*Sliding window log* — timestamps in a sorted set, count those inside the window. Exact, and memory grows with request volume.

*Sliding window counter* — weight the previous window's count by how far into the current one you are. Approximate, cheap, and the usual production choice.

*Token bucket* — tokens refill at a steady rate up to a cap; each request takes one. Allows controlled bursts, which is what real APIs want, and it's two numbers in Redis. **This is the default answer.** Leaky bucket is its sibling, smoothing output at a fixed rate rather than allowing bursts.

**Where the state lives.** Per-instance counters are cheap and wrong — with ten instances, an "N per minute" limit is really 10N. Shared counters in Redis with an atomic increment (or a small Lua script for check-and-decrement) are the standard. At very high volume you approximate: let each instance hold a local budget synced periodically, and accept some slop.

**What to return.** `429 Too Many Requests`, with `Retry-After` and the `RateLimit-*` headers so clients don't have to guess. Rate limits that clients can't discover produce retry storms.

**Limit on the right dimension.** Per API key, per user, per IP, per tenant, per endpoint — and for expensive endpoints, per unit of *cost* rather than per request. In AI products this matters concretely: limiting requests per minute is nearly meaningless when one request can be a hundred tokens or a hundred thousand, so tokens per minute is the real limit.

**Backpressure** is the internal version. Bounded queues everywhere: when a queue is full, the producer blocks or sheds rather than buffering without limit until memory runs out. Unbounded buffering doesn't prevent failure, it delays it and makes it worse — latency climbs while work piles up that will be too stale to matter by the time it's processed. Shedding the excess quickly is better than serving everything slowly.

## Why it matters

Every public API and every LLM-backed feature needs this, and it's a small enough problem to be a full design round on its own (`design-a-rate-limiter`) as well as a component in bigger ones. The senior signals are choosing token bucket for burstiness, knowing the counter must be shared, and pointing out that the limit should be on cost rather than count when requests are unequal.

## Key points

- Token bucket is the sensible default: steady refill, bounded burst, two numbers per key.
- Fixed windows allow a double burst across the boundary; sliding window counter fixes it cheaply.
- Per-instance counters silently multiply your limit by the fleet size — share the counter in Redis.
- Return 429 with `Retry-After` and `RateLimit-*` headers, or you'll cause retry storms.
- Pick the dimension deliberately: user, tenant, IP, endpoint — or cost, when requests are unequal.
- For LLM APIs, tokens per minute is the meaningful limit, not requests per minute.
- Backpressure is bounded queues internally: shed fast rather than buffer without limit.
- Rejecting excess load early keeps latency stable for the requests you do accept.
