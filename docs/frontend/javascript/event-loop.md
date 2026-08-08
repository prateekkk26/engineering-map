---
title: Event Loop, Microtasks & Macrotasks
summary: How JavaScript schedules async work, and why a promise callback always beats a zero-delay timer.
level: core
minutes: 25
order: 4
tags: [async, runtime, browser]

related:
  - _shared/concurrency-models
  - frontend/javascript/promises-deep-dive
  - frontend/javascript/scheduling-and-timers

resources:
  - title: In The Loop — the browser event loop, setTimeout, microtasks, requestAnimationFrame
    url: https://www.youtube.com/watch?v=cCOL7MC4Pl0
    source: Jake Archibald, JSConf Asia
    type: video
    minutes: 34
    primary: true
  - title: Tasks, microtasks, queues and schedules
    url: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
    source: Jake Archibald
    type: article
    minutes: 15
  - title: The event loop
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
    source: MDN
    type: docs
    minutes: 10
  - title: Event loops
    url: https://html.spec.whatwg.org/multipage/webappapis.html#event-loops
    source: WHATWG HTML spec
    type: docs
    minutes: 20
---

## In one line

JavaScript runs on a single thread that pulls one task at a time off a queue, and drains every pending microtask before it picks up the next one.

## What it is

JavaScript has one call stack. When a function runs, nothing else runs. Anything asynchronous — a timer, a network response, a click — doesn't interrupt the running code; it gets queued, and the runtime picks it up once the stack is empty.

The subtlety is that there isn't one queue, there are two kinds. **Macrotasks** (the spec calls them just "tasks") are things like `setTimeout` callbacks, I/O completions, and UI events. **Microtasks** are promise reactions, `queueMicrotask`, and `MutationObserver` callbacks.

The loop is: run one macrotask to completion, then drain the *entire* microtask queue — including microtasks queued by other microtasks — then, if it's a good moment, render. Only then take the next macrotask. That asymmetry is the whole thing. One macrotask per turn; all microtasks per turn.

This is why an infinite chain of promises will freeze the page while an infinite chain of `setTimeout` calls will not. The microtask queue must fully drain before the loop moves on, so a self-scheduling microtask never lets it. Rendering is starved along with everything else.

Node.js runs the same conceptual model with a more elaborate macrotask side — distinct phases for timers, I/O callbacks, `setImmediate`, and close handlers — plus `process.nextTick`, which drains *before* the promise microtask queue. The microtask rule is unchanged; only the macrotask bookkeeping differs.

## Why it matters

This is the mechanism behind an entire class of bugs that look like magic: state that's stale by one tick, a `setTimeout(fn, 0)` that fires later than you expected, an animation that stutters because a promise chain is starving the renderer. Being able to explain the ordering — rather than reaching for `setTimeout(fn, 0)` until it works — is a standard line between mid and senior in a frontend interview.

It also underpins React's batching, `await` semantics in loops, and every "why didn't my UI update" question, so it pays back across a lot of other topics.

## Key points

- A promise callback always runs before a `setTimeout(fn, 0)` scheduled in the same tick, because the microtask queue drains fully before the next macrotask is taken.
- Microtasks queued *by* microtasks run in the same drain — which is why a self-scheduling microtask can lock the page, and a self-scheduling `setTimeout` cannot.
- Rendering happens between macrotasks, never in the middle of one. Long synchronous work blocks paint regardless of how you schedule around it.
- `setTimeout(fn, 0)` does not mean "now" — it means "no sooner than 0ms, on a future macrotask turn," and browsers clamp nested timers to ~4ms.
- `await` is syntax over a promise reaction: everything after an `await` is a microtask continuation, not a synchronous continuation.
- In Node, `process.nextTick` drains before promise microtasks — a separate, higher-priority queue that is a common source of surprise.
- The single-threaded model applies to the main thread only. Web Workers get their own thread and their own event loop, which is the actual fix for CPU-bound work.
