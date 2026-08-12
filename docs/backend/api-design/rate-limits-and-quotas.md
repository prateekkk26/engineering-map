---
title: Rate Limits & Quotas
summary: Choosing what to limit, what to key it on, and how to tell a client it was limited in a way its retry logic can respect.
level: core
minutes: 25
order: 7
tags: [api, reliability, abuse]

related:
  - system-design/scalability/rate-limiting-and-backpressure
  - ai/working-with-the-api/rate-limits-and-retries
  - backend/async-work/retries-backoff-and-dead-letters

resources:
  - title: Rate limiting rules
    url: https://developers.cloudflare.com/waf/rate-limiting-rules/
    source: Cloudflare
    type: docs
    minutes: 20
  - title: Rate limiting
    url: https://stripe.com/blog/rate-limiters
    source: Stripe
    type: article
    minutes: 20
    primary: true
  - title: RateLimit header fields for HTTP
    url: https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers
    source: IETF
    type: docs
    minutes: 15
---

## In one line

A rate limit is a statement about *whose* traffic you are willing to drop first, so the key you count on matters more than the algorithm you count with.

## What it is

Four algorithms, in ascending order of how often you should reach for them. A **fixed window** (1000 requests per minute per key) is one counter and one `INCR`, and it allows a double burst across the boundary. A **sliding window** smooths that by weighting the previous window, which is what most production limiters actually do. A **token bucket** refills at a steady rate up to a burst capacity, so it permits short spikes while bounding the average — the right default for user-facing APIs. A **leaky bucket** enforces a strictly even output rate, which suits an outbound worker calling someone else's API more than an inbound endpoint.

**The key is the design decision.** Limiting by IP punishes offices and mobile carriers behind one NAT and does nothing against a botnet. Limiting by API key or user ID is fair and requires authentication to have already happened — so unauthenticated endpoints (login, signup, password reset) still need an IP-plus-endpoint limit, and those are exactly the endpoints attackers target. Real systems run several limits at once: per user, per endpoint class, per tenant, and a global one that exists purely to keep the service alive.

Separate **rate limits** (requests per second, protecting the system now) from **quotas** (units per month, protecting revenue and cost). For an AI product the second one usually isn't requests at all — it is tokens or dollars, and a per-request limiter won't stop one user streaming a hundred thousand tokens.

Tell the client what happened. Return `429` with `Retry-After`, and ideally the `RateLimit` headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`) so a well-behaved client can pace itself before being rejected. State in the response body which limit was hit — per-user or per-org — because "you are rate limited" with no dimension is unactionable.

Enforce as far out as you can: an edge or gateway limiter costs you nothing per rejected request, while an in-process one has already paid for TLS, parsing and auth. In-process limiters also need shared state — a Redis counter, not a per-instance map, or your effective limit multiplies by your replica count.

## Why it matters

Every API design round eventually asks "how do you stop one client taking the service down", and the strong answer names the key, the algorithm, and the client-facing signal. It is also standard AI-product engineering: model calls are expensive enough that an unmetered endpoint is a billing incident.

## Key points

- Token bucket is the sensible default: bounded average with room for a burst.
- Fixed windows allow a 2× burst across the boundary; sliding windows exist to fix exactly that.
- The dimension you key on decides who suffers — IP is a blunt instrument, user or tenant is fair but requires auth first.
- Unauthenticated endpoints need their own limits, because that's where credential stuffing goes.
- Quotas (tokens, dollars, per month) are a different control from rate limits (requests per second); AI features need both.
- `429` plus `Retry-After` and `RateLimit-*` headers turn limiting into something clients can cooperate with.
- A limiter with per-instance state doesn't limit anything — the counter has to be shared.
