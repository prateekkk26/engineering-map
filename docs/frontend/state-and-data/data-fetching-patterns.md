---
title: Data Fetching Patterns
summary: Waterfalls, parallel loading, prefetching and dependent queries — the shapes that decide how fast a screen actually loads.
level: core
minutes: 25
order: 9
tags: [data-fetching, performance, patterns]

related:
  - frontend/state-and-data/server-state-and-cache-semantics
  - frontend/nextjs/data-fetching-in-the-app-router
  - frontend/performance/loading-strategy

resources:
  - title: Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/queries
    source: TanStack
    type: docs
    minutes: 25
    primary: true
  - title: Prefetching and Router Integration
    url: https://tanstack.com/query/latest/docs/framework/react/guides/prefetching
    source: TanStack
    type: docs
    minutes: 25
  - title: Dependent Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
    source: TanStack
    type: docs
    minutes: 15
---

## In one line

The shape of your requests — serial, parallel, or prefetched — usually matters more than how fast any single one of them is.

## What it is

A **waterfall** is the default failure. Component A fetches, renders, and only then does component B start its own fetch. Three levels of that is three round trips in sequence, and on a 200ms connection the page takes 600ms before it can begin rendering — with the server idle most of that time.

Waterfalls come in two flavours and it is worth separating them. *Code-level*: sequential `await`s in one function that have no dependency on each other, fixed by `Promise.all`. *Component-level*: a parent that waits for its data before rendering the child that would have started its own request, fixed by hoisting the fetches, prefetching at the route, or passing promises down so children can suspend independently.

**Parallel** is the target: start everything that can start immediately, and let each part render when it is ready. In an RSC world that means kicking off the fetches at the top and awaiting inside Suspense boundaries; in a client app it means fetching at the route level or in parallel hooks rather than in nested components.

**Dependent** queries are the legitimate exception — you need the user before you can fetch their orders. Two things help: make the second query conditional on the first (`enabled`), and if the sequence appears on a hot path, add an endpoint that returns both. A waterfall you cannot remove in the client is often a missing API.

**Prefetching** hides latency entirely. Fetch on link hover or focus, on viewport intersection, or at route transition start, so the data is in the cache before the component mounts. Combined with a cache, this is the single most effective perceived-performance technique available to a frontend.

Two other shapes are worth naming. **Request collapsing**: two components asking for the same thing at once should produce one request — deduplication handles it, provided the keys match. And **over-fetching**: a list endpoint returning full nested objects when the row needs three fields is a payload problem that no caching strategy fixes.

## Why it matters

"Why is this dashboard slow?" is nearly always a waterfall, not a slow endpoint, and it is a standard live-debugging exercise. Being able to open the network panel, see the staircase, and name the fix is the whole skill.

Prefetching is the other half — the reason a well-built app feels instant despite the same API latency as a slow one.

## Key points

- Waterfalls are the default and the main cost; look for the staircase in the network panel before optimising anything.
- Independent requests in one function belong in `Promise.all`; independent requests across components belong at the route or behind separate boundaries.
- Genuinely dependent queries should be gated explicitly, and a hot dependent chain is a sign the API is missing an endpoint.
- Prefetch on hover, focus, or viewport entry — it removes latency rather than reducing it.
- Deduplication only collapses requests whose keys match, so key discipline is a performance concern too.
- Over-fetching is a payload problem: fix the endpoint or the query, not the cache.
