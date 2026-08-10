---
title: When Components Re-render
summary: The actual triggers for a re-render, why "the props changed" is not one of them, and why most re-renders are harmless.
level: core
minutes: 20
order: 4
tags: [react, rendering, performance]

related:
  - frontend/react/memoisation-usememo-usecallback-memo
  - frontend/react/context-and-its-limits
  - frontend/react/profiling-react-performance

resources:
  - title: A (Mostly) Complete Guide to React Rendering Behavior
    url: https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/
    source: Mark Erikson
    type: article
    minutes: 35
    primary: true
  - title: Why React Re-Renders
    url: https://www.joshwcomeau.com/react/why-react-re-renders/
    source: Josh W. Comeau
    type: article
    minutes: 20
  - title: Fix the slow render before you fix the re-render
    url: https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render
    source: Kent C. Dodds
    type: article
    minutes: 10
---

## In one line

A component re-renders because its own state changed, because its parent re-rendered, or because a context it consumes changed — not because its props are different.

## What it is

There are three triggers. A state update in the component itself. A re-render of its parent, which by default re-renders all children regardless of whether their props changed. And a change to the value of a context the component subscribes to. A hook like `useSyncExternalStore` is the same story one level down: it schedules a state update.

The one that surprises people is the second. Props are not watched. When a parent renders, it produces new elements for its children, and React re-renders those children by default — with identical props, with no props at all, it does not matter. `memo` is what turns that default off, by adding a props comparison before the child's render.

That default sounds expensive and usually isn't. Re-rendering means calling the function and diffing the output; if the output is unchanged, the commit phase has nothing to do and the DOM is never touched. The cost is the function call and the diff, which for most components is measured in microseconds. Rendering is not the same as painting.

The cases where it does matter are narrow and worth naming: a component that renders thousands of nodes, a component doing genuinely expensive work in its body, a re-render cascade fired on every keystroke or scroll event, and a context whose value changes often and is consumed high in the tree.

Which is why the diagnosis order is fixed: find the *slow* render before you fix the *frequent* one. A component rendering 200 times per second is fine if each render costs 0.05ms. One render costing 40ms blocks a frame no matter how rarely it happens, and memoising its parent will not help.

The structural fixes usually beat the memo ones. Moving state down to the component that actually uses it shrinks the subtree that re-renders. Passing children through as a prop means the parent's state change cannot re-render them, because their elements were created by the grandparent and are unchanged.

## Why it matters

"Why does this re-render?" is a live-debugging question in practical rounds, and the mid-level answer — sprinkle `memo` and `useCallback` — makes code harder to read while measurably slowing most apps down. The senior answer is to name the trigger, then decide whether the render is actually costing anything.

## Key points

- The three triggers are own state, parent render, and consumed context. Changed props are not a trigger; unchanged props do not stop a render either.
- A re-render is a function call plus a diff. If the output matches, nothing reaches the DOM, and the cost is usually negligible.
- Fix slow renders before frequent ones: a single 40ms render drops a frame, while a hundred 0.05ms renders do not.
- Moving state down and passing `children` as a prop remove re-renders structurally, without the memory and complexity cost of memoisation.
- Context re-renders every consumer whenever the provider's value changes, regardless of which part of the value they read.
- Strict Mode's double render in development inflates counts — measure in a production build before believing a number.
