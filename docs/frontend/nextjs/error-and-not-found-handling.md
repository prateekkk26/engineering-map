---
title: Error & Not-Found Handling
summary: The error, not-found and global-error conventions, what each one catches, and how to fail without losing the whole page.
level: core
minutes: 20
order: 11
tags: [nextjs, errors, reliability]

related:
  - frontend/react/error-boundaries
  - frontend/architecture/resilient-ui-error-handling
  - frontend/nextjs/streaming-and-loading-ui

resources:
  - title: Error handling
    url: https://nextjs.org/docs/app/getting-started/error-handling
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: error.js
    url: https://nextjs.org/docs/app/api-reference/file-conventions/error
    source: Next.js
    type: docs
    minutes: 20
  - title: not-found.js
    url: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
    source: Next.js
    type: docs
    minutes: 15
---

## In one line

`error.tsx` is a client error boundary around a route segment, `not-found.tsx` renders for `notFound()` and unmatched URLs, and `global-error.tsx` is the last resort when the root layout itself fails.

## What it is

`error.tsx` must be a client component — it is a React error boundary, and those are class components under the hood. It receives the error and a `reset()` function, and it wraps the segment *below* the layout it sits beside. That detail decides everything: an error in `app/dashboard/page.tsx` is caught by `app/dashboard/error.tsx` while the dashboard layout, nav and sidebar stay on screen and usable. Put the boundary one level up and you lose the nav too.

Because the layout survives, `global-error.tsx` exists for the case where the root layout is what broke. It replaces the entire document, so it must render its own `<html>` and `<body>`, and it only applies in production.

`notFound()` is a thrown control-flow signal, not an error. Calling it from a server component renders the nearest `not-found.tsx` and sends a 404. The same file handles URLs with no matching route. `forbidden()` and `unauthorized()` are the analogous signals for 403 and 401 with their own conventions.

What these boundaries do not catch is the part worth memorising, and it is the same list as in React: errors thrown in event handlers, in async callbacks after render, and errors from the boundary itself. Those are yours to catch and turn into state.

Error messages in production are deliberately redacted — you get a digest hash rather than the message, which is a leak-prevention measure. The digest is what you correlate with your server logs, so log with it or debugging becomes guesswork.

Streaming adds one constraint: once the first chunk has flushed, the status code is committed. A `notFound()` discovered inside a streamed boundary cannot retroactively turn a 200 into a 404, so anything that must affect the status has to resolve before streaming begins.

Next 16 also adds `catchError` for component-level boundaries without a file convention, which is useful for a widget that should fail alone inside an otherwise fine page.

## Why it matters

Reviewers of take-homes look explicitly for loading, error, and empty states — it is one of the named scoring criteria in most guides. Placement is the part candidates get wrong: one `error.tsx` at the root technically handles errors and destroys the page while doing it.

## Key points

- `error.tsx` is a client component, wraps the segment below its sibling layout, and gets `reset()` to retry.
- Placement decides the blast radius: a segment-level boundary keeps the surrounding layout alive.
- `global-error.tsx` handles a broken root layout, must render `<html>` and `<body>`, and is production-only.
- `notFound()` is control flow, not an error; it renders `not-found.tsx` with a 404, alongside `forbidden()` and `unauthorized()`.
- Event handler and async errors are never caught by these boundaries.
- Production errors are redacted to a digest — log it server-side or you cannot trace anything.
- Once streaming starts the status code is fixed, so late `notFound()` calls cannot change it.
