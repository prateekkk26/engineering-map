---
title: React 19 Actions
summary: The built-in pattern for pending state, errors, and optimistic updates around an async mutation — and how forms became the unit of submission again.
level: core
minutes: 25
order: 23
tags: [react, forms, mutations, react-19]

related:
  - frontend/react/react-server-components
  - frontend/state-and-data/optimistic-updates-and-rollback
  - frontend/nextjs/server-actions

resources:
  - title: React 19 — Actions
    url: https://react.dev/blog/2024/12/05/react-19#actions
    source: react.dev
    type: article
    minutes: 25
    primary: true
  - title: useActionState
    url: https://react.dev/reference/react/useActionState
    source: react.dev
    type: docs
    minutes: 20
  - title: useOptimistic
    url: https://react.dev/reference/react/useOptimistic
    source: react.dev
    type: docs
    minutes: 15
  - title: useFormStatus
    url: https://react.dev/reference/react-dom/hooks/useFormStatus
    source: react.dev
    type: docs
    minutes: 10
---

## In one line

An action is an async function passed to React — usually as a form's `action` — and React takes over the pending flag, the error state, and the optimistic update that everyone used to hand-roll.

## What it is

Every mutation in a React app has the same four pieces of bookkeeping: disable the button, show a spinner, catch the failure, and reset. Before React 19 that was three `useState` calls and a `try/finally` in every handler, copied across the codebase and slightly wrong in a few of them.

`<form action={fn}>` changes the shape. React calls `fn` with the `FormData`, marks the update as a transition while it runs, and resets the form on success. Because it is a transition, the UI stays responsive and any Suspense boundaries behave sensibly.

`useActionState(fn, initialState)` returns `[state, formAction, isPending]`. The action receives the previous state and returns the next one, which makes server-returned validation errors a normal return value rather than a side channel. One hook replaces the pending flag, the error state, and the result.

`useFormStatus` reads the pending state of the nearest enclosing form from a child component, so a submit button knows it is submitting without the state being threaded down. It only works below a `<form>`, which is the point — it is designed for design-system buttons.

`useOptimistic` covers the last piece: show the new value immediately, and if the action throws, React reverts to the real state automatically. No manual rollback, no snapshot to restore.

The pieces are independent of the server. Actions are plain client functions unless you make them server actions with `'use server'`, in which case the same code posts to the server and the form works before hydration — a genuine progressive-enhancement story rather than a claimed one.

Two caveats. Errors thrown in an action propagate to the nearest error boundary, so validation failures should be *returned* rather than thrown. And this is a mutation story, not a data-fetching one — reads still belong to server components or a query library.

## Why it matters

Forms and mutations are most of what a product frontend does, and the practical round is usually a form with validation, a pending state, and a failure path. Knowing the built-in primitives is faster and reads better than reproducing them with `useState`.

It is also the current answer to "how do you do optimistic updates?", where `useOptimistic` plus automatic rollback is much shorter than the manual snapshot-and-restore version.

## Key points

- `<form action={fn}>` runs the function as a transition with the form's `FormData`, and resets the form on success.
- `useActionState` bundles the result, the error, and the pending flag into one hook, with errors as return values.
- `useFormStatus` lets a nested submit button read the enclosing form's pending state without prop threading.
- `useOptimistic` shows the expected result immediately and reverts automatically if the action fails.
- With `'use server'` the same action becomes a server action and the form works before hydration.
- Return validation errors from the action; throwing sends the user to an error boundary instead.
