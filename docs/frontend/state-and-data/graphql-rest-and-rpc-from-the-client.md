---
title: GraphQL, REST & RPC from the Client
summary: What each style costs the frontend in requests, caching, and types — judged from the consumer's side rather than the server's.
level: core
minutes: 25
order: 16
tags: [api, graphql, rest, architecture]

related:
  - frontend/state-and-data/api-contracts-and-end-to-end-types
  - frontend/state-and-data/cache-normalisation-and-entity-shape
  - frontend/architecture/bff-and-api-layering
  - backend/api-design/graphql-when-it-earns-its-place

resources:
  - title: GraphQL — Best Practices
    url: https://graphql.org/learn/best-practices/
    source: GraphQL
    type: docs
    minutes: 25
    primary: true
  - title: tRPC
    url: https://trpc.io/docs/concepts
    source: tRPC
    type: docs
    minutes: 20
  - title: HTTP caching
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
    source: MDN
    type: docs
    minutes: 25
---

## In one line

REST gives you HTTP caching and simplicity but leaves you over-fetching or waterfalling; GraphQL gives you exactly the data in one request and takes HTTP caching away; RPC gives you end-to-end types and gives up being a public API.

## What it is

Judge these from the client's seat, which is a different judgement from the server's.

**REST** wins on infrastructure. Every response is a URL with cache headers, so CDNs, browsers, and proxies all cache for free, and debugging is a browser tab. The frontend cost is shape mismatch: an endpoint designed for one screen over-fetches for another, and a screen that needs three resources makes three requests — or four, if one depends on another. The mitigation is a BFF endpoint per screen, which is where a lot of REST-consuming apps end up.

**GraphQL** solves shape mismatch directly: one request, exactly the fields the screen needs, nested resources included. The costs are concrete. HTTP caching largely disappears — everything is a POST to one URL — so caching moves into the client, which is why GraphQL clients ship normalised caches. You inherit fragment discipline, and query complexity becomes a server-side concern with real failure modes. It earns its place when many clients need different shapes of the same graph.

**RPC** — tRPC being the common case — is the pragmatic option when the same team owns both ends and both are TypeScript. Types flow from server to client with no code generation and no schema language, so a rename on the server is a compile error on the client. The limits are the flip side: it is not a public API, it does not suit non-TypeScript consumers, and it couples deployments.

The honest default for a product team owning both ends is REST plus a query library, or RPC if the stack is TypeScript throughout. GraphQL is worth its overhead when multiple consumers with genuinely different data needs share one graph — which is why it appears more in JDs at larger companies.

## Why it matters

"Would you use GraphQL here?" is a common design question, and the expected answer is a trade-off analysis, not a preference. Naming the loss of HTTP caching is the detail that shows you have consumed one in production.

Many JDs in this space list GraphQL consumption explicitly, so the client-side vocabulary — fragments, normalisation, persisted queries — is worth having.

## Key points

- REST keeps HTTP caching and debuggability but pushes you toward over-fetching or per-screen endpoints.
- GraphQL removes over-fetching and waterfalls at the cost of HTTP caching, which is why its clients normalise in-memory.
- Fragment colocation is GraphQL's real ergonomic win: each component declares its own data needs.
- RPC gives end-to-end types with no codegen when one team owns both ends in TypeScript, and is unsuitable as a public API.
- Persisted queries restore some caching and size benefits for GraphQL in production.
- Choose by how many consumers need how many different shapes, not by which is more modern.
