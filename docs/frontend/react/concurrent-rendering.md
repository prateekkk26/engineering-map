---
title: Concurrent Rendering
summary: What "interruptible rendering" actually buys you, and the two hooks — useTransition and useDeferredValue — that let you use it.
level: core
minutes: 25
order: 15
tags: [react, rendering, performance]

related:
  - frontend/react/fiber-architecture
  - frontend/react/suspense-and-streaming
  - frontend/performance/inp-and-long-tasks

resources:
  - title: Concurrent rendering in React 18
    url: https://github.com/reactwg/react-18/discussions/46
    source: React 18 Working Group
    type: article
    minutes: 20
    primary: true
  - title: useTransition
    url: https://react.dev/reference/react/useTransition
    source: react.dev
    type: docs
    minutes: 20
  - title: useDeferredValue
    url: https://react.dev/reference/react/useDeferredValue
    source: react.dev
    type: docs
    minutes: 20
  - title: React v18.0
    url: https://react.dev/blog/2022/03/29/react-v18
    source: react.dev
    type: article
    minutes: 20
---

## In one line

Concurrent rendering lets React work on a render in the background, pause it when something more urgent arrives, and throw it away if it becomes irrelevant — so a slow update stops blocking a fast one.

## What it is

It is not multithreading. React still runs on one thread; what changed is that the render phase became interruptible, so React can render a few fibers, hand control back to the browser, and continue afterwards. The browser gets a chance to paint and to process input between chunks.

That only helps if React knows what is urgent. Updates carry a priority — a lane — and the default for anything triggered by an interaction is urgent. Marking an update as a **transition** says the opposite: this can wait, and it can be interrupted.

`useTransition` gives you `startTransition` and an `isPending` flag. The canonical case is a filter over a large list: the keystroke updates the input value urgently, and the expensive list re-render goes in a transition. Typing stays responsive because each new keystroke interrupts the in-progress list render and starts a fresh one, and `isPending` lets you dim the stale results rather than blanking them.

`useDeferredValue` is the same idea when you do not own the setter. It returns the previous value while a new one is being rendered in the background — useful for a value arriving as a prop, or wrapping an expensive child so it lags rather than blocks.

Two things worth being precise about. Concurrency does not make rendering faster; it makes it *interruptible*, so a slow render is less visible but still slow. And it does nothing for a single long synchronous computation inside one component — React can only yield between units of work, so a 200ms sort in a render body still blocks the frame. That belongs in `useMemo`, a worker, or the server.

Opting in happens at the root: `createRoot` enables concurrent features, and updates are only concurrent where you mark them so. Everything else keeps the old synchronous behaviour, which is what made React 18 adoptable incrementally.

## Why it matters

INP is a Core Web Vital, and the interactions that fail it are usually exactly this shape: a keystroke or click that triggers an expensive re-render. Transitions are the React-level tool for that, and knowing when they help — and when the real fix is less work, not deferred work — is the senior distinction.

It also comes up as a React 18 question, where "concurrent mode makes React multithreaded" is a common and immediately disqualifying wrong answer.

## Key points

- Rendering became interruptible; it did not become parallel. There is still one thread.
- Updates inside `startTransition` are low priority and can be interrupted, discarded, and restarted by urgent input.
- `isPending` lets you show stale content with an indicator instead of a spinner over a blank region.
- `useDeferredValue` applies the same deferral to a value you did not create, letting an expensive subtree lag behind.
- Concurrency cannot break up one long synchronous computation — React only yields between units of work.
- Concurrent behaviour requires `createRoot` and is opt-in per update, which is why React 18 could ship without a rewrite.
