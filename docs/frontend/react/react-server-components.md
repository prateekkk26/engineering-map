---
title: React Server Components
summary: Components that run only on the server and ship their output instead of their code, and the boundary rules that follow from that.
level: core
minutes: 30
order: 21
tags: [react, rsc, ssr, architecture]

related:
  - frontend/react/suspense-and-streaming
  - frontend/nextjs/server-vs-client-components
  - frontend/react/react-19-actions

resources:
  - title: Why Server Components?
    url: https://github.com/reactwg/server-components/discussions/5
    source: React Server Components Working Group
    type: article
    minutes: 30
    primary: true
  - title: Server Components
    url: https://react.dev/reference/rsc/server-components
    source: react.dev
    type: docs
    minutes: 25
  - title: Making Sense of React Server Components
    url: https://www.joshwcomeau.com/react/server-components/
    source: Josh W. Comeau
    type: article
    minutes: 35
  - title: Server and Client Components
    url: https://nextjs.org/docs/app/getting-started/server-and-client-components
    source: Next.js
    type: docs
    minutes: 20
---

## In one line

A server component runs once on the server, has no state and no effects, and sends a serialised description of its output to the browser — so its code, and the libraries it uses, never reach the bundle.

## What it is

This is not SSR. Server rendering runs your components on the server to produce HTML, then ships the same components to the client to hydrate them. A server component is never sent at all: it runs on the server, and what crosses the wire is the RSC payload — a serialised element tree, not JavaScript.

That gives two things. Direct access to server resources: a server component can query the database, read the filesystem, or use a secret, with no API route in between. And bundle savings that scale with what the component uses — a markdown renderer, a syntax highlighter, or a date library used only in a server component costs the client nothing.

The price is interactivity. No `useState`, no `useEffect`, no event handlers, no browser APIs, because none of that exists in a single server-side pass. Anything interactive is a **client component**, marked with `'use client'` at the top of the file.

The boundary is the whole design problem. `'use client'` marks an entry point, not one component: everything imported from that module graph downstream is client code too. So a provider at the root drags the tree with it, and the pattern that works is to push client components to the leaves — the button, the input, the chart — and keep layout and data fetching above them.

Composition still works across the boundary in one direction. A server component cannot import a client component's state, but it can render a client component and pass it *children* — already-rendered server output. That is how an interactive shell can wrap server-rendered content, and it is the escape hatch people miss.

Props crossing the boundary must be serialisable: primitives, plain objects, arrays, dates, promises. Functions and class instances cannot cross, which is why callbacks are replaced by server actions.

Every server component can `await`. Data fetching becomes a normal `await` in the component body, colocated with the markup that uses it, with Suspense boundaries deciding what streams and when.

## Why it matters

The App Router is built on this, and it is the default for new React work at the companies that use Next.js. The interview question is almost always "server components versus SSR" or "when would you add `'use client'`", and both are testing whether you understand the boundary rather than the syntax.

It also changes the performance conversation: the biggest wins now come from what you *don't* ship, not from optimising what you do.

## Key points

- Server components run once on the server and ship serialised output — their code never enters the bundle, unlike SSR.
- They can touch the database, filesystem, and secrets directly, removing a layer of API endpoints.
- No state, no effects, no event handlers, no browser APIs — anything interactive needs `'use client'`.
- `'use client'` marks a boundary for a whole import graph, so client components belong at the leaves.
- Server components can pass rendered children into client components, which is how interactive shells wrap server content.
- Props across the boundary must serialise; functions are replaced by server actions.
- `await` in the component body is the data-fetching model, with Suspense deciding what streams.
