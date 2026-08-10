---
title: Deployment, Runtimes & Hosting
summary: What a Next build actually produces, what self-hosting requires, and where the Vercel-shaped assumptions leak.
level: core
minutes: 25
order: 17
tags: [nextjs, deployment, infrastructure]

related:
  - frontend/nextjs/the-nextjs-caching-model
  - frontend/nextjs/environment-config-and-secrets
  - frontend/tooling/ci-cd-for-frontend

resources:
  - title: Self-hosting
    url: https://nextjs.org/docs/app/guides/self-hosting
    source: Next.js
    type: docs
    minutes: 35
    primary: true
  - title: Deploying
    url: https://nextjs.org/docs/app/getting-started/deploying
    source: Next.js
    type: docs
    minutes: 20
  - title: cacheHandlers
    url: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers
    source: Next.js
    type: docs
    minutes: 15
---

## In one line

A Next build produces static assets plus a Node server, and every hosting decision comes down to where those run and where the cache lives.

## What it is

`next build` emits prerendered HTML and RSC payloads, the client bundles, and a server for everything rendered on demand. `next start` runs that server. `output: 'standalone'` traces only the dependencies actually used into a self-contained folder, which is what you copy into a small container image instead of shipping `node_modules`.

Self-hosting works, and the pieces you inherit are specific. **The cache**: by default it is per-instance and in-memory, so with more than one replica each has its own — a revalidation on one does not reach the others, and users see different content depending on which instance answers. A shared cache handler (`cacheHandlers`, backed by Redis or similar) is what fixes that, and `use cache: remote` targets it. **Images**: the optimiser runs in your server process and is CPU-heavy; put a CDN in front or point `images.loader` at an external service. **Static assets**: serve `.next/static` from a CDN rather than through Node.

Turbopack is the default bundler for both `next dev` and `next build` in Next 16. A project with a custom webpack config will now fail the build rather than silently ignore it; the options are migrating the config, `--turbopack` to ignore it, or `--webpack` to opt out. Dev and build also write to separate output directories now, so they can run concurrently.

Runtimes matter for what your code can use. Node is the default and the only runtime for `proxy.ts`. The edge runtime is a limited subset — no native Node APIs, tight bundle limits — and Cache Components requires Node, so the edge story is narrower in 16 than it was.

Two operational facts. Deploys invalidate caches: the build id is part of every cache key, so a deploy starts cold and the first requests are slow. And an in-flight client with an old build id will fail to fetch chunks that no longer exist — Next handles this by falling back to a full page load, but it is worth knowing when you see the reload.

## Why it matters

"Could you run this outside Vercel?" is a real question in interviews and in procurement, and the honest answer requires knowing which conveniences are framework features and which are platform features.

Self-hosting incidents also cluster around exactly one thing — the per-instance cache — which makes it a good thing to name unprompted.

## Key points

- A build produces static assets plus a Node server; `output: 'standalone'` traces dependencies for a small container.
- The default cache is per-instance in-memory; multiple replicas need a shared cache handler or they diverge.
- The image optimiser runs in your process and needs a CDN or an external loader in front of it.
- Turbopack is the default for dev and build in Next 16, and a custom webpack config fails the build unless you opt out.
- `proxy.ts` and Cache Components both require the Node runtime; the edge runtime covers less than it used to.
- Cache keys include the build id, so every deploy starts cold and old clients fall back to a full reload.
