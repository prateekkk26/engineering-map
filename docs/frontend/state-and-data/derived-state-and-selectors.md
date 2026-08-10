---
title: Derived State & Selectors
summary: Why computed values should not be stored, and how selectors keep derivation cheap without duplicating truth.
level: core
minutes: 20
order: 6
tags: [state, performance, patterns]

related:
  - frontend/react/you-might-not-need-an-effect
  - frontend/state-and-data/client-state-libraries
  - frontend/react/memoisation-usememo-usecallback-memo

resources:
  - title: You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state
    source: react.dev
    type: docs
    minutes: 25
    primary: true
  - title: Deriving Data with Selectors
    url: https://redux.js.org/usage/deriving-data-selectors
    source: Redux
    type: docs
    minutes: 25
  - title: Reselect
    url: https://github.com/reduxjs/reselect
    source: Redux
    type: repo
---

## In one line

If a value can be computed from other state, compute it during render — storing it creates a second copy of the truth that will eventually disagree with the first.

## What it is

The anti-pattern is easy to recognise once named: `items` in state, plus `filteredItems` in state, plus an effect keeping the second in sync with the first. Now there are two sources of truth, an extra render pass between them, and a window where the screen shows a filtered list that does not match the items.

The fix is that `filteredItems` is not state, it is a `const`. Compute it in the render body from `items` and the filter. There is no synchronisation problem because there is nothing to synchronise.

The reflexive objection is performance, and it is usually wrong. Filtering a few hundred items is microseconds — far cheaper than an extra render plus the reconciliation it causes. `useMemo` is for genuinely expensive derivation: sorting tens of thousands of rows, building an index, parsing a large payload. Measure before assuming, and remember every memo has its own cost.

In a store, the same idea is a **selector**: a function from state to a derived value, defined next to the state rather than in the component. That gives one definition of "the active items" for the whole app, and it decouples components from the store's shape — reshape the state and you fix the selector, not thirty call sites.

Selector memoisation is where the subtlety lives. A selector returning a new array or object every call defeats reference equality and re-renders every subscriber on every store change, even when nothing relevant changed. `createSelector` from Reselect memoises on inputs; Zustand offers `useShallow` for the same reason. This is the single most common cause of "my store re-renders everything".

Two more rules keep this clean. Store the minimal representation — an id rather than the whole selected object, so it cannot go stale when the object updates. And keep derivation pure: a selector that fetches, mutates, or reads the clock will misbehave under memoisation and concurrent rendering.

## Why it matters

Duplicated derived state is one of the most common sources of "the UI shows something impossible", and it survives review because each half looks reasonable. Being able to spot it and collapse it into a computed value is a fast, visible improvement in a take-home.

## Key points

- Anything computable from existing state is a derived value, not state — compute it during render.
- Storing a derived copy creates two truths, an extra render pass, and a window where they disagree.
- `useMemo` is for measurably expensive derivation, not for every computed value.
- Selectors put the derivation next to the state, giving one definition and insulating components from the store's shape.
- A selector returning a fresh object each call breaks reference equality and re-renders every subscriber — memoise or compare shallowly.
- Store minimal state such as ids rather than whole objects, so the derived value cannot go stale.
