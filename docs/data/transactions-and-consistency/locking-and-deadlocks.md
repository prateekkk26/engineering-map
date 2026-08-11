---
title: Locking & Deadlocks
summary: Which locks a statement takes, why two transactions can end up waiting on each other, and how to make that impossible.
level: core
minutes: 20
order: 4
tags: [data, transactions, concurrency]

related:
  - data/transactions-and-consistency/optimistic-vs-pessimistic-concurrency
  - data/transactions-and-consistency/mvcc-and-snapshots
  - data/schema-design-and-migrations/zero-downtime-migrations

resources:
  - title: Explicit Locking
    url: https://www.postgresql.org/docs/current/explicit-locking.html
    source: PostgreSQL
    type: docs
    minutes: 25
    primary: true
  - title: Postgres Locking Revealed
    url: https://www.citusdata.com/blog/2018/02/15/when-postgresql-blocks/
    source: Citus Data
    type: article
    minutes: 20
  - title: SELECT ... FOR UPDATE
    url: https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE
    source: PostgreSQL
    type: docs
    minutes: 10
---

## In one line

A deadlock is two transactions each holding a lock the other needs, and the fix is almost always to acquire locks in a consistent order.

## What it is

There are two families. **Row locks** are taken by `UPDATE`, `DELETE`, and explicitly by `SELECT ... FOR UPDATE` — a second writer to the same row waits. `FOR NO KEY UPDATE` and `FOR SHARE` are weaker variants that conflict with less. **Table locks** are taken by DDL: `ALTER TABLE` generally needs `ACCESS EXCLUSIVE`, which conflicts with *everything*, including reads.

That table-lock detail is the source of the most common self-inflicted outage in Postgres. A migration asks for an exclusive lock; a long-running query holds a weaker lock on the same table; the migration queues — and every subsequent query queues behind the migration, because lock requests are ordered. A table nobody was blocking a moment ago is now completely unavailable. The mitigations are `lock_timeout` on migrations, retrying in a loop, and never running DDL while a long query is in flight.

**Deadlock** proper: transaction A locks row 1 then wants row 2; B locks row 2 then wants row 1. Neither can proceed. Postgres detects the cycle after `deadlock_timeout` (1s by default) and kills one transaction with `40P01`; the application must retry. Deadlocks are usually not a database bug but an ordering bug — two code paths that update the same pair of rows in different orders. Sort the keys before locking and the cycle cannot form. Batch updates are a common culprit: `UPDATE ... WHERE id IN (...)` locks rows in whatever order the plan produces, so two overlapping batches can deadlock. `ORDER BY id` in the driving select fixes it.

Practical tooling: `pg_locks` joined to `pg_stat_activity` shows who is waiting on whom; `SELECT ... FOR UPDATE SKIP LOCKED` turns a table into a work queue where each worker grabs a different row instead of queueing; `NOWAIT` fails immediately rather than waiting, which is the right behaviour for a user-facing request that should degrade rather than hang.

## Why it matters

Lock contention is what "the site was up but every request timed out" usually turns out to be, and the migration-lock cascade in particular is a story worth being able to tell in a deep dive. `SKIP LOCKED` is also the neat, cheap answer to "how would you build a job queue without adding infrastructure?" — a question AI-shaped products ask often, because background jobs are everywhere in them.

## Key points

- Writers block writers on the same row; readers are unaffected because of MVCC.
- `ALTER TABLE` takes an `ACCESS EXCLUSIVE` lock that blocks reads too, and queued lock requests block everything behind them.
- Always set `lock_timeout` before DDL on a busy table, and retry rather than waiting indefinitely.
- Deadlocks come from inconsistent lock ordering; sorting the ids you lock removes the possibility.
- Postgres resolves a deadlock by aborting one transaction with `40P01` — the application must retry it.
- `FOR UPDATE SKIP LOCKED` turns a table into a concurrent work queue with no extra infrastructure.
- `pg_locks` joined with `pg_stat_activity` answers "who is blocking whom" during an incident.
