---
title: Server State & Cache Semantics
summary: Why a copy of server data is a cache and not state, and what stale-while-revalidate actually buys you.
level: core
minutes: 25
order: 8
tags: [state, caching, data-fetching]

related:
  - frontend/state-and-data/state-taxonomy
  - frontend/state-and-data/data-fetching-patterns
  - _shared/caching

resources:
  - title: Practical React Query
    url: https://tkdodo.eu/blog/practical-react-query
    source: TkDodo
    type: article
    minutes: 30
    primary: true
  - title: TanStack Query — Important Defaults
    url: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
    source: TanStack
    type: docs
    minutes: 20
  - title: SWR
    url: https://swr.vercel.app/docs/getting-started
    source: Vercel
    type: docs
    minutes: 20
---

## In one line

Data fetched from a server is a cache entry with a freshness policy, not a value you own — and every hard problem in this area comes from treating it as the latter.

## What it is

The moment a response lands in the browser it can be wrong: someone else may have edited the record, and nothing will tell you. So the question is never "what is the value?" but "how stale am I willing to be, and what makes me check again?"

Query libraries encode that as a small vocabulary worth knowing precisely. **Stale time** is how long a cached entry is considered fresh — while fresh, no refetch happens at all. **Cache time** (garbage collection time) is how long an unused entry is kept before eviction, which is what makes returning to a screen instant rather than empty. They are independent, and confusing them produces both "why is it refetching constantly" and "why is it showing old data".

**Stale-while-revalidate** is the default behaviour and the reason these libraries feel fast: show the cached value immediately, fetch in the background, swap in the new one. The user sees content instantly and correctness arrives a moment later, instead of a spinner over data you already had.

**Query keys** are the cache's addressing scheme. A key includes every input that changes the result — `['todos', { status, page }]` — because that is what makes invalidation and refetching correct. Getting keys wrong is the source of most surprising behaviour, usually showing one filter's data under another.

**Deduplication** collapses simultaneous identical requests into one, which is what lets you call the same hook in five components without five network calls, and is why colocating queries stops being wasteful.

Then the defaults that surprise people: refetch on window focus, on reconnect, and on mount. All are reasonable — a user returning to a tab expects current data — but each needs a deliberate decision per query rather than being disabled globally at the first complaint.

Invalidation after a mutation is the other half. Either invalidate the affected keys and let the library refetch, or write the server's response straight into the cache. The second is faster and more fragile, because a response shape that differs from the list shape puts a subtly wrong object in the cache.

## Why it matters

This is the largest category of state in most apps, and the libraries are near-universal in the target codebases — so "how does your data layer work?" is really a question about these semantics.

It is also where staleness bugs live: two components disagreeing, a list that does not update after an edit, a stale value after switching accounts.

## Key points

- Fetched data is a cache with a freshness policy, not owned state; the design question is how stale is acceptable.
- Stale time controls refetching; cache time controls eviction. They are independent and often confused.
- Stale-while-revalidate shows cached content instantly and corrects it in the background — the source of the "fast" feel.
- Query keys must include every input that changes the result, or you will serve one query's data under another's key.
- Deduplication makes colocated queries cheap, so fetch where you render.
- Refetch-on-focus, on-reconnect, and on-mount are deliberate defaults; tune them per query rather than switching them off.
- After a mutation, invalidate keys or write the response into the cache — the latter is faster and easier to get subtly wrong.
