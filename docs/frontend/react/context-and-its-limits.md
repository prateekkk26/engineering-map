---
title: Context & Its Limits
summary: What context is actually for, why every consumer re-renders when the value changes, and the patterns that keep it usable at scale.
level: core
minutes: 25
order: 12
tags: [react, state, performance]

related:
  - frontend/react/when-components-rerender
  - frontend/state-and-data/client-state-libraries
  - frontend/state-and-data/state-taxonomy

resources:
  - title: Passing data deeply with context
    url: https://react.dev/learn/passing-data-deeply-with-context
    source: react.dev
    type: docs
    minutes: 25
    primary: true
  - title: How to use React Context effectively
    url: https://kentcdodds.com/blog/how-to-use-react-context-effectively
    source: Kent C. Dodds
    type: article
    minutes: 20
  - title: Scaling up with reducer and context
    url: https://react.dev/learn/scaling-up-with-reducer-and-context
    source: react.dev
    type: docs
    minutes: 20
  - title: useContext
    url: https://react.dev/reference/react/useContext
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

Context is dependency injection for the component tree — a way to avoid threading a value through every level — and it is a broadcast, not a store, so every consumer re-renders whenever the provider's value changes.

## What it is

A provider makes a value available to everything beneath it; `useContext` reads the nearest one above. That solves prop drilling for things that are genuinely ambient: the theme, the current user, a locale, a router, a client instance for a data library.

The performance model is where it goes wrong. There is no selector. When the provider's value changes by `Object.is`, every component calling `useContext` for that context re-renders, whether or not it reads the part that changed. Put frequently-changing state in a context near the root and you have wired a re-render of half the app to every keystroke.

Two mistakes make this worse than it needs to be. Creating the value inline — `value={{user, setUser}}` — allocates a new object every render, so consumers re-render even when nothing changed; memoise it. And bundling unrelated concerns into one context couples them: splitting state from dispatch into two contexts means components that only dispatch never re-render on state changes, because a dispatch function is stable.

Beyond that, the honest answer is that context is not a state manager. It has no selectors, no shallow comparison, no way to subscribe to a slice, and no devtools. When state is large, changes often, or is read in many places, an external store — Zustand, Redux, Jotai, or anything built on `useSyncExternalStore` — gives you subscription at the granularity of the read. The idiomatic combination is a context that carries a *stable* store reference, with subscription handled by the store.

Server state does not belong here either. A context holding fetched data reimplements caching, revalidation, and deduplication badly; that is what a query library is for.

Also worth knowing: in the App Router a provider is a client component, so wrapping the tree in one at the root opts a lot of the app out of server rendering. Push providers as deep as they will go.

## Why it matters

"Why is my whole app re-rendering?" is very often a context holding fast-changing state, and it is a common live-debugging scenario. Interviewers also use "when would you not use context?" to separate people who have only read the docs from people who have hit its limits.

## Key points

- Context solves prop drilling; it does not solve state management, and the two get conflated constantly.
- Every consumer re-renders when the provider value changes — there are no selectors and no partial subscriptions.
- Memoise the provider value, or an inline object literal will invalidate every consumer on every parent render.
- Split state and dispatch into separate contexts so action-only consumers never re-render on state changes.
- For frequently changing or widely read state, put a stable store in context and subscribe through it, ideally via `useSyncExternalStore`.
- In the App Router, providers are client components — mount them as deep in the tree as possible.
