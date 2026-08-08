---
title: Promises, `async`/`await` & Combinators
summary: How promise state and chaining actually work, which combinator to reach for, and where errors silently disappear.
level: core
minutes: 25
order: 5
tags: [async, language]

related:
  - frontend/javascript/event-loop
  - frontend/javascript/error-handling-in-javascript
  - frontend/javascript/generators-and-async-iteration

resources:
  - title: How to think about promises
    url: https://web.dev/articles/promises
    source: web.dev
    type: article
    minutes: 25
    primary: true
  - title: Using promises
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
    source: MDN
    type: docs
    minutes: 20
  - title: Promise objects
    url: https://tc39.es/ecma262/#sec-promise-objects
    source: TC39, ECMA-262
    type: docs
    minutes: 25
  - title: "Faster async functions and promises"
    url: https://v8.dev/blog/fast-async
    source: V8
    type: article
    minutes: 15
---

## In one line

A promise is a one-shot container for a future value that can settle exactly once, and `await` is syntax for subscribing to it as a microtask.

## What it is

A promise is in one of three states: pending, fulfilled, or rejected. It settles **once** and is then immutable — later `resolve` or `reject` calls are ignored. Registering a callback on an already-settled promise still schedules it as a microtask rather than running it synchronously, which is what makes ordering predictable.

`.then` returns a **new** promise, and what you return from the handler decides that promise's fate. Return a plain value and it fulfils with that value. Return a promise and it *adopts* it — waiting for it to settle, which is why chains flatten instead of nesting. Throw, and it rejects. Rejection propagates down the chain until a handler with a rejection callback catches it, which is the promise equivalent of an exception unwinding a stack.

`async`/`await` is the same machinery. An `async` function always returns a promise. `await` suspends the function and resumes it in a microtask when the awaited value settles — so everything after an `await` is a continuation, not synchronous code. `try`/`catch` around an `await` works because rejection is delivered as a thrown exception at the resumption point.

The four combinators answer different questions and are routinely confused:

- **`Promise.all`** — all must succeed. Rejects immediately on the first rejection, and the other promises keep running; they are not cancelled.
- **`Promise.allSettled`** — never rejects. Returns a status/value record per input. The right choice when partial failure is acceptable.
- **`Promise.race`** — first to *settle*, fulfilled or rejected. The basis of timeout patterns.
- **`Promise.any`** — first to *fulfil*, ignoring rejections until all fail, then rejects with an `AggregateError`.

Two failure modes matter. **Unhandled rejections**: a promise that rejects with no rejection handler triggers `unhandledrejection` and, in Node, terminates the process by default. **Sequential awaits in a loop**: `for (const url of urls) await fetch(url)` runs requests one at a time. Starting the promises first and awaiting `Promise.all` runs them concurrently — a waterfall bug that shows up constantly in take-home reviews.

Promises are not cancellable. Cancellation is `AbortController` passed into the underlying operation; racing a promise against a timeout hides the result but does not stop the work.

## Why it matters

Every data-fetching layer, every take-home with an API, and every "why is this page slow?" answer runs through this. Interviewers ask you to implement `Promise.all` from scratch or spot the sequential-await waterfall precisely because both require the model, not the syntax.

The combinator choice is a visible judgement call: reaching for `allSettled` when partial failure is fine, and knowing `all` leaves siblings running, is the difference between using promises and understanding them.

## Key points

- A promise settles exactly once and is immutable afterwards — subsequent `resolve`/`reject` calls are silently discarded.
- `.then` handlers always run as microtasks, even on an already-settled promise, so a promise chain never runs synchronously.
- Returning a promise from a `.then` handler adopts it, which is why chains flatten rather than producing promises of promises.
- `await` in a loop serialises the work; create the promises first and `await Promise.all` to run them concurrently.
- `Promise.all` rejects on first failure but does not cancel the others — they run to completion with their results discarded.
- Use `allSettled` when partial failure is acceptable, `any` when you want the first success, `race` when the first settlement wins including failure.
- A rejected promise with no handler fires `unhandledrejection` in the browser and by default crashes a Node process — swallowing it with an empty `.catch()` is worse than letting it surface.
- Promises cannot be cancelled; `AbortController` cancels the underlying operation, and racing against a timeout only ignores the result.
