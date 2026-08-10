---
title: Suspense & Streaming
summary: How a component suspends, what the boundary is actually for, and why streaming SSR changed what a loading state costs.
level: core
minutes: 25
order: 16
tags: [react, suspense, ssr, rendering]

related:
  - frontend/react/react-server-components
  - frontend/react/the-use-hook
  - frontend/nextjs/streaming-and-loading-ui

resources:
  - title: Suspense
    url: https://react.dev/reference/react/Suspense
    source: react.dev
    type: docs
    minutes: 25
    primary: true
  - title: New Suspense SSR Architecture in React 18
    url: https://github.com/reactwg/react-18/discussions/37
    source: React 18 Working Group
    type: article
    minutes: 30
  - title: renderToPipeableStream
    url: https://react.dev/reference/react-dom/server/renderToPipeableStream
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

Suspense lets a component tell React "I am not ready yet", and the nearest boundary above it shows a fallback until it is — which on the server means the rest of the page can be sent immediately and the slow part streamed in later.

## What it is

A suspending component throws a promise rather than returning markup. React catches it, walks up to the nearest `<Suspense>` boundary, renders that boundary's fallback, and retries the subtree when the promise settles. The component never sees a loading state; the boundary owns it.

The important consequence is that loading UI stops being per-component. Instead of every card owning a spinner, you place boundaries where the layout should degrade — which also decides how many independent loading states the page has. A boundary that wraps too much blanks half the screen; too many and the page becomes a mosaic of shifting placeholders.

What can suspend is deliberately narrow: framework-integrated data fetching, `React.lazy`, and promises read with the `use` hook. Suspense is not a general "await anything in a component" mechanism, and an effect-based fetch does not suspend at all.

Streaming SSR is where it pays off most. Without it, server rendering is all-or-nothing: the server waits for every data dependency, renders one HTML string, sends it, and the client hydrates the whole tree before anything is interactive. With `renderToPipeableStream` and boundaries, the server sends the shell immediately, keeps the connection open, and pushes each boundary's real content as its data resolves — the browser swaps the fallback out with an inline script.

Hydration gets the same treatment. Selective hydration means React hydrates boundaries as their HTML arrives, and prioritises the one the user just interacted with, so a click on a hydrated-late component is replayed rather than lost. This is why a slow API call no longer holds the whole page hostage.

Two practical notes. A fallback that changes size causes layout shift, so match the real content's dimensions. And an update that would hide already-visible content behind a fallback should be wrapped in a transition — that is the interaction between Suspense and concurrent rendering that catches people out.

## Why it matters

Every App Router codebase is built on this: `loading.tsx` is a Suspense boundary, and where you put boundaries determines the page's perceived speed far more than total load time does. Interviewers ask "how would you make this page feel fast?" and the good answer is boundary placement plus streaming, not a bigger cache.

## Key points

- A suspending component signals "not ready" and the nearest boundary above renders its fallback; the component itself has no loading branch.
- Boundary placement is a design decision — it decides which regions degrade independently and how the page fills in.
- Only integrated data sources, `React.lazy`, and `use` can suspend; effect-based fetching cannot.
- Streaming SSR sends the shell first and pushes each boundary's HTML as its data resolves, over one response.
- Selective hydration hydrates boundaries as they arrive and prioritises the one the user interacted with.
- Wrap updates that would replace visible content with a fallback in a transition, and size fallbacks to avoid layout shift.
