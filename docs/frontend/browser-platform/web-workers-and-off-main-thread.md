---
title: Web Workers & Off-Main-Thread Work
summary: Real parallelism in the browser, what it costs to move data across the boundary, and when it is the only fix.
level: core
minutes: 20
order: 16
tags: [browser, performance, concurrency]

related:
  - _shared/concurrency-models
  - frontend/performance/inp-and-long-tasks
  - frontend/javascript/event-loop

resources:
  - title: Using Web Workers
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Comlink
    url: https://github.com/GoogleChromeLabs/comlink
    source: Google Chrome Labs
    type: repo
  - title: Transferable objects
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
    source: MDN
    type: docs
    minutes: 15
---

## In one line

A worker is a second thread with its own event loop and no DOM access, communicating by message passing — the only real fix for CPU-bound work that would otherwise block the frame.

## What it is

Everything else in the browser is cooperative scheduling on one thread: `async`/`await`, transitions, `requestIdleCallback` all just decide *when* work runs, not *where*. A 500ms parse blocks the frame regardless of how you schedule it. A worker actually moves it.

The boundary is message passing. `postMessage` copies data using the structured clone algorithm, which handles most types (including `Map`, `Set`, `Date`, and typed arrays) but not functions, DOM nodes, or class identity. That copy has a cost proportional to size, which is the thing to measure: sending a 50MB object to a worker can cost more than the computation you moved.

**Transferables** avoid the copy by moving ownership: pass an `ArrayBuffer` in the transfer list and it becomes unusable in the sender but is available instantly in the worker, with no serialisation at all. For image data, audio buffers, and large numeric arrays this is the difference between viable and pointless. `SharedArrayBuffer` allows genuinely shared memory but requires cross-origin isolation headers, which is a deployment constraint.

The ergonomics are poor by default — an event-based protocol with manual correlation of requests and responses — which is why Comlink is worth knowing: it wraps the boundary in proxies so a worker function looks like an async call.

Good candidates: parsing or transforming large JSON or CSV, image and video processing, cryptography, compression, search indexing, syntax highlighting, and anything running a WASM module. Bad candidates: anything touching the DOM (impossible), anything trivial (the round trip dominates), and anything already I/O-bound rather than CPU-bound.

Two related APIs. **Worklets** are lighter-weight workers for specific pipelines — audio, paint, animation. And `scheduler.yield()` plus `isInputPending` let you break up main-thread work cooperatively when a worker is not appropriate, which is often the pragmatic INP fix.

## Why it matters

INP failures caused by long tasks are a Core Web Vitals problem, and when the task is genuinely CPU-bound, a worker is the only structural answer — everything else just moves the jank around.

"How would you handle an expensive computation without freezing the UI?" is a standard question where naming both the worker and the transfer cost is the complete answer.

## Key points

- Workers give real parallelism; async scheduling only reorders work on the same thread.
- Communication is by structured-clone copy, whose cost scales with payload size — measure it against the work saved.
- Transferables move ownership of buffers with no copy, which is what makes large binary work viable.
- `SharedArrayBuffer` needs cross-origin isolation headers, so it is a deployment decision.
- Comlink removes most of the message-protocol boilerplate.
- Workers cannot touch the DOM, so they are for computation, not rendering.
- For main-thread work that cannot move, `scheduler.yield()` is the cooperative alternative.
