---
title: CDN & Edge Delivery
summary: Moving bytes and sometimes compute closer to users, and the cache-key and invalidation rules that decide whether it works.
level: core
minutes: 20
order: 3
tags: [performance, caching, networking]

related:
  - _shared/caching
  - cs-fundamentals/networking/proxies-cdns-and-the-network-edge
  - system-design/scalability/multi-region-architecture

resources:
  - title: What Is a CDN?
    url: https://www.cloudflare.com/learning/cdn/what-is-a-cdn/
    source: Cloudflare
    type: article
    minutes: 10
  - title: Caching Best Practices & Max-Age Gotchas
    url: https://jakearchibald.com/2016/caching-best-practices/
    source: Jake Archibald
    type: article
    minutes: 25
    primary: true
  - title: Amazon CloudFront Key Features
    url: https://aws.amazon.com/cloudfront/features/
    source: AWS
    type: docs
    minutes: 15
---

## In one line

A CDN is a globally distributed cache in front of your origin, and the whole game is choosing what's cacheable, what the cache key is, and how you invalidate.

## What it is

Points of presence around the world terminate the user's TCP and TLS connection close to them and serve from cache if they can. Two wins: the round trip that dominates latency gets short, and your origin stops seeing most of the traffic. For static assets, a well-configured CDN takes 95%+ of requests off the origin.

**Static assets: the settled pattern.** Content-hashed filenames (`app.a1b2c3.js`) with `Cache-Control: public, max-age=31536000, immutable`. The name changes when the content changes, so invalidation is never needed. HTML gets a short TTL or `no-cache` with revalidation, because it's the document that points at the hashed assets.

**Dynamic content is where the judgement is.** Anything public and identical for many users can be cached briefly — a product page for 60 seconds turns a traffic spike into a handful of origin requests. Two tools make this safe: **stale-while-revalidate**, which serves the stale copy and refreshes in the background so users never wait on a miss, and **`Vary`**, which splits the cache by the headers that actually change the response. `Vary: Cookie` on a page most users see identically effectively disables caching, and doing it accidentally is common.

**The cache key.** By default URL plus a few headers. Query parameters matter: tracking params like `utm_source` fragment the cache into thousands of copies of the same page unless you strip or normalise them.

**Invalidation.** Purge by URL, by tag/surrogate key, or purge everything. Tag-based purging is what you want in a content system: publish an article, purge the `article-42` tag, and every page carrying it drops. Global purges are slow and stampede your origin.

**Edge compute.** Workers running at the PoP can do auth checks, A/B assignment, redirects, personalisation on a cached shell, and geo-routing without a trip to origin. Constrained runtime, tight CPU limits, no local database — good for decisions, bad for work.

**Uploads too.** Signed URLs let clients upload directly to object storage through the edge instead of streaming through your servers.

## Why it matters

It's the cheapest large performance win available and it appears in nearly every design that serves media or global users. The follow-ups are always about correctness rather than concept: what's the cache key, how do you invalidate, how do you avoid serving one user's personalised page to another. That last one is a real incident class, not a hypothetical.

## Key points

- Content-hashed filenames plus a one-year immutable TTL removes the invalidation problem for static assets.
- Even a 60-second TTL on hot dynamic pages collapses a traffic spike into a few origin requests.
- `stale-while-revalidate` means a cache miss never costs a user a wait.
- Get `Vary` right — an accidental `Vary: Cookie` disables caching, and a missing one leaks personalised responses.
- Normalise or strip tracking query parameters or you shard your cache into useless fragments.
- Tag-based purging beats URL purging for content, and beats global purges always.
- Edge compute is for decisions — auth, routing, experiment assignment — not for real work.
- Signed URLs push uploads straight to object storage instead of through your application servers.
