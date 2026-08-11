---
title: N+1 & Query Patterns
summary: The single most common performance bug in application code, why ORMs and GraphQL make it easy, and the batching fix.
level: core
minutes: 20
order: 5
tags: [data, performance, orm, graphql]

related:
  - data/postgres-in-depth/diagnosing-a-slow-postgres
  - data/relational-fundamentals/joins-and-join-algorithms
  - frontend/state-and-data/graphql-rest-and-rpc-from-the-client

resources:
  - title: DataLoader
    url: https://github.com/graphql/dataloader
    source: GraphQL Foundation
    type: repo
    minutes: 20
    primary: true
  - title: Solving the N+1 Problem
    url: https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance
    source: Prisma
    type: docs
    minutes: 20
  - title: Lazy Load
    url: https://martinfowler.com/eaaCatalog/lazyLoad.html
    source: Martin Fowler
    type: article
    minutes: 10
---

## In one line

You fetch a list in one query and then, without noticing, run one more query per item to load its relations.

## What it is

Fetch 50 posts, then render each with its author. If the author is loaded lazily, that is 1 + 50 queries. Each is fast — 1ms — so nothing looks slow in isolation, and the endpoint takes 300ms of pure round-trip time. In `pg_stat_statements` it shows up as the top query by *total* time with a tiny mean and an enormous call count, which is the signature to recognise.

**Why it happens so easily.** ORMs make relation access look like property access, so `post.author.name` in a loop is invisible. GraphQL makes it structural: a resolver runs per field per object, so a nested selection over a list fans out by construction. And it usually passes review, because the code reads perfectly and the test fixture has three rows.

**The fixes.**

*Join or eager-load* — `include`/`with`/`preload` in your ORM, which issues one query with a join or a second query with `WHERE id = ANY($1)`. This is the default answer for a known access path.

*Batch with DataLoader* — collect the ids requested during a tick and issue one `IN` query, then distribute results. This is the standard GraphQL answer, and the reason per-request instances matter: a shared loader caches across users and leaks data.

*Two queries, joined in memory* — fetch the posts, collect author ids, fetch authors in one query, map them. Often clearer than a complex join and lets you cache the second set.

The failure mode of over-correcting is worth naming: eagerly loading everything produces a monster join returning the parent row duplicated across every child — a hundred posts × twenty comments is two thousand rows carrying the post body twenty times each. That is a *cartesian* problem, and the fix is separate queries per collection rather than one join.

**Detection should be automatic**: log query counts per request, assert a maximum in tests for hot endpoints, or use an ORM plugin that warns on lazy loads inside a loop. Discovering N+1 by reading code does not scale; discovering it in production is expensive.

## Why it matters

This is the bug most likely to be planted in a practical-round repo, and spotting it is a visible signal. It is also the most common real cause of a slow API in a codebase using an ORM, and the fix is cheap once seen — which is exactly why not seeing it is costly.

## Key points

- N+1 is one query for the list plus one per row, and no individual query looks slow.
- The signature in `pg_stat_statements` is a low mean time with a very high call count dominating total time.
- ORMs hide it behind property access; GraphQL creates it structurally through per-field resolvers.
- Eager loading and `WHERE id = ANY(...)` batching are the two fixes; DataLoader is the per-request batching pattern.
- DataLoader instances must be per request — a shared cache leaks one user's data into another's response.
- Over-joining causes cartesian blowup: one join per collection duplicates parent rows, so fetch collections separately.
- Instrument query counts per request and assert them in tests; do not rely on spotting it in review.
