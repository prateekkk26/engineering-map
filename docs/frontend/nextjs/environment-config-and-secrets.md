---
title: Environment Config & Secrets
summary: Which variables reach the browser, why NEXT_PUBLIC values are baked in at build time, and what replaced runtime config in Next 16.
level: core
minutes: 20
order: 14
tags: [nextjs, config, security, deployment]

related:
  - frontend/nextjs/deployment-runtimes-and-hosting
  - frontend/security/client-side-data-exposure
  - frontend/nextjs/server-vs-client-components

resources:
  - title: Environment variables
    url: https://nextjs.org/docs/app/guides/environment-variables
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: connection
    url: https://nextjs.org/docs/app/api-reference/functions/connection
    source: Next.js
    type: docs
    minutes: 10
  - title: Self-hosting
    url: https://nextjs.org/docs/app/guides/self-hosting
    source: Next.js
    type: docs
    minutes: 30
---

## In one line

Anything prefixed `NEXT_PUBLIC_` is inlined into the client bundle at build time and is therefore public forever; everything else stays on the server and is read at runtime.

## What it is

The prefix is a compile-time substitution, not a lookup. `process.env.NEXT_PUBLIC_API_URL` in client code is literally replaced with the string during the build. Two consequences follow, and both bite people. A public variable cannot be changed without rebuilding — setting it in the host's dashboard after deploy does nothing. And it is visible to anyone who opens the bundle, so an API key with that prefix is a published API key. If it is in the browser, it is public; the only real protection is a server-side proxy.

Unprefixed variables are server-only and read from `process.env` at runtime. They are safe in server components, route handlers, and server actions — but a stray import of a module reading one into a client component is a leak, which is what the `server-only` package exists to prevent at build time.

Next 16 removed `serverRuntimeConfig` and `publicRuntimeConfig` entirely. Server values are read from `process.env` directly; client values use the `NEXT_PUBLIC_` prefix. For a value that must be read at request time rather than baked in during prerendering, call `await connection()` before reading it — that tells the framework this render depends on the request and cannot be part of the static shell.

The `.env` loading order is worth knowing because it causes confusing local behaviour: `.env.$(NODE_ENV).local`, then `.env.local` (not loaded in test), then `.env.$(NODE_ENV)`, then `.env`. `.env.local` is the one to gitignore and the one that quietly overrides everything else.

Two habits pay off. Validate the environment at startup with a schema — a missing `DATABASE_URL` should fail the boot with a clear message, not produce an undefined at 3am. And keep real secrets in a secret manager rather than environment variables where the platform offers one; environment variables are readable by anything running in the process.

## Why it matters

Leaked keys in client bundles are a routine real-world incident and a specific thing reviewers grep for in take-homes. The build-time-inlining detail is also a common interview question, because it explains a class of "I changed the variable and nothing happened" support tickets.

## Key points

- `NEXT_PUBLIC_` values are inlined at build time: public forever, and unchangeable without a rebuild.
- Unprefixed variables are server-only; use `server-only` to make an accidental client import a build error.
- `serverRuntimeConfig` and `publicRuntimeConfig` were removed in Next 16 — use `process.env` and the prefix instead.
- Call `await connection()` before reading a value that must come from the request rather than the prerender.
- `.env.local` overrides the rest and should be gitignored; loading order explains most local surprises.
- Validate environment variables at startup so a missing one fails loudly at boot.
