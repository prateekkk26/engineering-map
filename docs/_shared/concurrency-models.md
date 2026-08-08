---
title: Concurrency Models
summary: The four ways systems run more than one thing at once, and why JavaScript picked the one it did.
level: core
minutes: 25
tags: [concurrency, runtime, fundamentals]

surfaced_in:
  - frontend/javascript
  - frontend/browser-platform
  - cs-fundamentals/concurrency

related:
  - frontend/javascript/event-loop
  - frontend/browser-platform/web-workers-and-off-main-thread

resources:
  - title: Concurrency is not parallelism
    url: https://go.dev/blog/waza-talk
    source: Rob Pike, Go Blog
    type: video
    minutes: 30
    primary: true
  - title: Don't block the event loop
    url: https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop
    source: Node.js
    type: docs
    minutes: 20
  - title: Using Web Workers
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
    source: MDN
    type: docs
    minutes: 20
---

## In one line

Concurrency is dealing with many things at once; parallelism is doing many things at once — and the model a runtime picks decides which bugs you get.

## What it is

Four models cover almost everything in practice.

**Single-threaded event loop.** One thread, one call stack, a queue of callbacks. Nothing runs concurrently, so there are no data races and no locks — but any long-running task blocks everything, including rendering. JavaScript in the browser, Node.js, and Python's asyncio work this way. The tradeoff is explicit: safety and simplicity bought with the requirement that you never block.

**OS threads with shared memory.** Multiple threads in one address space, scheduled by the kernel, running genuinely in parallel across cores. Fast and general, but shared mutable state means data races, and correctness depends on locks — which brings deadlock, priority inversion, and bugs that only appear under load. Java, C++, Go's runtime underneath.

**Message passing / actors.** Independent units of execution with no shared memory, communicating by copying messages. Races are structurally impossible because there is nothing to share. The cost is serialisation and the difficulty of reasoning about a system whose state is spread across mailboxes. Erlang and Elixir are the canonical examples — and **Web Workers are this model**, which is why `postMessage` copies rather than shares.

**Coroutines / green threads.** Lightweight units multiplexed onto real threads by a runtime scheduler, suspending at defined points rather than being pre-empted arbitrarily. Go's goroutines and Rust's async tasks. Cheap enough to create by the thousand, and the suspension points are visible in the source.

JavaScript's choice makes sense given its origin: a language embedded in a browser, manipulating a DOM that a second thread could corrupt mid-render. The single-threaded model made the DOM safe by construction. Async I/O keeps the thread useful during waits, since the wait is the common case in a UI.

The escape hatch is Web Workers — real OS threads, but with the actor model bolted on. No shared DOM access, no shared variables; `postMessage` structured-clones the payload. `SharedArrayBuffer` plus `Atomics` reintroduce genuine shared memory for cases that need it, and reintroduce every race condition along with it. It's gated behind cross-origin isolation headers for Spectre reasons.

Two distinctions worth keeping crisp: **concurrency vs parallelism** (a single-core machine can be concurrent but not parallel) and **I/O-bound vs CPU-bound**. Async concurrency solves I/O-bound problems, where the thread is idle waiting. It does nothing for CPU-bound work — that needs parallelism, which in the browser means a worker.

## Why it matters

"Why doesn't JavaScript have threads?" and "how would you handle a CPU-heavy operation in the browser?" are both standard, and the second has a wrong answer people give constantly: chunking with `setTimeout`. Chunking keeps the page responsive, but it does not make the work faster and does not use a second core. A worker does.

The vocabulary also transfers directly to backend and system design rounds, where the same tradeoffs decide whether a service uses a thread pool, an event loop, or a queue of independent consumers.

## Key points

- Concurrency is structuring work so tasks can be in flight simultaneously; parallelism is executing them at the same instant on different cores. A single core can do the first, never the second.
- The single-threaded event loop eliminates data races by construction, at the price that any long task blocks all work including rendering.
- Shared-memory threading is the fastest general model and the most dangerous, because correctness depends on locking discipline that no type system enforces.
- Message passing makes races structurally impossible by removing shared state, paying for it in serialisation cost — this is exactly the Web Worker model.
- JavaScript chose a single thread to make DOM manipulation safe by construction, not as an oversight.
- Async concurrency fixes I/O-bound problems where the thread would otherwise idle; it does nothing for CPU-bound work.
- Chunking CPU work with `setTimeout` or `scheduler.yield` restores responsiveness but does not reduce total time or use a second core — a Worker is the only real fix.
- `SharedArrayBuffer` with `Atomics` gives genuine shared memory across workers, reintroduces every classic race, and requires cross-origin isolation headers to enable.
