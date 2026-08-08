---
title: Generators & Async Iteration
summary: Functions that can pause and resume, and the protocol behind `for await` and streaming responses.
level: deep
minutes: 20
order: 6
tags: [async, language, streaming]

related:
  - frontend/javascript/iterables-and-collections
  - frontend/javascript/promises-deep-dive
  - frontend/ai-interfaces/streaming-responses-in-the-ui

resources:
  - title: Iterators and generators
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators
    source: MDN
    type: docs
    minutes: 20
    primary: true
  - title: Async iteration and generators
    url: https://javascript.info/async-iterators-generators
    source: javascript.info
    type: article
    minutes: 15
  - title: "for await...of"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
    source: MDN
    type: docs
    minutes: 8
---

## In one line

A generator is a function that can suspend itself mid-execution and hand control back to the caller, and an async generator is the same thing where each resumption waits on a promise.

## What it is

Calling a `function*` does not run its body. It returns a generator object — an iterator that also happens to be iterable. Each `.next()` call runs the body until the next `yield`, returns `{ value, done }`, and freezes the function's state exactly where it stopped. Local variables, the position in a loop, everything survives, because the engine keeps the execution context alive rather than tearing it down.

Communication goes both directions. `yield` sends a value out; the argument to the *next* `.next(v)` call becomes the result of that `yield` expression inside the function. `.return()` finishes the generator early and runs any `finally` blocks, and `.throw()` injects an exception at the suspension point. That two-way channel is why generators underpin `redux-saga` and why they were the mechanism behind `async`/`await` before it was native syntax — `await` is `yield` on a promise with a driver loop.

Because a generator computes on demand, it can be infinite. An ID generator, a paginator that fetches the next page only when someone asks for it, or a lazy `take(5)` over an unbounded sequence all work without materialising anything.

**Async generators** (`async function*`) yield promises and are consumed with `for await...of`. This is the natural shape for anything that arrives over time: reading a `ReadableStream`, consuming Server-Sent Events, paginating an API. `for await` also accepts a plain iterable of promises, awaiting each in turn — which serialises them, so it is the wrong tool for parallel fetching.

The practical version most people meet first is streaming a `fetch` response. `response.body` is a `ReadableStream`, and in modern runtimes it is async-iterable, so `for await (const chunk of response.body)` reads it chunk by chunk. That is exactly how a token-by-token LLM response reaches the UI.

Cleanup is the part that gets missed: breaking out of a `for await` loop calls the generator's `.return()`, so `finally` blocks are the correct place to release readers, close sockets, or abort requests.

## Why it matters

This stops being academic the moment you build anything streaming — which, at an AI company, is the practical round. Rendering tokens as they arrive, cancelling mid-stream, and cleaning up the reader are all this protocol. Being able to write an async generator that wraps an SSE endpoint is a genuinely differentiating answer.

It also explains `async`/`await` itself, which is a common follow-up: "how would you implement `await` without `await`?"

## Key points

- Calling a generator function runs none of its body; it returns an iterator, and the body advances only on `.next()`.
- Generator state survives suspension — locals and loop position are preserved because the execution context is kept alive rather than discarded.
- The channel is bidirectional: `yield` pushes a value out, and the argument to the following `.next(v)` becomes that `yield` expression's value inside the function.
- `async`/`await` is a generator yielding promises plus a driver that resumes it — which is how transpilers implemented it before native support.
- `for await...of` over an array of promises awaits them sequentially, so use `Promise.all` when you want concurrency.
- Streaming a `fetch` response body with `for await` is the standard way to render an LLM response token by token.
- Breaking out of a `for await` loop invokes the generator's `.return()`, so release readers and abort requests in a `finally` block.
