---
title: Asset Caching Strategy
summary: Content hashing, immutable headers, and a chunking layout that survives a deploy without invalidating everything.
level: core
minutes: 20
order: 12
tags: [performance, caching, deployment]

related:
  - frontend/browser-platform/http-caching
  - frontend/tooling/code-splitting-strategy
  - frontend/performance/network-and-delivery

resources:
  - title: Love your cache
    url: https://web.dev/articles/love-your-cache
    source: web.dev
    type: article
    minutes: 25
    primary: true
  - title: Caching best practices & max-age gotchas
    url: https://jakearchibald.com/2016/caching-best-practices/
    source: Jake Archibald
    type: article
    minutes: 25
  - title: Output filename hashing
    url: https://webpack.js.org/guides/caching/
    source: webpack
    type: docs
    minutes: 20
---

## In one line

Hash the content into the filename and cache it forever; leave the HTML uncached so it can always point at the current hashes.

## What it is

The two-tier pattern is the whole strategy and it is worth being able to state precisely. **Immutable assets**: `app.4f3a2b.js`, served with `Cache-Control: public, max-age=31536000, immutable`. The URL is derived from the content, so the content behind it can never change, so caching it for a year is safe and revalidation is unnecessary. **Mutable entry point**: the HTML, served with `no-cache`, meaning it is revalidated every time — a cheap `304` when unchanged. The HTML is the only thing that needs to be fresh, because it is what names the current hashes.

The failure this avoids is the one everyone has hit: a long `max-age` on a non-hashed file. Once it is in a browser cache you cannot recall it, so users keep running old code with no remedy. Hashing makes the URL change instead.

**Chunking layout** decides how much of the cache survives a deploy. One giant bundle means a one-line change invalidates everything. Splitting vendor code from application code means a dependency-free release leaves the largest file cached. Going further and splitting per route means a change to one page does not invalidate the others. Under HTTP/2 the old cost of many files is largely gone, so finer granularity is usually a net win — up to the point where the request count itself becomes the problem.

Watch for **hash instability**: a bundler that changes chunk ids or ordering can alter hashes of files whose contents did not meaningfully change, silently invalidating caches on every deploy. Deterministic module ids fix it, and it is worth verifying by building twice and diffing filenames.

Two adjacent notes. Cache-busting via query string (`?v=2`) is weaker than a filename hash — some intermediary caches ignore query strings. And a service worker layered on top can hold assets indefinitely, which is powerful and is also how apps get stuck on an old version.

## Why it matters

Repeat visits are most visits for most products, and this determines whether they cost bytes at all. It is also nearly free — a header and a build setting — which makes it one of the best ratios in performance work.

The `immutable` plus hashing pattern is a standard interview question with a precise expected answer.

## Key points

- Hash the content into asset filenames and serve them `max-age=31536000, immutable`.
- Keep HTML on `no-cache` so it always resolves to the current asset URLs.
- A long `max-age` on a stable filename cannot be recalled — changing the URL is the only invalidation.
- Split vendor, shared, and route chunks so a small change invalidates a small fraction of the cache.
- HTTP/2 removed most of the per-request cost, making finer chunking worthwhile.
- Verify hash stability across identical builds; unstable chunk ids invalidate caches for no reason.
