---
title: Client State Libraries
summary: Redux Toolkit, Zustand, Jotai and the rest — what actually distinguishes them, and when the answer is none of them.
level: core
minutes: 25
order: 5
tags: [state, libraries, architecture]

related:
  - frontend/state-and-data/state-taxonomy
  - frontend/react/context-and-its-limits
  - frontend/state-and-data/derived-state-and-selectors

resources:
  - title: Why React Context is not a "state management" tool
    url: https://blog.isquaredsoftware.com/2021/01/context-redux-differences/
    source: Mark Erikson
    type: article
    minutes: 25
    primary: true
  - title: Zustand
    url: https://github.com/pmndrs/zustand
    source: pmndrs
    type: repo
  - title: Redux Toolkit — Quick Start
    url: https://redux-toolkit.js.org/tutorials/quick-start
    source: Redux
    type: docs
    minutes: 25
  - title: Jotai
    url: https://jotai.org/docs/introduction
    source: Jotai
    type: docs
    minutes: 20
  - title: useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

Every one of these libraries exists to do the one thing context cannot — let a component subscribe to a *slice* of state and re-render only when that slice changes.

## What it is

Start with why context is not enough. Context has no selector: when the provider value changes, every consumer re-renders regardless of which part it reads. That is fine for a theme and wrong for anything that changes often. A store solves it by keeping state outside React and letting each component subscribe with a selector, so a component reading `user.name` is untouched when `cart.items` changes. `useSyncExternalStore` is the React API that makes this safe under concurrent rendering, and most modern libraries are built on it.

The differences that actually matter:

**Redux Toolkit** is the structured option. One store, typed slices, Immer for readable immutable updates, devtools with time travel, and a strong convention that survives a large team. The boilerplate criticism applies to 2016 Redux, not RTK. Worth it when traceability across many writers is a genuine requirement.

**Zustand** is a hook with a store behind it. A few lines to define, selectors built in, no provider needed. It is the default recommendation for most apps because it costs almost nothing to adopt and almost nothing to remove.

**Jotai** (and Recoil before it) inverts the model: state is composed from atoms, and derived atoms recompute only when their dependencies change. This suits graph-shaped state — editors, canvases, dependent form fields — where a single store object would be one big invalidation unit.

**Valtio** and MobX offer mutable, proxy-based state: write `state.count++` and subscribers update. Ergonomic, at the cost of the explicit action log that makes changes traceable.

The most important judgement is the one before the choice: most apps that feel like they need a store need a *query library*, because the state in question is server state. Once that moves out, what remains is often small enough for `useState` plus one context, and no library is the right answer.

## Why it matters

"Which state library and why?" is a standard senior question, and the strong answer is not a favourite — it is a rule for choosing, plus the observation that the volume of global state usually shrinks once server state is handled properly.

## Key points

- The one thing every store does that context cannot is selector-based subscription: re-render only on the slice you read.
- `useSyncExternalStore` is the underlying React primitive and the reason these libraries are concurrent-safe.
- Redux Toolkit buys convention, devtools, and traceability — worth it when many writers touch the same state.
- Zustand is the low-ceremony default: cheap to adopt, cheap to remove, selectors included.
- Jotai's atoms suit graph-shaped derived state where one store object would over-invalidate.
- Proxy-based stores trade the explicit action log for ergonomics.
- Move server state to a query library first; what remains often needs no library at all.
