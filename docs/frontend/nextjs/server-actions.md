---
title: Server Actions
summary: Functions that run on the server but are called like a client callback — how the RPC works, and why every one of them is a public endpoint.
level: core
minutes: 25
order: 7
tags: [nextjs, mutations, forms, security]

related:
  - frontend/react/react-19-actions
  - frontend/nextjs/authentication-in-nextjs
  - frontend/security/server-action-and-rsc-authorisation

resources:
  - title: Mutating data
    url: https://nextjs.org/docs/app/getting-started/mutating-data
    source: Next.js
    type: docs
    minutes: 30
    primary: true
  - title: Server Functions
    url: https://react.dev/reference/rsc/server-functions
    source: react.dev
    type: docs
    minutes: 20
  - title: updateTag
    url: https://nextjs.org/docs/app/api-reference/functions/updateTag
    source: Next.js
    type: docs
    minutes: 15
---

## In one line

A function marked `'use server'` stays on the server, and Next replaces it in the client bundle with a generated endpoint reference — so calling it from a component is an RPC that looks like a function call.

## What it is

Mark a function with `'use server'` and you can pass it to a form's `action` or call it from a client event handler. The bundler never ships the body; it ships an opaque id. When the client calls it, Next POSTs to the current route with that id and the serialised arguments, runs the real function on the server, and returns the result along with any updated RSC payload.

The `<form action={fn}>` form is the one to reach for first, because it works before hydration. The browser's native form POST carries the submission, which means the feature functions on a slow connection or with JavaScript still loading — genuine progressive enhancement rather than a claim. React 19's `useActionState`, `useFormStatus`, and `useOptimistic` sit on top for pending state, errors, and optimistic UI.

The security point is the one that matters most and gets missed: **a server action is a public HTTP endpoint**. The id is discoverable, and nothing stops a caller invoking it with arbitrary arguments. It is not protected by being defined inside an authenticated page, and it is not protected by the UI that calls it being hidden. Every action must independently authenticate the caller, authorise the specific operation, and validate its input — treat it exactly like a route handler you wrote by hand.

Arguments and return values must be serialisable, which rules out passing functions or class instances across.

After a mutation, something has to tell the UI. `updateTag(tag)` in Next 16 expires a cache tag and refreshes in the same request, giving read-your-writes semantics; `revalidateTag(tag, profile)` is the stale-while-revalidate variant; `refresh()` just re-fetches the client router's current view; `redirect()` sends the user elsewhere. Choosing wrongly is why "I saved but it still shows the old value" happens.

Actions are for mutations. Using one as a general data-fetching mechanism serialises requests — they run one at a time per client — and gives up caching entirely.

## Why it matters

This is now the default way to write mutations in a Next codebase, so it appears in most take-homes. The authorisation point in particular is a favourite senior probe: "what stops someone calling this action directly?" separates people who have shipped one from people who have read about them.

## Key points

- `'use server'` keeps the body on the server and ships an endpoint reference; calling it is an RPC, not a local call.
- `<form action={fn}>` works before hydration, which is what makes progressive enhancement real here.
- Every action is a public endpoint — authenticate, authorise, and validate inside the action itself, every time.
- Arguments and return values must serialise; functions and class instances cannot cross.
- Use `updateTag` for read-your-writes after a mutation, `revalidateTag` when a delay is acceptable, `refresh()` for the client router only.
- Actions run serially per client and bypass caching, so they are for mutations, not for reads.
