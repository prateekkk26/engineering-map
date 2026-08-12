---
title: Error Handling
summary: Deciding which failures are expected and handled, which are bugs that should crash loudly, and who finds out either way.
level: core
minutes: 25
tags: [reliability, api, architecture]

surfaced_in:
  - frontend/architecture
  - backend/api-design
  - system-design/reliability-and-operations

related:
  - frontend/architecture/resilient-ui-error-handling
  - backend/api-design/api-errors-clients-can-act-on
  - backend/node-runtime/errors-in-async-node
  - system-design/reliability-and-operations/timeouts-retries-and-backoff

resources:
  - title: The Error Model
    url: https://joeduffyblog.com/2016/02/07/the-error-model/
    source: Joe Duffy
    type: article
    minutes: 45
    primary: true
  - title: Errors are values
    url: https://go.dev/blog/errors-are-values
    source: The Go Blog
    type: article
    minutes: 10
  - title: Error.cause
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
    source: MDN
    type: docs
    minutes: 5
---

## In one line

Every failure is either a condition you expected and must handle, or a bug you didn't — and treating the two the same is what produces both silent corruption and pointless crashes.

## What it is

The single most useful distinction is between **recoverable errors** and **bugs**. A recoverable error is part of the contract: the network timed out, the file wasn't there, the input didn't validate, the model refused. Callers are expected to deal with these, so they belong in the signature — a typed error, a result union, a documented rejection — and the compiler or the reviewer can check you handled them. A bug is a violated assumption: a null that can't be null, an index out of range, an invariant broken. Nothing sensible can be done locally, and the correct response is to fail fast and loudly rather than to `catch` and continue with corrupted state.

Most codebases blur this line by catching everything. `try { ... } catch (e) { log(e) }` around a block turns a bug into a shrug and a recoverable error into a log line nobody reads. The rule that survives contact with reality: **catch narrowly, at the layer that can actually do something**. A retry belongs where you know the operation is idempotent. A fallback belongs where you know what "degraded but useful" looks like. Everything else propagates.

The second decision is **what an error carries**. An error that reaches a human should say what was being attempted, what failed, and what identifies this instance of it — a request id, the key, the input that broke. Wrapping matters here: each layer adds context without destroying the original, which is what `Error.cause`, Go's `%w`, and exception chaining all exist for. A stack trace with no domain context tells you where the code was, not what the system was doing.

The third is **the boundary**. Internal error representation and the error you expose are different things. An API returns a stable, machine-readable code plus a message a client can act on, and never a stack trace or a raw driver message — that is both an information leak and a coupling. A UI turns the same failure into one of a small number of user-visible states: retry, degraded, or a dead end with a way out. Somewhere between those two, every error is logged exactly once, with the context, at the boundary that decided what it meant.

## Why it matters

It shows up in the practical round the moment a request can fail, and in the deep dive as "what happened when that went wrong?" — the answer separates people who handle the happy path from people who have run something. It is also the difference between an incident you can debug from logs in ten minutes and one where you're guessing, because the exception was swallowed three layers below the one that reported it.

## Key points

- Separate expected conditions from bugs: handle the first in the type system, fail fast on the second.
- Catch narrowly, at the layer that can retry, fall back, or explain — not at the top of every function.
- Swallowing an error to keep going is a decision to continue with unknown state; make it deliberately or not at all.
- Wrap with context and preserve the cause; `Error.cause` and equivalents exist so the original survives.
- Log an error once, at the boundary that interpreted it — duplicate logging makes incidents unreadable.
- The internal error and the exposed error are different types: stable codes out, stack traces never.
- Retry only what is idempotent, and only with a timeout and a bound — see `timeouts-retries-and-backoff`.
- A user-facing failure needs a next action; "Something went wrong" with no route forward is an unhandled error with styling.
