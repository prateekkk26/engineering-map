---
title: Route Handlers
summary: Building HTTP endpoints in app/, when you actually need one, and how they differ from server actions and from Pages Router API routes.
level: core
minutes: 20
order: 8
tags: [nextjs, api, http]

related:
  - frontend/nextjs/server-actions
  - frontend/nextjs/middleware-and-the-edge-runtime
  - frontend/state-and-data/api-contracts-and-end-to-end-types

resources:
  - title: Route Handlers
    url: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: route.js
    url: https://nextjs.org/docs/app/api-reference/file-conventions/route
    source: Next.js
    type: docs
    minutes: 20
  - title: NextRequest
    url: https://nextjs.org/docs/app/api-reference/functions/next-request
    source: Next.js
    type: docs
    minutes: 15
---

## In one line

A `route.ts` exporting `GET`, `POST` and friends turns a segment into an HTTP endpoint built on the standard `Request` and `Response` objects — and you need one far less often than in the Pages Router.

## What it is

Each exported function name is an HTTP method, and it receives a `Request` and returns a `Response`. Web standards, not a Next-specific `req`/`res` pair, which means the same handler code is portable and testable without a framework harness. `NextRequest` and `NextResponse` add convenience for cookies and redirects.

A segment can have a `page.tsx` or a `route.ts`, never both — they both claim the same URL.

The first thing to ask is whether you need one at all. In the App Router, your own UI does not: a server component reads the database directly, and a mutation is a server action. Calling your own `/api/things` from a server component adds an HTTP round trip to what could have been a function call. Route handlers earn their place for consumers you do not control — webhooks from Stripe or GitHub, a public API, OAuth callbacks, a mobile client, uploads and downloads, streaming responses to third parties, or anything that must be reachable by URL.

Caching defaults are a common trap. `GET` handlers are **not** cached by default in Next 15+, reversing the earlier behaviour; opt in explicitly. With Cache Components enabled, `GET` handlers follow the same prerendering model as pages.

Handlers can stream by returning a `ReadableStream`, which is how you proxy a model provider's token stream to the browser — the standard shape for an LLM chat backend, and the reason a Next AI app usually has exactly one route handler.

The security position is the same as for actions: a handler is public. Authenticate and authorise inside it. Webhooks additionally need signature verification against the raw body, which means reading the body as text before parsing rather than letting a helper consume it.

## Why it matters

Practical rounds at AI companies almost always involve a streaming endpoint, and the route handler is where that lives. Knowing when *not* to add one is equally valued — an App Router codebase full of API routes its own pages call is the classic Pages Router hangover.

## Key points

- `route.ts` exports functions named after HTTP methods, built on standard `Request`/`Response`.
- A segment cannot have both `page.tsx` and `route.ts` — same URL, one owner.
- Your own server components and actions do not need handlers; they exist for external or URL-addressable consumers.
- `GET` handlers are not cached by default in Next 15+; with Cache Components they follow the page prerendering model.
- Returning a `ReadableStream` is how you proxy token streams — the backbone of a chat UI.
- Handlers are public endpoints: authenticate, authorise, validate, and verify webhook signatures against the raw body.
