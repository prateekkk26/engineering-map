---
title: Streaming & Loading UI
summary: Where loading.tsx and Suspense boundaries actually belong, and why boundary placement decides how fast a page feels.
level: core
minutes: 20
order: 6
tags: [nextjs, streaming, suspense, performance]

related:
  - frontend/react/suspense-and-streaming
  - frontend/nextjs/rendering-strategies
  - frontend/performance/perceived-performance

resources:
  - title: Streaming
    url: https://nextjs.org/docs/app/guides/streaming
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: loading.js
    url: https://nextjs.org/docs/app/api-reference/file-conventions/loading
    source: Next.js
    type: docs
    minutes: 15
  - title: Suspense
    url: https://react.dev/reference/react/Suspense
    source: react.dev
    type: docs
    minutes: 25
---

## In one line

`loading.tsx` is a Suspense boundary around a whole route segment, and hand-placed boundaries let the fast parts of a page render while the slow parts stream in behind fallbacks.

## What it is

Dropping a `loading.tsx` in a segment wraps that segment's page in Suspense. Next sends the layout and the fallback immediately, then streams the page's real output over the same response when its data resolves. The user sees the shell and the navigation right away instead of a blank tab.

That is the coarse version, and it is often too coarse. A route-level fallback means the *whole* page waits on its slowest query. Placing `<Suspense>` around the individual slow regions instead lets the header, the nav and the fast panels render immediately, each slow panel filling in independently. Same total time, dramatically better perceived speed — and better Core Web Vitals, because LCP no longer waits on the slowest API call.

The mechanism is worth being able to describe: the server keeps the response open and pushes each boundary's HTML as it becomes ready, with an inline script swapping out the fallback. Hydration is selective, so a region becomes interactive as it arrives rather than after the whole page is done.

Boundary placement is therefore a design decision, and there are two failure modes. Too few and you have the all-or-nothing page you were trying to avoid. Too many and the page becomes a flickering mosaic of spinners that shift layout as each one resolves.

Which is why fallbacks should be skeletons matched to the real content's dimensions. A spinner that gets replaced by a 400px table is a layout shift and a CLS penalty; a skeleton the same size is not.

Two constraints in practice. Streaming needs a response the platform will not buffer — a CDN or proxy that buffers responses silently converts your streamed page back into an all-at-once one. And status codes and headers are committed when the first chunk is sent, so a `notFound()` discovered deep in a streamed subtree cannot retroactively make the response a 404.

## Why it matters

This is the concrete answer to "how would you make this dashboard feel faster?" — and it is a better one than caching, because it works on genuinely dynamic per-user data that cannot be cached at all.

It also connects the framework to the metric: interviewers who ask about Core Web Vitals want to hear that streaming moves LCP off the slowest dependency.

## Key points

- `loading.tsx` is sugar for a Suspense boundary around the segment, so the whole page waits on its slowest data.
- Hand-placed boundaries around slow regions let fast content paint immediately and each region stream independently.
- Selective hydration makes each region interactive as it arrives, rather than after the full page.
- Match fallback dimensions to the real content — a mismatched skeleton is a layout shift you shipped deliberately.
- Buffering proxies and CDNs can silently defeat streaming; verify the response actually arrives in chunks.
- Status and headers are fixed once the first chunk flushes, so errors found later cannot change the response code.
