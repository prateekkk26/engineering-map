---
title: Optimistic vs Pessimistic Concurrency
summary: Lock the row up front or detect the conflict at write time — and which one a collaborative UI actually wants.
level: core
minutes: 20
order: 5
tags: [data, concurrency, api]

related:
  - data/transactions-and-consistency/locking-and-deadlocks
  - data/transactions-and-consistency/isolation-levels-and-anomalies
  - system-design/frontend-system-design/design-a-collaborative-editor

resources:
  - title: Optimistic Offline Lock
    url: https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html
    source: Martin Fowler
    type: article
    minutes: 10
    primary: true
  - title: Pessimistic Offline Lock
    url: https://martinfowler.com/eaaCatalog/pessimisticOfflineLock.html
    source: Martin Fowler
    type: article
    minutes: 10
  - title: HTTP Conditional Requests
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests
    source: MDN
    type: docs
    minutes: 15
---

## In one line

Pessimistic concurrency stops the conflict by locking first; optimistic concurrency lets the write proceed and rejects it if the row changed underneath.

## What it is

**Pessimistic**: `SELECT ... FOR UPDATE`, do the work, commit. Nobody else can touch the row in between. Correct and simple, and appropriate when conflicts are likely and the critical section is short — decrementing inventory, allocating a seat, moving money between accounts. The costs are real: waiters queue, throughput drops on hot rows, and a lock held across anything slow becomes an availability problem. A lock never survives a user's think-time; that would be a *lock held for minutes* on a row anyone might need.

**Optimistic**: carry a version. Every row has a `version` integer or an `updated_at`; the update is `UPDATE ... SET ..., version = version + 1 WHERE id = $1 AND version = $2`. If it affects zero rows, someone else got there first, and you return a conflict rather than silently overwriting. This is the right default when conflicts are rare, when the edit spans a user session, or when the client is offline-capable. It costs nothing while nothing conflicts, which is most of the time.

The HTTP form of the same idea is a **conditional request**: the server returns an `ETag`, the client sends `If-Match`, and a mismatch gets `412 Precondition Failed`. That gives you optimistic concurrency across an API boundary without inventing a scheme, and it composes with caching.

The part that decides whether users tolerate it is **what happens on conflict**. Rejecting with "someone else edited this, your changes were lost" is a bad product. Options, roughly in order of effort: reload and let the user re-apply; merge per field, since two people editing different fields of the same record is not a real conflict; or model edits as operations rather than states, at which point you are in CRDT/OT territory and the conflict mostly disappears.

Note that in Postgres, `REPEATABLE READ` gives you a kind of optimistic control for free — a conflicting write aborts with a serialization error — but you still have to write the retry, and the error is per transaction rather than per field.

## Why it matters

"Two users edit the same document — what happens?" is a standard frontend system design prompt, and the expected answer names the strategy, the version token, and the UX on conflict. Getting it wrong in production means last-write-wins silently destroying someone's work, which is the kind of bug users never report and never forgive.

## Key points

- Pessimistic locking is right for short, contended, high-stakes critical sections; optimistic is right when conflicts are rare or edits are long.
- An optimistic update is a conditional update: zero rows affected *is* the conflict signal.
- Never hold a database lock across user think-time or an external network call.
- `ETag` plus `If-Match` is optimistic concurrency at the HTTP layer, and returns `412` on conflict.
- Last-write-wins is a decision, not a default — say it out loud if you choose it.
- Field-level merging resolves most "conflicts" because users usually edit different fields.
- Optimistic control needs a retry or resolution path in the UI, or it just moves data loss into an error message.
