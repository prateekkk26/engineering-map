---
title: You Might Not Need an Effect
summary: The four things effects are actually for, and the much longer list of things people use them for that belong in render, an event handler, or a data library.
level: core
minutes: 25
order: 9
tags: [react, hooks, effects, patterns]

related:
  - frontend/react/useeffect-mental-model
  - frontend/state-and-data/derived-state-and-selectors
  - frontend/state-and-data/server-state-and-cache-semantics

resources:
  - title: You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
    source: react.dev
    type: docs
    minutes: 30
    primary: true
  - title: Separating events from effects
    url: https://react.dev/learn/separating-events-from-effects
    source: react.dev
    type: docs
    minutes: 25
  - title: React Query as a State Manager
    url: https://tkdodo.eu/blog/react-query-as-a-state-manager
    source: TkDodo
    type: article
    minutes: 20
  - title: useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

Effects are for synchronising with systems outside React; if the code has no external system in it, it almost certainly belongs in render, in an event handler, or in a data-fetching library instead.

## What it is

The legitimate uses are a short list: subscribing to an external store or event source, manually manipulating a DOM node React does not own, controlling a non-React widget, and firing analytics on view. Everything else deserves suspicion.

**Derived state** is the biggest category of misuse. An effect that watches `items` and sets `filteredItems` costs an extra render pass, can display a stale value in between, and has to be kept in sync forever. Compute it during render instead — it is a `const`, and if the computation is genuinely expensive, `useMemo` it. The same applies to `fullName` from first and last, totals from line items, and validity from form fields.

**Resetting state when a prop changes** is the second. An effect that clears the form when `userId` changes runs after a render with the wrong data on screen. Passing `key={userId}` resets the whole subtree before it renders at all.

**Reacting to a user action** is the third. If a request should fire because a button was clicked, put it in the click handler. An effect keyed on a state flag turns one intent into two hops, and loses the causal link — the handler knows *why* it happened, which the effect cannot recover.

**Chains of effects** that each set state to trigger the next are the worst version: each link is a full render pass, the intermediate states are visible, and the order is implicit. Compute what you can during render and do the rest in one handler.

**Data fetching in an effect** is legal but rarely what you want beyond the smallest app: you inherit races, caching, deduplication, retries, focus revalidation, and loading state by hand. A query library or the framework's own loader handles all of it, and in an App Router codebase the fetch usually belongs on the server.

The distinguishing question is simply: is there something outside React that has to be told about this? If not, an effect is the wrong tool.

## Why it matters

Effect overuse is the most reliable code smell in a React take-home. It produces double renders, flashes of wrong content, infinite loops, and state that is one interaction behind — and reviewers read it as not having internalised the model.

It is also the fastest way to demonstrate seniority in a live round: deleting an effect and computing the value during render is a visible simplification, and you can explain the change in one sentence.

## Key points

- Effects exist to synchronise with something outside React — a store, a DOM node, a third-party widget, an analytics endpoint.
- Derived values belong in render, not in state kept in sync by an effect; use `useMemo` only when the computation is actually expensive.
- Reset state with a `key` rather than an effect that clears it after the wrong content has already rendered.
- Logic caused by an interaction belongs in the event handler, which knows the intent; an effect only sees the resulting state.
- Effect chains that set state to trigger the next effect cost a render each and make ordering implicit — collapse them.
- Fetching in an effect means owning races, caching, and retries by hand; prefer a query library, a route loader, or the server.
