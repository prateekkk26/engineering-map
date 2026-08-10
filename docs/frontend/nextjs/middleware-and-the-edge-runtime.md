---
title: Proxy, Middleware & the Edge Runtime
summary: The request-level hook that runs before routing — renamed to proxy in Next 16 — and why it should stay thin.
level: core
minutes: 20
order: 9
tags: [nextjs, routing, edge, security]

related:
  - frontend/nextjs/authentication-in-nextjs
  - frontend/nextjs/deployment-runtimes-and-hosting
  - frontend/nextjs/internationalised-routing

resources:
  - title: proxy.js
    url: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: How to upgrade to version 16
    url: https://nextjs.org/docs/app/guides/upgrading/version-16
    source: Next.js
    type: docs
    minutes: 35
  - title: NextResponse
    url: https://nextjs.org/docs/app/api-reference/functions/next-response
    source: Next.js
    type: docs
    minutes: 15
---

## In one line

A single file at the project root runs on every matching request before routing, and its job is to rewrite, redirect, or set headers — not to do work.

## What it is

**The rename is the first thing to know.** In Next 16 `middleware.ts` is deprecated in favour of `proxy.ts`, exporting a function named `proxy`. The point of the rename is to say what it is for: the network boundary and routing, not general request handling. Config flags followed — `skipMiddlewareUrlNormalize` became `skipProxyUrlNormalize` — and the upgrade codemod does the mechanical part.

The runtime also changed. `proxy` runs on the Node.js runtime and that is not configurable; the edge runtime is not supported there. Code that genuinely needs edge has to stay on the older `middleware` convention for now.

What it is good at is a short list: redirect based on a cookie or header, rewrite a path (locale prefixes, A/B splits, multi-tenant host routing), set security headers or a CSP nonce, and bounce obviously unauthenticated requests before rendering. `NextResponse.next()`, `.redirect()`, and `.rewrite()` are most of the API, and the `matcher` config keeps it off static assets.

What it is bad at is anything slow. It runs before *every* matched request, so a database call or a token verification with a network hop adds that latency to the entire site. Keep it to reading a cookie and checking a signature locally.

The security caveat matters. Treat a check here as an optimisation, not as the authorisation boundary. Route handlers, server actions, and data access must each authorise independently — a framework-level bypass in the layer that runs before your code should not be the only thing standing between a request and your data. Next has shipped a critical advisory of exactly that shape before.

Because it is one file for the whole app, it becomes a dumping ground. Auth, locale, feature flags, analytics and header rewriting stacked in one function is a common state, and every request pays for all of it.

## Why it matters

Multi-tenant routing, locale prefixes, and auth gating are standard product requirements, and this is where they land. The senior signal is knowing what does *not* belong here, and that the check is not the authorisation boundary.

The rename is also a quick currency check: describing it as `middleware.ts` running at the edge is Next 15 knowledge.

## Key points

- Next 16 renames `middleware.ts` to `proxy.ts` with an exported `proxy` function; a codemod handles the mechanical rename.
- `proxy` runs on the Node.js runtime only — the edge runtime is not supported there, unlike the old middleware.
- Use it for redirects, rewrites, and headers; use `matcher` so it never runs on static assets.
- It runs on every matched request, so any network call there is latency added to the whole site.
- An auth check here is an optimisation — always authorise again in handlers, actions, and data access.
- One file for the whole app means it accumulates concerns; keep it readable or it becomes a global bottleneck.
