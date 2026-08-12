---
title: GraphQL When It Earns Its Place
summary: What GraphQL genuinely solves, the four costs it adds on the server, and the shape of team where the trade lands in its favour.
level: core
minutes: 25
order: 8
tags: [api, graphql, tradeoffs]

related:
  - frontend/state-and-data/graphql-rest-and-rpc-from-the-client
  - backend/api-design/rpc-and-end-to-end-typed-apis
  - data/scaling-data/n-plus-one-and-query-patterns

resources:
  - title: Introduction to GraphQL
    url: https://graphql.org/learn/
    source: GraphQL Foundation
    type: docs
    minutes: 45
    primary: true
  - title: DataLoader
    url: https://github.com/graphql/dataloader
    source: GraphQL Foundation
    type: repo
    minutes: 20
  - title: Securing your GraphQL API from malicious queries
    url: https://www.apollographql.com/blog/securing-your-graphql-api-from-malicious-queries
    source: Apollo
    type: article
    minutes: 15
---

## In one line

GraphQL moves the decision of what a response contains from the server to the client, which is worth a lot when many different clients need different slices of one graph, and worth very little when there's one frontend.

## What it is

One endpoint, a typed schema, and queries that name exactly the fields wanted. The genuine wins: **no over- or under-fetching**, so a mobile list view and a desktop detail view hit the same graph without you shipping `?fields=` hacks or five bespoke endpoints; **one round trip** for data that REST would spread across three; and a **schema that is real** — introspectable, versionable by field deprecation rather than `/v2`, and generating client types for free.

The costs are all on your side of the wire. **N+1 by construction**: a nested field resolves per parent object, so `users { posts { comments } }` is a query storm unless every resolver batches through DataLoader. **Caching is harder**: `POST` to one URL defeats HTTP caching entirely, so you replace a CDN with persisted queries and a client-side normalised cache. **Cost control is a real problem**: a legal query can be arbitrarily deep or wide, so a public GraphQL API needs depth limiting, complexity scoring, and often an allowlist of persisted operations — a public one without those is a denial-of-service endpoint. And **authorization moves into the resolvers**, per field, where it is easy to leave a hole that REST's per-endpoint checks would have made obvious.

Deprecation is genuinely better than REST's: mark a field `@deprecated`, watch per-field usage, remove it when it hits zero. That is the parallel-change workflow with the telemetry built in.

**The decision rule**: GraphQL earns its keep with many heterogeneous clients over one richly connected domain, or when a federated graph is stitching several teams' services together. With a single Next.js frontend you deploy alongside the API, it is usually a worse trade than REST or typed RPC — you take on the resolver, batching, caching and complexity-limiting machinery to solve a coordination problem you don't have.

## Why it matters

"GraphQL consumption" appears in a lot of senior frontend JDs, and the interview question is nearly always the trade, not the syntax. Being able to say precisely what it costs on the server — and to name DataLoader and query complexity limits unprompted — separates someone who has run one from someone who has used one.

## Key points

- The win is client-specified responses across heterogeneous clients, not "less code" or "faster".
- Nested resolvers are N+1 by default; DataLoader-style per-request batching is mandatory, not an optimisation.
- A single `POST` endpoint gives up HTTP and CDN caching — persisted queries claw part of it back.
- Any client-authored query is a cost you didn't approve: enforce depth limits, complexity budgets, and timeouts.
- Field-level authorization in resolvers is easy to get wrong and needs testing per field, not per endpoint.
- Field deprecation plus usage telemetry is the best evolution story of any API style.
- One first-party frontend is the case where GraphQL usually loses to REST or typed RPC.
