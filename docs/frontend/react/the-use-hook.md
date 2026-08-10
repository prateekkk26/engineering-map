---
title: The use Hook
summary: Reading a promise or a context conditionally during render, and why this one hook does not follow the rules of hooks.
level: deep
minutes: 20
order: 22
tags: [react, hooks, suspense]

related:
  - frontend/react/suspense-and-streaming
  - frontend/react/react-server-components
  - frontend/react/hooks-rules-and-why

resources:
  - title: use
    url: https://react.dev/reference/react/use
    source: react.dev
    type: docs
    minutes: 20
    primary: true
  - title: React 19
    url: https://react.dev/blog/2024/12/05/react-19
    source: react.dev
    type: article
    minutes: 30
  - title: RFC — First class support for promises and async/await
    url: https://github.com/reactjs/rfcs/pull/229
    source: React RFCs
    type: article
    minutes: 25
---

## In one line

`use` unwraps a promise or a context during render — suspending until the promise resolves — and it is the one hook you are allowed to call conditionally.

## What it is

Given a promise, `use(promise)` either returns its resolved value or suspends the component until it settles, letting the nearest Suspense boundary show a fallback and the nearest error boundary catch a rejection. Given a context, it does what `useContext` does. The unusual part is that it can be called inside an `if` or a loop, because it does not allocate a hook slot the way stateful hooks do.

The pattern it enables is the one RSC needs: a server component starts a fetch without awaiting it, passes the promise to a client component as a prop, and the client component reads it with `use`. The request begins on the server as early as possible, and the client suspends only on the part that needs the data — no request waterfall, and no `useEffect` fetch on the client.

The rule that catches people is that `use` does not *create* or cache the promise. Calling `use(fetch(url))` in a client component's body creates a new promise every render, suspends, resumes, renders, creates another one, and loops forever. The promise has to come from somewhere stable: a server component's props, a cache, or a framework-integrated loader. React 19 caches promises across renders when they are created in a server component, which is exactly the case that works.

So `use` is not a data-fetching library. There is no deduplication, no revalidation, no retry, no error recovery beyond the boundary. It is a primitive that libraries and frameworks build on, and in application code its natural use is consuming a promise handed to you.

It composes with everything Suspense composes with: a boundary above decides the fallback, a transition prevents already-visible content being replaced by that fallback, and errors surface at the error boundary rather than as an unhandled rejection.

## Why it matters

This is how data reaches client components in modern React without a fetch-in-effect, and "how do you avoid a waterfall between server and client?" is a live question in App Router interviews. The answer — start the fetch on the server, pass the promise, read it with `use` — is short and specific.

It also comes up as a rules-of-hooks question. Knowing why `use` can be conditional, when nothing else can, means you understand that the rules come from hook-slot ordering rather than from a convention.

## Key points

- `use` reads a promise or a context during render; with a promise it suspends until settled.
- It is exempt from the rules of hooks and may be called conditionally, because it does not occupy a hook slot.
- It does not create or cache promises — creating one inline in a client render causes an infinite suspend-and-retry loop.
- The intended pattern is a server component starting the fetch and passing the promise to a client component.
- Rejections propagate to the nearest error boundary; fallbacks come from the nearest Suspense boundary.
- It is a primitive, not a data layer: no deduplication, revalidation, or retries.
