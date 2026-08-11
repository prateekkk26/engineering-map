---
title: Code Splitting Strategy
summary: Deciding where to split so users download what they need, without turning one request into forty.
level: core
minutes: 20
order: 5
tags: [tooling, performance, bundling]

related:
  - frontend/performance/loading-strategy
  - frontend/performance/asset-caching-strategy
  - frontend/tooling/how-bundlers-work

resources:
  - title: Reduce JavaScript payloads with code splitting
    url: https://web.dev/articles/reduce-javascript-payloads-with-code-splitting
    source: web.dev
    type: article
    minutes: 20
    primary: true
  - title: Lazy loading
    url: https://nextjs.org/docs/app/guides/lazy-loading
    source: Next.js
    type: docs
    minutes: 20
  - title: lazy
    url: https://react.dev/reference/react/lazy
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

Split by route first, then by heavy optional components, and stop — beyond that the request overhead and the waterfalls cost more than the bytes saved.

## What it is

**Route-level splitting** is the default and does most of the work: a visitor to the landing page should not download the admin dashboard. Frameworks do this automatically from the route structure, which is most of why they are worth using.

**Component-level splitting** is the second tier, and it needs a real justification. A rich text editor, a charting library, a map, a video player, a modal most users never open — each is large, optional, and not needed for first paint. `React.lazy` with Suspense, or `next/dynamic`, handles it. Splitting a 5KB component is pure overhead.

**Vendor and shared chunks** are the third consideration. Separating rarely-changing dependencies from application code means a deploy invalidates only the app chunk, so returning users re-download less. HTTP/2 removed most of the per-request cost that used to argue against many chunks, so finer granularity is now usually a net win — up to the point where request count itself becomes the bottleneck.

**The waterfall risk** is the thing that makes naive splitting slower. A lazy component that only starts loading when it renders means: parent renders, discovers the import, requests the chunk, waits, then renders. Prefetching on hover or intent, or `<link rel="modulepreload">`, removes the wait. Framework routers do this automatically for links in the viewport, which is why manual splitting needs the manual prefetch.

**Loading states must be designed**, not incidental. A lazily-loaded component appearing after a blank gap is a layout shift and a CLS penalty; the Suspense fallback should reserve the same space.

**Chunk-load failure after deploy** is the operational hazard: a user on an old build requests a chunk that no longer exists. Catch the dynamic import rejection and prompt a reload rather than showing a stack trace.

The honest measurement: split, then check the analyzer and the network waterfall. Over-splitting produces a page making thirty requests for eight kilobytes each, which is slower than one bundle — and it is a mistake made by teams that split because they read that they should.

## Why it matters

Initial bundle size is the main determinant of time-to-interactive, and route splitting is the highest-leverage change available in most applications.

It is also a common interview follow-up to bundle size, where the expected answer includes prefetching — since splitting without it just moves the wait.

## Key points

- Split by route first; frameworks do it automatically and it captures most of the benefit.
- Split components only when they are large and genuinely optional — a small lazy component is net overhead.
- Separate vendor chunks so a deploy does not invalidate everything for returning users.
- Prefetch on hover or intent, or a lazy import adds a round trip at the moment of use.
- Design the loading state to reserve space, or splitting introduces layout shift.
- Handle chunk-load failures after deploy by prompting a reload.
- Measure after splitting — thirty tiny requests can be slower than one bundle.
