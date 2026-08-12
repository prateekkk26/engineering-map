---
title: Errors in Async Node
summary: Where a thrown error actually goes in an async server, and the handful of rules that keep one bad request from killing the process.
level: core
minutes: 25
order: 3
tags: [node, errors, reliability]

related:
  - backend/api-design/api-errors-clients-can-act-on
  - backend/observability/structured-logging
  - backend/services-in-production/graceful-shutdown-and-draining

resources:
  - title: Errors
    url: https://nodejs.org/api/errors.html
    source: Node.js
    type: docs
    minutes: 25
    primary: true
  - title: Process — warnings and unhandled rejections
    url: https://nodejs.org/api/process.html#event-unhandledrejection
    source: Node.js
    type: docs
    minutes: 15
  - title: Best practices for Node.js error handling
    url: https://blog.heroku.com/best-practices-nodejs-errors
    source: Heroku
    type: article
    minutes: 20
---

## In one line

An error thrown inside a callback or an un-awaited promise has no caller to catch it, so async error handling is mostly about making sure every asynchronous path terminates somewhere you wrote.

## What it is

The distinction that organises everything is **operational** versus **programmer** errors. Operational errors are expected conditions in a correct program: a timed-out upstream, a rejected payment, a connection reset, invalid input. You handle them — retry, degrade, return a `4xx`. Programmer errors are bugs: reading a property of `undefined`, calling a function with the wrong type. You cannot recover from those in a meaningful way, and trying to — swallowing them in a broad `catch` — leaves the process in a state nobody reasoned about. Log them and let the process restart.

That leads to Node's controversial rule: **on an uncaught exception, crash**. `process.on('uncaughtException')` is for logging and flushing, not for continuing to serve. The same now applies to unhandled promise rejections, which terminate the process by default in modern Node — this is a feature, because the alternative was a service silently doing nothing. What makes crashing safe is a supervisor that restarts you and a graceful shutdown handler that drains in-flight requests first.

The async-specific traps are concrete. A `try/catch` around a call you didn't `await` catches nothing — the function returns before the promise settles. `array.forEach(async ...)` produces a set of floating promises and moves on; use `for...of` with `await`, or `Promise.all`. `Promise.all` rejects on the first failure and abandons the rest, so `Promise.allSettled` is what you want when partial success is acceptable. And an error emitted by an `EventEmitter` with no `'error'` listener is thrown as an uncaught exception — that's the classic way a stream or socket takes down a server.

Two habits worth adopting. Preserve context with the **`cause` option** (`new Error('failed to charge', { cause: err })`) instead of re-wrapping and losing the stack, and use a typed error class per failure category so the handler maps to a status code without string matching. And attach a request ID — via `AsyncLocalStorage`, which propagates context across await boundaries — so the log line and the client's error reference the same thing.

## Why it matters

"Should a Node process crash on an uncaught exception?" is a genuine senior interview question with a counter-intuitive answer, and it opens onto supervision, graceful shutdown and idempotency. Day to day, the floating-promise mistakes here are the top source of errors that never appear in logs at all.

## Key points

- Operational errors get handled; programmer errors get logged and crash the process.
- `try/catch` only catches what you `await` — an un-awaited call escapes it entirely.
- `forEach` with an async callback does not wait, and its rejections go unhandled.
- `Promise.all` abandons siblings on the first rejection; use `allSettled` when partial success is valid.
- An `EventEmitter` `'error'` with no listener throws, which is how a dead socket kills a server.
- Crashing is safe only with a supervisor plus graceful shutdown; without those it's an outage.
- `AsyncLocalStorage` carries request context across awaits, which is what makes error logs traceable.
- Wrap with `{ cause }` so the original stack survives, and use typed errors instead of matching messages.
