---
title: Server Action & RSC Authorisation
summary: The new authorisation surface introduced by server components and actions, and why the layout you thought was guarding it is not.
level: core
minutes: 25
order: 11
tags: [security, rsc, nextjs, auth]

related:
  - frontend/nextjs/server-actions
  - frontend/nextjs/authentication-in-nextjs
  - frontend/security/client-side-data-exposure

resources:
  - title: Authentication
    url: https://nextjs.org/docs/app/guides/authentication
    source: Next.js
    type: docs
    minutes: 40
    primary: true
  - title: Server Functions
    url: https://react.dev/reference/rsc/server-functions
    source: react.dev
    type: docs
    minutes: 20
  - title: taint
    url: https://nextjs.org/docs/app/api-reference/config/next-config-js/taint
    source: Next.js
    type: docs
    minutes: 10
---

## In one line

Every server action is a public HTTP endpoint and every server component can read data the client must never see — so authorisation belongs in the data layer, not in the UI that renders it.

## What it is

The mental shift is that a server action is not a function call. It compiles to an endpoint with a generated id, and that id is discoverable in the client bundle. Anyone can POST to it with arbitrary arguments, in any order, at any time, regardless of what the UI shows. A hidden button is not a control. A disabled state is not a control.

So the checks that do not work: a guard in `layout.tsx`, which does not re-run per navigation and does not run at all when an action is invoked directly; a check in `proxy.ts`, which is a useful fast bounce but runs before your code and has had framework-level bypasses; and a conditional render, which only decides what is drawn.

**The check that works is in the data access layer.** Every function that reads or writes a resource verifies the session and the caller's right to that specific record — not just "is logged in" but "owns this order". Because every entry point funnels through those functions, every entry point is covered. `React.cache` around `getCurrentUser()` makes calling it everywhere cheap.

Then the RSC-specific leak: **serialisation**. Anything a server component passes to a client component is serialised into the payload the browser receives, whether or not the component renders it. Passing a whole user record leaks the password hash and email into the page source. Select fields at the boundary, keep secret-bearing modules behind `server-only`, and use the `taint` API to make a slip a build error rather than a discovery.

Three more rules worth stating. **Validate every action's input with a schema** — arguments arrive from the network, not from your form. **Return authorisation failures as values**, since throwing sends the user to an error boundary instead of showing a useful message. And **rate-limit actions**, because an unauthenticated or cheap-to-call action is a free amplification endpoint.

## Why it matters

This is a new surface that many teams have not internalised: code that reads like a local function call is an internet-facing endpoint. Real breaches have come from exactly this misunderstanding.

It is also the sharpest security question in a modern React interview — "what stops someone calling that action directly?" — and the answer has to be a check inside the action or its data layer.

## Key points

- A server action is a public endpoint with a discoverable id; UI state is not access control.
- Layout guards do not re-run per navigation and never run for direct action calls.
- `proxy.ts` is a fast bounce, not the boundary — framework-level bypasses have existed.
- Enforce authorisation in the data access layer so every entry point is covered by construction.
- Anything passed to a client component is serialised into the page — select fields, use `server-only` and `taint`.
- Validate action arguments against a schema; they come from the network, not your form.
- Return authorisation failures as values rather than throwing, and rate-limit actions.
