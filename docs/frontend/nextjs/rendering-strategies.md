---
title: Rendering Strategies
summary: Static, dynamic, streamed and partially prerendered — what each costs, and how Next 16 decides which one a route gets.
level: core
minutes: 30
order: 2
tags: [nextjs, rendering, performance]

related:
  - frontend/nextjs/the-nextjs-caching-model
  - frontend/nextjs/streaming-and-loading-ui
  - frontend/react/react-server-components

resources:
  - title: Caching and prerendering
    url: https://nextjs.org/docs/app/getting-started/caching
    source: Next.js
    type: docs
    minutes: 35
    primary: true
  - title: cacheComponents
    url: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents
    source: Next.js
    type: docs
    minutes: 15
  - title: Incremental Static Regeneration with Cache Components
    url: https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components
    source: Next.js
    type: docs
    minutes: 25
  - title: Migrating to Cache Components
    url: https://nextjs.org/docs/app/guides/migrating-to-cache-components
    source: Next.js
    type: docs
    minutes: 30
---

## In one line

A route is prerendered into a static shell at build time and anything that cannot be known then streams in at request time — so "static or dynamic" is now a per-component question rather than a per-route one.

## What it is

The classic four are still the vocabulary. **Static** rendering produces HTML at build time, served from a CDN. **Dynamic** rendering runs per request, which is required the moment output depends on cookies, headers, or search params. **ISR** regenerates a static page in the background on a schedule or on demand. **Streaming** sends the page in chunks so the shell arrives before the slow parts.

What changed is the granularity. Under **Cache Components** (`cacheComponents: true` in `next.config.ts`, which in Next 16 replaces the old `experimental.ppr`, `dynamicIO` and `useCache` flags), data is dynamic by default and you opt pieces *into* caching with `use cache`. The build renders the tree and produces a static shell containing everything it can resolve: static markup, cached results, and the Suspense fallbacks standing in for everything else. At request time the uncached parts stream into those holes. That is Partial Prerendering, and it is the default behaviour when the flag is on.

The practical consequence is that reading `cookies()` no longer condemns the whole route to dynamic rendering. It condemns the component that reads it — provided that component sits behind a `<Suspense>` boundary. Without one, Next surfaces a blocking-route warning telling you the route can no longer produce a shell.

Which leads to the structural rule worth internalising: **push async work down the tree**. A layout that awaits `params` at the top cannot be prerendered at all; the same layout passing the promise to a child inside a boundary prerenders everything except that child. The deeper the await, the more of the page ships as HTML.

Without the flag, the older model still applies: routes are static unless something dynamic is detected, and `generateStaticParams` plus `revalidate` gives you ISR. Both models exist in Next 16, and knowing which one a codebase is on is the first thing to establish.

One caveat that catches people in production: bots and crawlers are detected by user agent and served a fully dynamic render rather than the shell, so anything your shell depends on must also work at request time.

## Why it matters

"How would you make this page fast?" is a design-round staple, and the answer is now about which parts can be prerendered and where the boundaries go — not about picking one of four rendering modes for the whole route.

It is also where most stale knowledge shows. Describing PPR as experimental, or `experimental_ppr` as the way to enable it, dates you to Next 15.

## Key points

- Under Cache Components, data is dynamic by default and caching is opt-in via `use cache`; PPR is the default rendering behaviour, not a flag.
- The static shell holds static markup, cached results, and Suspense fallbacks; everything else streams at request time.
- Runtime APIs — `cookies`, `headers`, `searchParams`, unknown `params` — make a component dynamic, and it must sit behind a boundary.
- Awaiting deeper in the tree prerenders more of the page; awaiting in a layout prerenders none of it.
- `generateStaticParams` prerenders known URLs; unknown ones get the App Shell and are upgraded in the background after first visit.
- Bots get a full dynamic render instead of the shell, so shell data must be available at request time too.
