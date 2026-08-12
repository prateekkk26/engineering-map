---
title: Layout Thrashing & Forced Reflow
summary: The read-write-read loop that turns one layout into hundreds, how to spot it in a profile, and how to break it.
level: core
minutes: 20
order: 4
tags: [browser, performance, rendering]

related:
  - frontend/browser-platform/critical-rendering-path
  - frontend/browser-platform/compositing-and-gpu-layers
  - frontend/performance/rendering-performance
  - frontend/browser-platform/the-observer-apis

resources:
  - title: Avoid large, complex layouts and layout thrashing
    url: https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing
    source: web.dev
    type: article
    minutes: 20
    primary: true
  - title: What forces layout / reflow
    url: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    source: Paul Irish
    type: repo
  - title: requestAnimationFrame
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
    source: MDN
    type: docs
    minutes: 15
---

## In one line

The browser batches layout until you read a geometric property, which forces it to compute immediately — so alternating reads and writes in a loop makes it recompute the whole page on every iteration.

## What it is

Normally the browser is lazy in a useful way: style and layout changes queue up and are resolved once, before the next paint. One function making fifty DOM writes produces one layout.

Reading breaks that. `offsetHeight`, `getBoundingClientRect()`, `scrollTop`, `clientWidth`, `getComputedStyle()` and friends must return a correct answer *now*, so the browser flushes all pending work before answering. That is a **forced synchronous layout**.

**Thrashing** is doing it in a loop:

```js
for (const el of items) {
  el.style.height = el.offsetHeight + 10 + 'px' // read, then write, then read...
}
```

Each iteration writes (invalidating layout) then reads (forcing recomputation). A hundred items means a hundred full layouts instead of one. On a large page each can be several milliseconds, so a loop that looks trivial blocks the main thread for hundreds.

The fix is separating the phases. Read everything first into an array, then write everything:

```js
const heights = items.map((el) => el.offsetHeight)
items.forEach((el, i) => (el.style.height = heights[i] + 10 + 'px'))
```

One layout. Same result. The general principle — batch reads, then batch writes — is what libraries like FastDom formalise, and what `requestAnimationFrame` helps schedule when writes should land just before a paint.

Spotting it is straightforward once you know the label: in the Chrome performance panel, purple layout blocks with a warning triangle and "Forced reflow is a likely performance bottleneck", usually stacked in a repeating pattern. The call stack points at the exact read.

Reducing the cost of each layout is the second lever. Layout cost scales with the number of affected elements, so shallower trees, `contain: layout` on independent regions, and avoiding layout-triggering properties in animations all help. Animating `transform` and `opacity` skips layout entirely because they are compositor properties.

Framework users are not exempt. React batches its own writes, but a `useLayoutEffect` that measures and then sets state that changes layout, repeated per item, reproduces exactly the same loop.

## Why it matters

This is one of the most common causes of janky drag interactions, sluggish resize handlers, and slow list rendering — and it is invisible in code review because each line looks harmless.

"What is a forced reflow and how would you find one?" is a standard senior browser question, and the answer is concrete: read/write separation and a named warning in the profiler.

## Key points

- Layout is batched until something reads geometry, which forces an immediate synchronous recomputation.
- Alternating writes and reads in a loop produces one full layout per iteration.
- Fix by batching all reads first, then all writes — same code, one layout.
- Chrome's performance panel names it directly: "Forced reflow is a likely performance bottleneck".
- Reduce per-layout cost with shallower trees and `contain: layout` on independent regions.
- Animate `transform` and `opacity` to skip layout entirely.
- Frameworks do not protect you — a measure-then-set-state effect per item is the same loop.
