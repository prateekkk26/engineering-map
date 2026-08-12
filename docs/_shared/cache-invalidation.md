---
title: Cache Invalidation
summary: Deciding when cached data stops being allowed to answer, which is the half of caching that actually goes wrong.
level: core
minutes: 25
tags: [caching, consistency, performance]

surfaced_in:
  - frontend/performance
  - backend/api-design
  - system-design/building-blocks

related:
  - _shared/caching
  - frontend/browser-platform/http-caching
  - backend/api-design/conditional-requests-and-api-caching

resources:
  - title: Caching Challenges and Strategies
    url: https://aws.amazon.com/builders-library/caching-challenges-and-strategies/
    source: AWS Builders' Library
    type: article
    minutes: 30
    primary: true
  - title: Things Caches Do
    url: https://tomayko.com/writings/things-caches-do
    source: Ryan Tomayko
    type: article
    minutes: 10
  - title: RFC 5861 — stale-while-revalidate and stale-if-error
    url: https://datatracker.ietf.org/doc/html/rfc5861
    source: IETF
    type: docs
    minutes: 10
---

## In one line

Putting something in a cache is easy; the hard part is knowing the moment it became a lie, and every invalidation strategy is a different answer to that question.

## What it is

There are only three ways to stop a cache serving stale data, and every real system is some combination of them.

**Expiry** — the entry carries a TTL and dies on its own. No coordination, no bookkeeping, and it is wrong for exactly as long as the TTL. It is the right default far more often than people expect: a 30-second TTL on a list endpoint absorbs most of the load and bounds the wrongness to something you can say out loud in a design review.

**Explicit invalidation** — the writer deletes or overwrites the entry when the underlying data changes. Correct in principle, and the source of most cache bugs in practice, because it requires every writer to know every cache key derived from the thing it wrote. Change the key format, add a second cache, add a denormalised copy, and the invalidation path silently stops covering everything.

**Versioned keys** — instead of deleting, you change the key: `user:42:v7`, or a content hash in a filename. Nothing is invalidated at all; the old entry simply stops being asked for and ages out. This is what a build tool does when it emits `app.a3f9c1.js` with a one-year TTL, and it is the only one of the three with no race condition in it, because there is no window where a reader can pick up the old value under the new name.

Two failure modes matter more than the rest. A **thundering herd** happens when a popular key expires and every concurrent request misses at once, all of them hitting the origin together — solved by a lock so one request refills, or by serving the stale value while a single background refresh runs (`stale-while-revalidate`). And **stale-on-error**, its inverse, is a deliberate choice to keep serving expired data when the origin is down, on the grounds that slightly wrong beats a blank page.

The distributed version of the problem is that invalidation is itself a message that can be lost. A cache-invalidation event over a queue is delivered at-least-once at best, and never at worst, so a TTL underneath everything is what stops one dropped message becoming permanent corruption. Belt and braces: invalidate eagerly, expire anyway.

## Why it matters

"How do you invalidate it?" is the standard follow-up the moment you draw a cache on a whiteboard, and answering only "I'd set a TTL" or only "I'd bust it on write" shows you have thought about one half. Naming the tradeoff — bounded staleness versus coordination cost — and knowing that versioned keys sidestep both is a senior answer. It is also where real incidents come from: the cached permission that outlived a revoked role, the price that stayed wrong for an hour.

## Key points

- The three mechanisms are expiry, explicit invalidation, and versioned keys; most systems need at least two.
- A TTL bounds how wrong you can be without requiring anyone to remember anything.
- Explicit invalidation is correct only if every writer knows every derived key — that coupling is what rots.
- Versioned or content-hashed keys have no invalidation race, because the old value is never looked up again.
- A hot key expiring causes a thundering herd; a refresh lock or `stale-while-revalidate` is the fix.
- `stale-if-error` is a deliberate availability-over-freshness trade, and worth saying out loud as one.
- Invalidation messages get lost, so always keep a TTL underneath an event-driven invalidation scheme.
- Never cache authorization decisions for longer than you'd accept a revoked user still having access.
