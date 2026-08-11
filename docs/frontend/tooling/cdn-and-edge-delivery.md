---
title: CDN & Edge Delivery
summary: Serving assets and rendered pages from close to the user, and the cache and invalidation rules that make it safe.
level: core
minutes: 20
order: 10
tags: [tooling, cdn, delivery]

related:
  - frontend/performance/network-and-delivery
  - frontend/browser-platform/http-caching
  - frontend/nextjs/deployment-runtimes-and-hosting

resources:
  - title: Content delivery networks
    url: https://web.dev/articles/content-delivery-networks
    source: web.dev
    type: article
    minutes: 30
    primary: true
  - title: HTTP caching
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
    source: MDN
    type: docs
    minutes: 30
  - title: Cache-Control
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control
    source: MDN
    type: docs
    minutes: 20
---

## In one line

A CDN removes distance from the request path, and on mobile networks distance is usually a bigger cost than bandwidth.

## What it is

The gain is round trips. DNS, TCP and TLS each cost one, and a request to an origin on another continent pays that latency several times before a byte of content moves. Terminating TLS at an edge node near the user collapses that, which is why a CDN often halves time-to-first-byte with no application change.

**Static assets** are the easy half: hashed filenames served `max-age=31536000, immutable`, so the browser and the edge cache them permanently and a deploy simply produces new URLs. The HTML that references them stays `no-cache`, revalidated on each navigation. That two-tier pattern is the whole strategy.

**Dynamic content at the edge** is the more interesting part. `s-maxage` sets an edge-specific lifetime independent of the browser's, so a page can be cached at the edge for a minute while browsers revalidate — and `stale-while-revalidate` lets the edge serve the stale copy instantly while it refreshes behind. That combination gives most of the speed of a static site to content that changes.

**Invalidation** is the operational half. Purging by tag or surrogate key is far more workable than by URL: tag responses with the entities they contain, and purge by entity when it changes. Purges take seconds to propagate globally, which needs accounting for when correctness matters.

**Edge compute** — Workers, edge functions — runs logic near the user for A/B assignment, geolocation, redirects, and auth checks. The constraints are real: limited runtimes, no native Node APIs, tight bundle limits, and — in Next 16 — `proxy.ts` and Cache Components both requiring the Node runtime, which narrows the edge story.

Two mistakes worth naming. **Caching a personalised response in a shared cache** is a data breach, not a performance bug: mark authenticated responses `private, no-store` and use `Vary` carefully, remembering that `Vary: Cookie` can fragment a cache into uselessness. And **cache-key mismatch** — a CDN that ignores a query parameter your application varies on will serve one variant to everyone.

Finally, **measure from where your users are**. A CDN's benefit is invisible from an office next to the origin, and synthetic tests from one region will not show it.

## Why it matters

Delivery is frequently the largest available performance win and sits entirely outside application code, which makes it cheap relative to its effect.

It is also standard system-design material — knowing what a CDN does for dynamic HTML, not just for images, is the distinguishing part.

## Key points

- The win is removing round trips; on high-latency mobile networks that dominates bandwidth.
- Hashed assets `immutable` for a year, HTML `no-cache` — the two-tier pattern is the whole strategy.
- `s-maxage` plus `stale-while-revalidate` extends CDN benefits to dynamic pages.
- Purge by tag or surrogate key rather than by URL, and account for propagation delay.
- Edge compute suits redirects, geo and A/B assignment; Next 16 narrows it by requiring Node for proxy and Cache Components.
- Never let a shared cache hold a personalised response — `private, no-store` plus careful `Vary`.
- Verify the cache key matches what your app varies on, and measure from real user locations.
