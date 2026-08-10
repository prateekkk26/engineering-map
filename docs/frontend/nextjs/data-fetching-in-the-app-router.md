---
title: Data Fetching in the App Router
summary: Fetching on the server with await, avoiding waterfalls, and the handful of patterns that cover almost every case.
level: core
minutes: 25
order: 4
tags: [nextjs, data-fetching, rsc]

related:
  - frontend/nextjs/the-nextjs-caching-model
  - frontend/nextjs/server-vs-client-components
  - frontend/state-and-data/data-fetching-patterns

resources:
  - title: Fetching data
    url: https://nextjs.org/docs/app/getting-started/fetching-data
    source: Next.js
    type: docs
    minutes: 30
    primary: true
  - title: use
    url: https://react.dev/reference/react/use
    source: react.dev
    type: docs
    minutes: 20
  - title: Instant navigation
    url: https://nextjs.org/docs/app/guides/instant-navigation
    source: Next.js
    type: docs
    minutes: 25
---

## In one line

Fetch in the server component that needs the data, with a plain `await`, and reach for a client fetch only when the data depends on interaction.

## What it is

The default pattern is unglamorous: make the component `async` and `await` the query. No `useEffect`, no loading state, no API route in between — a server component can talk to the database directly. Errors go to the nearest `error.tsx`, and the loading state is the nearest Suspense boundary.

Colocation is the point. Fetch the data in the component that renders it rather than at the top of the page and passing it down. That sounds like it would cause duplicate requests, and the answer is `React.cache` (and `fetch` deduplication within a render pass): two components asking for the same user in one request get one query.

Waterfalls are the thing to actively design against. Sequential `await`s in one component are serial by construction; `Promise.all` makes independent requests parallel. Across components, a parent that awaits before rendering a child blocks that child from even starting — which is why starting the fetch and passing the *promise* down, then reading it with `use` inside a Suspense boundary, is the pattern that keeps requests parallel while letting each part stream independently.

Client-side fetching still has a place: anything driven by interaction, polling, infinite scroll, or data that changes while the user watches. That is a query library's job, and the good arrangement is to render the first page on the server and hand it to the client library as initial data.

Two Next-specific pieces are worth knowing. `generateStaticParams` tells the build which dynamic URLs to prerender. And under Cache Components, an uncached fetch must sit inside a `<Suspense>` boundary, or the route can no longer produce a static shell — the dev overlay tells you exactly which read is blocking it.

Route handlers are usually the wrong answer for your own UI. Calling your own `/api` route from a server component adds an HTTP hop to something that could have been a function call; handlers exist for external consumers, webhooks, and clients you do not control.

## Why it matters

Take-home reviewers look at this first, because it is where the App Router most changes how code is written: an effect-based fetch in a client component is the clearest sign someone brought their Pages Router habits along.

Waterfalls are also the standard follow-up in a design round — "your dashboard makes six requests, one after another, how do you fix it?" — and the answer is parallel fetches plus boundaries, not a cache.

## Key points

- `async` server components with plain `await` are the default; no effect, no API route in between.
- Colocate fetches with the component that uses the data — `React.cache` and fetch deduplication remove the duplicate work.
- `Promise.all` for independent requests in one component; pass a promise down and read it with `use` to avoid blocking children.
- Use a client query library for interaction-driven data, seeded with server-rendered initial data.
- Under Cache Components, uncached reads need a Suspense boundary or the route loses its static shell.
- Don't call your own route handlers from server components — that is an HTTP hop replacing a function call.
