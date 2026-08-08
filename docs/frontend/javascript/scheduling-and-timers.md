---
title: Scheduling, Timers & Yielding
summary: What `setTimeout(fn, 0)` actually promises, and how to hand the main thread back so the page stays responsive.
level: core
minutes: 20
order: 7
tags: [async, runtime, browser, performance]

related:
  - frontend/javascript/event-loop
  - frontend/performance/inp-and-long-tasks
  - frontend/browser-platform/critical-rendering-path

resources:
  - title: Optimize long tasks
    url: https://web.dev/articles/optimize-long-tasks
    source: web.dev
    type: article
    minutes: 20
    primary: true
  - title: setTimeout
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
    source: MDN
    type: docs
    minutes: 10
  - title: requestAnimationFrame
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
    source: MDN
    type: docs
    minutes: 8
  - title: Scheduler API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API
    source: MDN
    type: docs
    minutes: 12
---

## In one line

Every scheduling primitive is a way of choosing *when in the event loop* your work runs, and picking the wrong one is how pages end up janky.

## What it is

`setTimeout(fn, delay)` means "run this no sooner than `delay` ms, on some future macrotask turn." It is a floor, not a promise. If the main thread is busy, the callback waits. Nested timers are clamped to roughly 4ms after five levels of nesting, and background tabs are throttled far harder — timers there may fire once a minute or not at all, which is why polling with `setInterval` is unreliable for anything that must keep time.

`setInterval` compounds the problem: it schedules on a fixed cadence regardless of how long the callback takes, so slow callbacks queue up and run back to back. A self-scheduling `setTimeout` is almost always the better shape, because the next delay starts after the previous run finishes.

`queueMicrotask` schedules on the microtask queue, which drains completely before the next macrotask. Use it to defer work to the end of the current turn without yielding the thread. Do not use it to break up long work — microtasks starve rendering, so a chain of them blocks paint just as effectively as a synchronous loop.

`requestAnimationFrame` runs immediately before the browser paints, which makes it the only correct place to apply visual changes. Anything that reads layout should happen at the start of the callback and anything that writes should happen after, or you reintroduce layout thrashing.

`requestIdleCallback` runs when the browser has spare time in a frame, with a deadline you are expected to respect. It is right for genuinely optional work — prefetching, analytics flushing, cache warming — and wrong for anything the user is waiting on, since under sustained load it may never fire.

**Yielding** is the modern concern. A task over 50ms is a "long task" and blocks input, which is what INP measures. The fix is to break the work into chunks and hand control back between them. `scheduler.yield()` is the purpose-built primitive: it yields to the browser but keeps your continuation at high priority, so you don't lose your place behind unrelated work. Where it isn't available, `await new Promise(r => setTimeout(r, 0))` is the fallback, at the cost of going to the back of the macrotask queue. `scheduler.postTask()` lets you schedule with explicit `user-blocking` / `user-visible` / `background` priorities.

For CPU-bound work, none of this is the real answer — yielding makes a long computation politer, not faster. Move it to a worker.

## Why it matters

INP is a Core Web Vital, and the most common cause of a bad one is a single long task blocking the response to a click. "How would you keep this responsive?" is a standard follow-up in both the practical and design rounds, and "chunk it and yield with `scheduler.yield`, or move it off-thread" is the answer that separates a real one from "I'd debounce it."

It also explains a whole class of bugs: animations that stutter because they're driven by `setTimeout`, intervals that drift, and code that "works locally" but not on a mid-range Android.

## Key points

- `setTimeout(fn, 0)` guarantees a minimum delay and a future macrotask turn, not immediacy — nested timers clamp to ~4ms and background tabs throttle aggressively.
- `setInterval` schedules on a fixed cadence regardless of callback duration, so a self-rescheduling `setTimeout` is the safer pattern for anything that can run long.
- `queueMicrotask` defers to the end of the current turn without yielding the thread, so it cannot be used to unblock rendering.
- `requestAnimationFrame` is the only correct place to apply visual updates, because it runs immediately before paint.
- `requestIdleCallback` is for genuinely discardable work; under sustained main-thread load it may never run.
- Any task over 50ms blocks input and shows up directly in INP — the fix is chunking plus an explicit yield, not a shorter timeout.
- `scheduler.yield()` returns control to the browser while keeping your continuation prioritised; a `setTimeout(0)` yield sends you to the back of the queue instead.
- Yielding does not make CPU-bound work faster. If the computation is the problem, a Web Worker is the answer.
