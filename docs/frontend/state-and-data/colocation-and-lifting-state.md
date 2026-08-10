---
title: Colocation & Lifting State
summary: Keeping state as close to where it is used as possible, and the disciplined exceptions when it has to move up.
level: core
minutes: 20
order: 2
tags: [state, architecture, performance]

related:
  - frontend/state-and-data/state-taxonomy
  - frontend/react/when-components-rerender
  - frontend/react/context-and-its-limits

resources:
  - title: State Colocation will make your React app faster
    url: https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster
    source: Kent C. Dodds
    type: article
    minutes: 15
    primary: true
  - title: Sharing state between components
    url: https://react.dev/learn/sharing-state-between-components
    source: react.dev
    type: docs
    minutes: 25
  - title: Choosing the state structure
    url: https://react.dev/learn/choosing-the-state-structure
    source: react.dev
    type: docs
    minutes: 25
---

## In one line

State belongs in the lowest component that needs it, and every level you lift it is a wider re-render, a longer prop chain, and more code that has to know it exists.

## What it is

Lifting state is taught early — two siblings need the same value, so it moves to the parent. What is taught less is that lifting has a cost and the default should be to push state *down*, not up.

The performance cost is direct. State lives in a component; when it changes, that component and everything below it re-renders. Hold the search input's value at the top of a page and every keystroke re-renders the whole page. Hold it in the search box, and each keystroke re-renders a text input. Same feature, entirely different cost profile.

The maintenance cost is larger and less visible. State at the top of a tree is in scope for everything below it, so anything can start depending on it. A value that was one component's business becomes an implicit contract across a screen, and it gets harder to delete every month.

When state genuinely must be shared, there are three moves before reaching for a store. Lift it to the **closest common ancestor** — not the top. **Pass children through** so the parent's state change cannot re-render the parts it does not own. Or **extract the stateful part into its own component** so the state comes back down with it: a page that re-renders on every keystroke often just needs the input and its results wrapped together.

The counter-pressure is real: colocated state does not survive unmounting. A filter panel that resets when collapsed, or a wizard step that forgets its input when you navigate back, is colocation applied where persistence was needed. That is when it goes to the URL, a store, or the server.

Server state is the exception to all of this. Colocating a query in the component that renders it is right, but the *cache* is global by nature — which is why query libraries keep one cache and let any component subscribe to it.

## Why it matters

"This page re-renders on every keystroke" is one of the most common real performance complaints, and moving state down fixes it structurally — no memoisation, less code. Reviewers of take-homes notice the opposite too: a `useState` at the top of a page for something one input owns reads as not having thought about ownership.

## Key points

- State re-renders its owner and everything below, so the height at which it lives determines the cost of every change.
- Prefer pushing state down; lift only to the closest common ancestor, never to the top by reflex.
- Passing `children` through lets a parent hold state without re-rendering the subtree it received.
- Extracting the stateful part into its own component brings the state back down with it.
- Colocated state is lost on unmount — if it must survive, that is a signal for the URL, a store, or the server.
- Server state is the exception: colocate the query, but the cache itself is shared by design.
