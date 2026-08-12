---
title: RPC & End-to-End Typed APIs
summary: When the API is a function call between two halves of one codebase — tRPC, gRPC, server actions — and what you give up by leaving REST.
level: core
minutes: 20
order: 9
tags: [api, rpc, typescript]

related:
  - frontend/state-and-data/api-contracts-and-end-to-end-types
  - backend/api-design/resource-modelling-and-rest
  - frontend/nextjs/server-actions

resources:
  - title: tRPC concepts
    url: https://trpc.io/docs/concepts
    source: tRPC
    type: docs
    minutes: 20
    primary: true
  - title: Introduction to gRPC
    url: https://grpc.io/docs/what-is-grpc/introduction/
    source: gRPC
    type: docs
    minutes: 20
  - title: OpenAPI Specification
    url: https://spec.openapis.org/oas/latest.html
    source: OpenAPI Initiative
    type: docs
    minutes: 30
---

## In one line

RPC drops the resource metaphor and exposes typed procedures, which is the right shape when both ends ship together and the wrong shape when they don't.

## What it is

Three flavours worth telling apart. **tRPC** is TypeScript-to-TypeScript with no code generation and no schema file: the client imports the server's *types*, so renaming a procedure is a compile error in the frontend before it is a runtime error in production. **gRPC** is Protobuf over HTTP/2 — a generated contract, binary and fast, with streaming built in; the standard choice for service-to-service traffic, awkward from a browser (needs gRPC-Web and a proxy). **Server actions** in Next.js are the same idea folded into the framework: an exported async function the client calls directly, with the network hidden entirely.

The shared benefit is that **the contract is checked by a compiler rather than by a test or a hope**. The shared cost is that the API stops being self-describing over HTTP: `POST /trpc/order.create` tells a proxy, a CDN, a log aggregator and a curl-wielding human almost nothing. You lose method semantics (safe, idempotent, cacheable), you lose meaningful status codes unless you map them yourself, and you lose the ability to hand a third party a URL.

That trade is decided by **who the consumer is**. Your own frontend, deployed in lockstep: RPC is strictly better — less boilerplate, no drift, refactors that actually propagate. Another team's service: gRPC or a schema-first REST API. A third-party integrator or a public API: REST with OpenAPI, because they need documentation, curl, and stability more than they need your types.

The middle path is worth naming: **schema-first REST**. Define the contract once (OpenAPI, or a Zod schema you share), generate both the client and the server types from it, and keep HTTP semantics. Less magic than tRPC, most of the safety, and the API is still an API.

## Why it matters

Full-stack take-homes at AI companies increasingly ship with tRPC or server actions, and the interview follow-up is "why this instead of REST" — a question about coupling, not preference. Naming the loss of cacheability and third-party consumability is the answer that shows you chose it rather than inherited it.

## Key points

- RPC exposes procedures, not resources; the contract is types, not URLs.
- tRPC's guarantee is compile-time: a server rename breaks the frontend build, not production.
- gRPC is the service-to-service default — binary, streaming, generated — and needs a proxy to reach a browser.
- Leaving REST gives up method semantics, status codes, and HTTP caching; you must decide you didn't need them.
- Lockstep deployment is the precondition for RPC — if you can't deploy both halves together, you need a versioned contract.
- Schema-first REST with generated clients gets most of the type safety while staying a normal HTTP API.
- Public and third-party APIs stay REST plus OpenAPI, because documentation and stability outweigh type ergonomics.
