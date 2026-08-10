---
title: Streaming with RSC & Server Actions
summary: Where the model call belongs in an App Router app, and how tokens get from a server component or action to the client.
level: deep
minutes: 25
order: 8
tags: [ai, nextjs, rsc, streaming]

related:
  - frontend/nextjs/server-actions
  - frontend/react/react-server-components
  - frontend/nextjs/route-handlers

resources:
  - title: Streaming Data
    url: https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data
    source: Vercel
    type: docs
    minutes: 25
    primary: true
  - title: Route Handlers and Middleware
    url: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
    source: Next.js
    type: docs
    minutes: 25
  - title: use
    url: https://react.dev/reference/react/use
    source: react.dev
    type: docs
    minutes: 20
---

## In one line

The model call runs on the server holding the key, and the choice is how its output crosses to the client: a streamed route handler, a server action, or streamed RSC content.

## What it is

Three shapes, with different fits.

**A route handler returning a `ReadableStream`** is the workhorse. `POST /api/chat` authenticates, calls the provider, and pipes the stream back; the client reads it with `fetch` and renders deltas. It is plain HTTP, easy to reason about, easy to debug in the network panel, and it is what every chat UI library expects. Default to this.

**A server action** suits mutations that happen to involve a model — classify this, summarise and save, generate a title. Actions run serially per client and are not built for high-frequency token delivery, so use them for the fire-and-store shape rather than for a live transcript. The React 19 form primitives give pending state and error handling for free here.

**Streamed RSC** covers a different case: server-rendered content that includes model output on first load. The server component starts the generation and the page streams behind a Suspense boundary. The trap is that a server component renders once — it cannot re-render per token — so the incremental part must still be a client component reading a stream or a promise. Starting the fetch on the server and passing the promise to a client component that reads it with `use` is the pattern that avoids a client-side waterfall.

Whichever you pick, the invariants are the same. **The key never leaves the server.** The client boundary sits at the interactive shell — composer, message list, stop button — with data fetching above it. Cancellation must propagate: forward `request.signal` from the handler into the provider call. And streaming needs an unbuffered path, which is a deployment fact as much as a code one — a proxy or CDN that buffers responses converts your stream into a single late chunk.

One runtime note for Next 16: `proxy.ts` runs on Node only, and Cache Components requires Node, so the edge-runtime story for these routes is narrower than it used to be.

## Why it matters

Every Next.js AI app makes this choice, usually implicitly, and picking the server-action path for a live transcript is a common mistake that shows up as sluggish, serialised responses.

It is also a good synthesis question in interviews — it touches RSC boundaries, streaming, and cancellation at once.

## Key points

- A route handler returning a `ReadableStream` is the default for live transcripts — plain HTTP, debuggable, library-compatible.
- Server actions fit model-backed mutations, not token streams; they run serially per client.
- A server component renders once — the incremental part must be a client component reading a stream or a promise.
- Start the fetch on the server and pass the promise down to `use` to avoid a client-side waterfall.
- The API key stays server-side; the client boundary is the interactive shell.
- Forward `request.signal` to the provider so a client abort actually stops generation.
- Verify the deployment path does not buffer — a buffering proxy silently defeats streaming.
