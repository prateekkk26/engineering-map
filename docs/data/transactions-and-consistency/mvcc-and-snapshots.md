---
title: MVCC & Snapshots
summary: How Postgres lets readers and writers avoid blocking each other by keeping multiple versions of every row.
level: core
minutes: 20
order: 3
tags: [data, transactions, postgres]

related:
  - data/postgres-in-depth/vacuum-bloat-and-autovacuum
  - data/transactions-and-consistency/isolation-levels-and-anomalies
  - data/transactions-and-consistency/locking-and-deadlocks

resources:
  - title: Concurrency Control
    url: https://www.postgresql.org/docs/current/mvcc-intro.html
    source: PostgreSQL
    type: docs
    minutes: 20
    primary: true
  - title: MVCC in PostgreSQL
    url: https://www.postgresql.org/docs/current/routine-vacuuming.html
    source: PostgreSQL
    type: docs
    minutes: 25
  - title: PostgreSQL 14 Internals — MVCC chapter
    url: https://postgrespro.com/community/books/internals
    source: Egor Rogov
    type: book
---

## In one line

Instead of overwriting a row, Postgres writes a new version of it and lets each transaction see the version that was current when its snapshot was taken.

## What it is

Every row version carries the transaction ids that created and deleted it. A **snapshot** is essentially "which transactions had committed at this moment", and visibility is a function of that: a transaction sees a version if the creating transaction had committed before its snapshot and the deleting one had not. `READ COMMITTED` takes a new snapshot per statement; `REPEATABLE READ` takes one for the whole transaction.

The consequence people quote is **readers never block writers and writers never block readers**. A long analytical `SELECT` does not stop an `UPDATE` on the same table, because the update writes a new version and leaves the old one visible to the reader. Writers still block *writers* on the same row — that part is a lock.

The cost is that **an `UPDATE` is really an insert plus a mark-dead**, so the table accumulates dead tuples that something has to clean up. That something is vacuum, and it is the origin of the two classic Postgres operational problems: table and index bloat, and a long-running transaction that pins an old snapshot so nothing can be cleaned up while it runs. A forgotten `BEGIN` in a psql session, or an analytics query running for two hours, can degrade the entire cluster for exactly this reason.

Two more consequences worth carrying. **`count(*)` is not free** — visibility is per row, so there is no maintained total; the database counts, though an index-only scan on a well-vacuumed table makes it much cheaper. And **updating a row rewrites every index entry** unless the update qualifies for HOT (a heap-only tuple update, possible when no indexed column changed and there is free space on the page), which is a real argument for not indexing columns that churn.

Contrast with the other design: engines that use undo logs, like Oracle and InnoDB, keep the current version in place and reconstruct old ones from an undo segment. That trades Postgres's vacuum problem for a different one — long readers can exhaust undo space.

## Why it matters

MVCC explains most surprising Postgres behaviour: why a delete didn't free disk, why an idle transaction is a production incident, why a table has 40GB of bloat behind 4GB of rows. In an interview it is the mechanism behind "how do you get non-blocking reads?", and being able to name the vacuum trade-off shows you have run one of these in anger.

## Key points

- Row updates create new versions rather than overwriting; the old version stays visible to older snapshots.
- Readers do not block writers and writers do not block readers, but two writers to the same row still serialise on a lock.
- Read committed takes a snapshot per statement; repeatable read takes one per transaction.
- Dead tuples accumulate on every update and delete, and only vacuum reclaims them.
- An idle-in-transaction session holds back the oldest snapshot and stops vacuum cluster-wide — treat it as an incident.
- `count(*)` must actually count rows because visibility is per snapshot; there is no maintained counter.
- Updating an indexed column forces index writes; HOT updates avoid that only when no indexed column changed.
