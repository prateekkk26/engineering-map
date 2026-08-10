---
title: Optimistic Updates & Rollback
summary: Showing the result before the server confirms it, and the discipline that keeps a failed request from leaving the UI lying.
level: core
minutes: 25
order: 11
tags: [state, ux, mutations]

related:
  - frontend/react/react-19-actions
  - frontend/state-and-data/server-state-and-cache-semantics
  - frontend/state-and-data/realtime-state-sync

resources:
  - title: Optimistic Updates
    url: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
    source: TanStack
    type: docs
    minutes: 25
    primary: true
  - title: useOptimistic
    url: https://react.dev/reference/react/useOptimistic
    source: react.dev
    type: docs
    minutes: 15
  - title: Mastering Mutations in React Query
    url: https://tkdodo.eu/blog/mastering-mutations-in-react-query
    source: TkDodo
    type: article
    minutes: 25
---

## In one line

Apply the expected result immediately, send the request, and reconcile or revert when it settles — so an interaction feels instant instead of costing a round trip.

## What it is

A like button that waits 300ms for the server before filling in feels broken, even though nothing is wrong. Optimistic updating removes that wait: assume success, show it, and deal with failure when it comes.

The mechanics have four steps, and skipping any of them causes a known bug. **Cancel** in-flight refetches for the affected key, or a response that started before your change will land after it and overwrite it. **Snapshot** the previous value. **Apply** the expected new state. Then on error, **restore** the snapshot; on settle, invalidate so the server's version becomes the truth.

React 19's `useOptimistic` covers the common case in one hook: it shows an optimistic value during a transition and reverts automatically if the action throws, with no manual snapshot.

Choosing what to be optimistic about is the judgement. Toggles, reorders, adding a comment, marking as read — cheap to revert, easy to explain, low cost if wrong. A payment, an irreversible delete, or anything that returns server-computed data — an id, a price, an inventory count — should not be faked. If you cannot predict the result, do not pretend to know it.

Failure handling is where these implementations are actually judged. Reverting silently is the worst option: the user saw it work, so the state simply changes back for no visible reason. Revert *and* tell them, with a retry where it makes sense. For anything a user typed, revert the list but keep their text — losing a comment because the request failed is a much bigger insult than the delay would have been.

Two structural hazards. Rapid repeated actions can produce out-of-order responses, so the last write should win by request order, not arrival order. And with realtime updates in the mix, a server-pushed change can arrive mid-flight for the same record; the reconciliation rule needs to be decided rather than discovered.

## Why it matters

This is one of the highest-leverage perceived-performance techniques and a common practical-round requirement — chat, likes, drag-to-reorder all want it.

Interviewers push on the failure path specifically, because the happy path is easy and the revert is where the thinking shows.

## Key points

- Cancel in-flight queries first, or a stale response will land on top of your optimistic change.
- Snapshot before applying so rollback is exact, and invalidate on settle so the server has the final word.
- `useOptimistic` handles the common case with automatic rollback when the action fails.
- Be optimistic about cheap, reversible, predictable outcomes — not payments, deletes, or server-computed values.
- Never revert silently: show the failure and offer a retry, and preserve anything the user typed.
- Decide the ordering rule for rapid actions and the reconciliation rule for realtime pushes before they surprise you.
