---
title: Cache Normalisation & Entity Shape
summary: When the same record appears in three places and one of them updates — the problem normalisation solves, and its real cost.
level: deep
minutes: 25
order: 10
tags: [state, caching, data-modelling]

related:
  - frontend/state-and-data/server-state-and-cache-semantics
  - frontend/state-and-data/graphql-rest-and-rpc-from-the-client
  - frontend/state-and-data/optimistic-updates-and-rollback

resources:
  - title: Normalizing State Shape
    url: https://redux.js.org/usage/structuring-reducers/normalizing-state-shape
    source: Redux
    type: docs
    minutes: 25
    primary: true
  - title: Apollo Client — Caching overview
    url: https://www.apollographql.com/docs/react/caching/overview
    source: Apollo
    type: docs
    minutes: 30
  - title: Normalized Caching
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-normalization
    source: TanStack
    type: docs
    minutes: 20
---

## In one line

A normalised cache stores each entity once by id and has views reference it, so updating a record updates it everywhere — at the cost of a mapping layer between the API's shape and yours.

## What it is

The problem appears the moment the same entity is reachable by two routes. A user appears in the list query, in the detail query, and embedded in each of their comments. Edit their display name and a document-style cache — where each query result is stored whole under its own key — updates only the entry you invalidated. The other two keep the old name until something happens to refresh them.

A **normalised** cache stores `users: { u_1: {...} }` once, and every query result holds references. One write, and every view reflects it. This is what Apollo, urql's graphcache, and RTK Query's `entityAdapter` do, and it is why GraphQL clients lean on it: with a graph API, entity overlap is the normal case rather than an edge case.

The cost is real and should not be waved away. Something has to know that this JSON blob is a `User` with id `u_1` — GraphQL gets it from `__typename` plus `id`, REST needs configuration per endpoint. You need a policy for merging partial entities, because a list row with three fields and a detail response with thirty are the same entity at different resolutions. Pagination and ordering need their own handling, since the list is now a list of references. And denormalising on read costs work on every access.

Which is why **document caching** — a whole response per key, as TanStack Query does by default — is the right default for REST. It is simpler, predictable, and the overlap problem is handled adequately by invalidating related keys after a mutation. You accept a refetch in exchange for not maintaining a mapping layer.

The useful middle ground: keep the document cache, but be deliberate about entity shape. Have list and detail endpoints return consistent field names and ids, invalidate by tag after mutations, and store ids rather than embedded copies in your own client state so there is one place a record lives.

## Why it matters

"The name updated here but not there" is a classic bug report with a structural cause, and being able to explain why — and to say when normalisation is worth its overhead rather than reaching for it reflexively — is a genuine architecture answer.

It is also the substance behind "Apollo versus React Query", which is a common comparison question with a boring correct answer: it depends on whether your data is a graph.

## Key points

- The problem is entity overlap: the same record reachable through several queries, updated through one.
- Normalising stores each entity once by id, so a single write is visible everywhere it appears.
- The cost is an identity and merge policy per type, plus pagination handling and denormalisation on read.
- GraphQL clients normalise by default because `__typename` plus `id` makes identity free and overlap is the norm.
- Document caching per query key is the right default for REST — simpler, with invalidation covering most overlap.
- Whichever you choose, keep ids rather than embedded copies in your own state so there is one home per record.
