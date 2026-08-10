---
title: HTTP Caching
summary: Cache-Control, ETags and the two questions every response answers — can this be stored, and how do we know it is still good.
level: core
minutes: 25
order: 11
tags: [http, caching, performance]

related:
  - _shared/caching
  - frontend/performance/asset-caching-strategy
  - frontend/browser-platform/http-versions-and-transport

resources:
  - title: HTTP caching
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
    source: MDN
    type: docs
    minutes: 30
    primary: true
  - title: Love your cache
    url: https://web.dev/articles/love-your-cache
    source: web.dev
    type: article
    minutes: 25
  - title: Cache-Control
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control
    source: MDN
    type: docs
    minutes: 20
---

## In one line

`Cache-Control` says who may store a response and for how long; `ETag` and `Last-Modified` let a client revalidate cheaply when that time is up.

## What it is

Two mechanisms, often confused. **Freshness** avoids the request entirely: `Cache-Control: max-age=3600` means the cached copy may be used for an hour with no network at all. **Validation** makes the request cheap when freshness expires: the client sends `If-None-Match` with the stored `ETag`, and the server replies `304 Not Modified` with no body.

The directives worth knowing precisely. `max-age` is the freshness window in seconds. `s-maxage` overrides it for shared caches such as CDNs, letting you cache aggressively at the edge and briefly in the browser. `no-cache` is the most misread name in HTTP: it means *store it but revalidate before use*, not "do not store" — that is `no-store`, which is what you want for anything private. `private` allows browser caching but forbids shared caches, which matters for personalised responses. `immutable` tells the browser not to revalidate even on reload.

The pattern that makes this work in practice is **content hashing plus immutable**. Give build assets a hash in the filename — `app.4f3a2b.js` — and serve them with `max-age=31536000, immutable`. The content can never change under that URL, so it is cacheable forever; a deploy produces a new filename. Meanwhile the HTML that references them is `no-cache`, so it is always revalidated and always points at the current assets. One short revalidation per navigation, everything else free.

`stale-while-revalidate` adds the browser-level equivalent of what query libraries do: serve the stale copy immediately and refresh in the background, so the user waits for nothing.

Two traps. Personalised responses in a shared cache is the serious one — a CDN caching a page containing one user's name and serving it to everyone. `private` and `Vary` exist to prevent it, and `Vary: Cookie` needs care because it can fragment the cache to uselessness. And once a long `max-age` response is in browsers, you cannot recall it; the only fix is a new URL, which is exactly why hashing matters.

## Why it matters

Asset caching is the cheapest performance win available and the first thing to check on a slow repeat visit. The `no-cache` versus `no-store` distinction is also a standard interview question that catches a lot of people.

The shared-cache leak is a security incident, not a performance bug, and it is asked about for that reason.

## Key points

- Freshness (`max-age`) avoids the request; validation (`ETag`/`304`) makes the request cheap once it expires.
- `no-cache` means revalidate before use; `no-store` means do not keep it at all — only the latter is safe for private data.
- `s-maxage` targets CDNs specifically, letting edge and browser lifetimes differ.
- Hash asset filenames and serve them `immutable` for a year, with `no-cache` on the HTML that references them.
- `stale-while-revalidate` serves the stale copy instantly and refreshes behind it.
- Mark personalised responses `private` and use `Vary` carefully — a shared cache serving one user's page to another is a breach.
- A long `max-age` cannot be recalled; changing the URL is the only reliable invalidation.
