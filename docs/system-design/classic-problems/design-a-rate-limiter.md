---
title: Design a Rate Limiter
summary: A whole design round in one small component — algorithm choice, where the counter lives, and what distributed accuracy actually costs.
level: core
minutes: 20
order: 2
tags: [system-design, classic-problem, reliability]

related:
  - system-design/scalability/rate-limiting-and-backpressure
  - system-design/building-blocks/reverse-proxies-and-api-gateways
  - system-design/ai-system-design/multi-tenant-quotas-and-cost-control

resources:
  - title: How We Built Rate Limiting Capable of Scaling to Millions of Domains
    url: https://blog.cloudflare.com/counting-things-a-lot-of-different-things/
    source: Cloudflare
    type: article
    minutes: 25
    primary: true
  - title: Scaling Your API with Rate Limiters
    url: https://stripe.com/blog/rate-limiters
    source: Stripe
    type: article
    minutes: 20
  - title: Rate Limiting with Redis
    url: https://redis.io/glossary/rate-limiting/
    source: Redis
    type: article
    minutes: 15
---

## In one line

Decide per request whether a caller has exceeded their allowance, in under a millisecond, using state shared across every instance.

## What it is

**Scope it first.** What's the limit on — user, API key, IP, tenant, endpoint? Are bursts allowed? Is it a hard limit (reject) or soft (queue/throttle)? Do different tiers get different limits? What's the accuracy requirement — is briefly allowing 105 requests instead of 100 a problem? That last question is the one that determines the architecture, and asking it is the strongest move available in this round.

**Algorithm.** Token bucket: `capacity` and `refill_rate` per key, storing `tokens` and `last_refill`. On each request, lazily refill based on elapsed time, then take a token if available. Bursts up to capacity are allowed, the sustained rate is bounded, and it's two fields per key. Alternatives worth naming in one line each: fixed window (simple, allows a 2× boundary burst), sliding window log (exact, memory grows with traffic), sliding window counter (good approximation, cheap).

**Where the state lives — the real design question.**

*In-process* is a nanosecond and wrong: with N instances the effective limit is N×. Acceptable only as a coarse local safety net *in addition* to a shared limiter.

*Centralised Redis* is the standard answer. One atomic operation per request via a small Lua script (read, refill, decrement, write) so concurrent requests can't both pass. Cost: a network round trip (~0.5ms in-datacentre) on every request, and Redis becomes a dependency on the critical path — so decide now whether you **fail open** (allow requests when Redis is down; availability over protection) or **fail closed** (reject; protection over availability). Most public APIs fail open; anything guarding a cost or a safety limit fails closed. State it explicitly.

*Local budget with async sync* is the answer at very high volume: each instance takes a slice of the allowance locally and reconciles with the shared store periodically. Fast and approximate, which is fine if you established that approximation is acceptable during scoping.

**Sharding by key** falls out naturally — different keys are independent, so hash the key to a Redis shard. Hot keys (one huge tenant) are the exception, and get the usual treatment.

**The response.** 429, `Retry-After`, and `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset`. Without these, clients retry blindly and amplify the problem you're trying to solve.

**Layer it.** A coarse limit at the edge (per IP, cheap, absorbs floods before they cost you anything) and a precise one at the application (per user or per tenant, after authentication — because you can't know the tenant until you've authenticated).

## Why it matters

It's asked as a full 45-minute round precisely because it's small enough that you can't hide: everything is in the details of accuracy, atomicity, failure behaviour and the client contract. It's also directly applicable — every API you'll build needs one, and AI products need it on tokens rather than requests, which is a natural extension the interviewer will often ask for.

## Key points

- Scope the accuracy requirement first; approximate limits permit much cheaper designs.
- Token bucket allows controlled bursts with two fields per key — the sensible default.
- Per-instance counters multiply the limit by fleet size; the counter must be shared.
- The check must be atomic — a Redis Lua script, not read-then-write.
- Decide fail-open versus fail-closed for when the limiter's store is unavailable, and say why.
- At extreme volume, per-instance budgets synced periodically trade accuracy for latency.
- Return 429 with `Retry-After` and `RateLimit-*` headers so clients back off correctly.
- Layer a cheap per-IP edge limit before an authenticated per-tenant limit.
