---
title: Error Handling in JavaScript
summary: How errors propagate through sync, async, and callback code, and why most production error reports are useless.
level: core
minutes: 20
order: 8
tags: [language, async, reliability]

related:
  - frontend/javascript/promises-deep-dive
  - frontend/react/error-boundaries
  - frontend/architecture/resilient-ui-error-handling

resources:
  - title: Error
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    source: MDN
    type: docs
    minutes: 15
    primary: true
  - title: Control flow and error handling
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
    source: MDN
    type: docs
    minutes: 15
  - title: "Error.prototype.cause"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
    source: MDN
    type: docs
    minutes: 6
---

## In one line

`try`/`catch` only catches what is on the stack right now, which is why async errors escape it and why every error you throw should carry the context needed to act on it.

## What it is

JavaScript lets you throw any value, and almost every codebase suffers for it. Throwing a string or an object literal loses the stack trace entirely — the trace is captured when an `Error` is *constructed*, not when it is thrown. Always throw an `Error` or a subclass.

Scope is the part that trips people up. A `try`/`catch` guards the synchronous execution of its block. Callbacks scheduled inside it — a `setTimeout`, an event listener, a `.then` handler — run later, on a fresh stack, with the original frame long gone. Wrapping a `setTimeout` in `try`/`catch` catches nothing. `await` is the exception, and only because it resumes the function inside the original try block: rejection is re-thrown at the resumption point, which is what makes `try { await f() } catch {}` work.

Unhandled failures surface in three separate channels, and production error tracking needs all three: `window.onerror` / the `error` event for synchronous throws, `unhandledrejection` for promises with no rejection handler, and framework-level boundaries (React error boundaries) for render-phase errors. React's boundaries are the narrowest — they catch errors during render, lifecycle, and constructors, but not in event handlers, timers, or async callbacks, because those aren't on React's stack.

**Custom error classes** are what make `catch` blocks meaningful. A `catch` that can't tell a network failure from a validation failure from a genuine bug can only do one thing, and it usually does the wrong one. Subclass `Error`, and check with `instanceof` rather than string-matching messages.

**`Error.cause`** solves the wrapping problem. Re-throwing a higher-level error historically destroyed the original: `throw new Error('Failed to load user')` and the underlying `ECONNRESET` is gone. `throw new Error('Failed to load user', { cause: err })` keeps the chain, and modern devtools and loggers print it.

Two rules that carry most of the value: **don't catch what you can't handle** — a `catch` that logs and continues turns a loud failure into corrupt state — and **never swallow silently**. An empty `.catch(() => {})` is how a bug survives to production.

`AggregateError` (from `Promise.any`) and `AbortError` (from an aborted fetch) are the two special cases worth recognising. An `AbortError` after a user cancels is expected behaviour, not an error to report, and filtering it out is a standard piece of production hygiene.

## Why it matters

Error handling is where the practical round is scored and candidates don't realise it. Loading, error, and success states are explicitly on reviewer checklists, and "what happens when this request fails?" is the first follow-up. Handling `AbortError` differently from a 500, and showing a retry rather than a blank screen, reads as production experience.

It is also the difference between an error tracker that surfaces real bugs and one nobody looks at.

## Key points

- Only `Error` instances capture a stack trace, and it is captured at construction — throwing strings or object literals loses it permanently.
- `try`/`catch` guards the synchronous execution of its block, so it cannot catch anything thrown from a `setTimeout`, event listener, or `.then` callback scheduled inside it.
- `await` is the exception: rejection is re-thrown at the resumption point inside the original `try`, which is why `try`/`catch` around `await` works.
- Production needs three channels wired up — `error`, `unhandledrejection`, and framework boundaries — because each catches failures the others miss.
- React error boundaries catch render, lifecycle, and constructor errors only; event handler and async errors need explicit handling.
- Subclass `Error` and branch on `instanceof`, so a `catch` block can distinguish a network failure from a validation failure and respond differently.
- `Error.cause` preserves the underlying failure when re-throwing at a higher level, keeping the chain that makes a report actionable.
- An `AbortError` from a user-cancelled request is expected control flow — filter it out rather than reporting it as a production error.
