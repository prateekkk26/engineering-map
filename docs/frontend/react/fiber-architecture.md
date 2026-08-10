---
title: Fiber Architecture
summary: The linked-list rewrite of React's reconciler that made rendering interruptible, and the vocabulary it gave the rest of React.
level: deep
minutes: 30
order: 5
tags: [react, internals, rendering]

related:
  - frontend/react/concurrent-rendering
  - frontend/react/react-mental-model
  - frontend/react/reconciliation-and-keys

resources:
  - title: React Fiber Architecture
    url: https://github.com/acdlite/react-fiber-architecture
    source: Andrew Clark
    type: article
    minutes: 30
    primary: true
  - title: A Cartoon Intro to Fiber
    url: https://www.youtube.com/watch?v=ZCuYPiUIONs
    source: Lin Clark, React Conf 2017
    type: video
    minutes: 32
  - title: react-reconciler
    url: https://github.com/facebook/react/tree/main/packages/react-reconciler
    source: facebook/react
    type: repo
---

## In one line

Fiber re-implements the component tree as a linked list of mutable work units so React can pause, resume, reprioritise, and abandon rendering work instead of running it in one blocking recursion.

## What it is

The pre-16 reconciler walked the tree with plain recursion. Once a render started it ran to completion, because the work in progress lived on the JavaScript call stack and there is no way to pause a call stack. A large update meant a long task, and a long task means dropped frames and unresponsive input.

Fiber makes the stack a data structure React owns. Each component instance gets a **fiber** — an object holding its type, props, state, and hook list, plus `child`, `sibling`, and `return` pointers. Those three pointers let React traverse the whole tree with a loop instead of recursion, keeping the current position in a variable. A variable can be parked and picked up later; a call stack cannot.

Work happens in two passes. The **render phase** walks the tree building an alternate copy — the work-in-progress tree, double-buffered against the current one — calling components, diffing output, and tagging fibers with effects to perform. It is interruptible: React checks whether it has run out of time or whether higher-priority work arrived, and if so, yields to the browser and resumes later. Work already done can be thrown away entirely, which is exactly why the render phase has to be pure.

The **commit phase** walks the list of tagged effects and applies them to the DOM, then runs layout effects and passive effects. It is synchronous and uninterruptible, because a half-applied DOM is a visibly broken screen.

Priority is the payoff. Every update carries a lane, and lanes have priorities: a click or a text input is urgent, a transition is not. High-priority work can interrupt an in-progress low-priority render, and the abandoned work restarts from the top later.

## Why it matters

Fiber is not something you use, but it is the reason the modern APIs exist and behave the way they do — `useTransition`, Suspense, selective hydration, and the "your render function may be called and discarded" rule all fall out of it. Knowing it turns those rules from arbitrary constraints into consequences.

It is also a favourite deep-dive question for senior frontend loops, usually phrased as "what actually changed in React 16?" or "how can React interrupt a render?" A clear answer needs the linked list, the two phases, and the double buffer.

## Key points

- A fiber is a mutable work unit per component instance, linked by `child`, `sibling`, and `return` — a call stack React can pause because it owns the memory.
- Traversal is a loop over that list, not recursion, which is what makes yielding between units possible at all.
- The render phase is interruptible and its results are discardable, which is the underlying reason components must be pure.
- The commit phase is a single synchronous pass over tagged effects, because a partially applied DOM would be visible to the user.
- Two trees exist at once — current and work-in-progress — and committing is a pointer swap between them.
- Lanes attach a priority to each update, letting urgent input interrupt and outrank in-flight low-priority rendering.
