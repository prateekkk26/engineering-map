---
title: The Next.js Caching Model
summary: What is cached, for how long, and how to invalidate it — including everything that changed in Next 15 and 16.
level: core
minutes: 35
order: 5
tags: [nextjs, caching, performance]

related:
  - frontend/nextjs/rendering-strategies
  - frontend/nextjs/data-fetching-in-the-app-router
  - _shared/caching

resources:
  - title: use cache
    url: https://nextjs.org/docs/app/api-reference/directives/use-cache
    source: Next.js
    type: docs
    minutes: 30
    primary: true
  - title: Revalidating
    url: https://nextjs.org/docs/app/getting-started/revalidating
    source: Next.js
    type: docs
    minutes: 25
  - title: cacheLife
    url: https://nextjs.org/docs/app/api-reference/functions/cacheLife
    source: Next.js
    type: docs
    minutes: 20
  - title: Caching and revalidating without Cache Components
    url: https://nextjs.org/docs/app/guides/caching-without-cache-components
    source: Next.js
    type: docs
    minutes: 30
---

## In one line

Next 16 has two caching models — the legacy one where routes are static until something dynamic is detected, and Cache Components where nothing is cached until you write `use cache` — and the first question about any codebase is which one it uses.

## What it is

Start with what everyone gets wrong from memory. `fetch` has **not** been cached by default since Next 15. `GET` route handlers are **not** cached by default. `experimental.ppr`, `dynamicIO` and `useCache` are gone in Next 16, replaced by a single `cacheComponents` flag. Almost every blog post about "the four Next.js caches" predates all of this.

Under **Cache Components**, caching is explicit. `'use cache'` at the top of a function, component, or file caches its result, keyed automatically on the arguments and any closed-over values. `cacheLife('hours')` gives that entry a profile — `stale`, `revalidate`, and `expire` windows — and the docs recommend pairing every cache directive with one rather than relying on the implicit default. `cacheTag('posts')` labels an entry so it can be invalidated by name.

Where the result lives depends on the variant. Plain `use cache` is an in-memory, per-instance store, which on serverless means it may not survive between requests. `use cache: remote` puts it in a durable shared cache handler — a network hop that only pays off at a high hit rate. `use cache: private` is for results derived from cookies or headers and lives in the browser. All of them are keyed by build id, so a deploy starts cold.

Invalidation has three verbs in Next 16, and the distinction is exam material. `revalidateTag(tag, profile)` now **requires** the second argument and gives stale-while-revalidate: readers keep seeing old content while it refreshes. `updateTag(tag)` is server-action-only and gives read-your-writes — the user sees their own change immediately. `refresh()` re-fetches the client router's view without invalidating any server cache. Use `updateTag` after a user edits their own data; use `revalidateTag` for content where a short delay is fine.

Under the legacy model, the mental furniture is different: the Data Cache, the Full Route Cache, and the client-side Router Cache, controlled through `revalidate` and `dynamic` segment configs and `unstable_cache`. It is still fully supported, and most existing codebases are on it.

## Why it matters

This is the single most common Next.js interview topic and the one where confidently wrong answers are easiest to give, because the API changed three times in two years. Being able to say "which model is this app on?" before answering is itself the senior move.

It is also where production incidents come from: a cached response containing one user's data, or a dashboard showing figures an hour stale after a write.

## Key points

- `fetch` is not cached by default in Next 15+, and `GET` route handlers are not cached by default either.
- Cache Components makes caching explicit: `use cache` opts in, `cacheLife` sets the lifetime, `cacheTag` labels it for invalidation.
- Cache keys include the arguments, closed-over values, and the build id — a new deployment starts with an empty cache.
- `use cache: remote` is durable and shared; plain `use cache` is per-instance memory that serverless may not preserve.
- `revalidateTag(tag, profile)` requires a profile in Next 16 and is stale-while-revalidate; `updateTag` is read-your-writes and server-action-only; `refresh()` only updates the client router.
- Anything derived from cookies or headers must not land in a shared cache — that is how one user sees another's data.
