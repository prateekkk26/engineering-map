---
title: Vacuum, Bloat & Autovacuum
summary: The cleanup process MVCC makes necessary — and the two ways teams accidentally stop it from running.
level: core
minutes: 20
order: 4
tags: [data, postgres, operations]

related:
  - data/transactions-and-consistency/mvcc-and-snapshots
  - data/postgres-in-depth/diagnosing-a-slow-postgres
  - data/scaling-data/hot-rows-and-write-contention

resources:
  - title: Routine Vacuuming
    url: https://www.postgresql.org/docs/current/routine-vacuuming.html
    source: PostgreSQL
    type: docs
    minutes: 30
    primary: true
  - title: Autovacuum Tuning Basics
    url: https://www.enterprisedb.com/blog/postgresql-autovacuum-tuning-basics
    source: EDB
    type: article
    minutes: 20
  - title: VACUUM
    url: https://www.postgresql.org/docs/current/sql-vacuum.html
    source: PostgreSQL
    type: docs
    minutes: 10
---

## In one line

Because updates create new row versions, Postgres needs vacuum to reclaim the dead ones — and when vacuum can't keep up, tables grow without the data growing.

## What it is

`VACUUM` marks dead tuples' space reusable and updates the visibility map so index-only scans work. `ANALYZE` refreshes the planner's statistics. **Autovacuum** runs both automatically when a table's dead-tuple count crosses a threshold — by default 20% of the table plus 50 rows, which is far too lazy for a large hot table: a 100M-row table waits for 20M dead rows before cleanup starts. Lowering `autovacuum_vacuum_scale_factor` per table is a standard tuning move.

**Bloat** is the gap between the space a table occupies and the space its live rows need. It slows everything: more pages to read for the same rows, worse cache hit rates, larger indexes. Note that ordinary `VACUUM` does *not* return disk to the operating system — it makes space reusable within the table. Reclaiming disk needs `VACUUM FULL`, which takes an `ACCESS EXCLUSIVE` lock and rewrites the table (unusable on a live system), or `pg_repack`, which does the equivalent online.

**Two ways teams break it.** First, a **long-running or idle-in-transaction session** pins an old snapshot; nothing newer than that snapshot can be cleaned anywhere in the cluster, so bloat climbs while autovacuum runs uselessly. Second, **autovacuum throttling**: the cost-delay settings are conservative by default, so on a write-heavy table autovacuum falls permanently behind and never catches up.

**Transaction ID wraparound** is the failure mode worth knowing by name. Transaction ids are 32-bit and must be periodically frozen; if freezing falls far enough behind, Postgres starts warning, then refuses new writes to protect the data. A database that stops accepting writes because nobody watched `age(datfrozenxid)` is a genuinely famous outage class.

What to monitor: `pg_stat_user_tables` for `n_dead_tup` and `last_autovacuum`, `pg_stat_activity` for long transactions, and the age of the oldest unfrozen transaction id. Keep `autovacuum` on. Turning it off is never the fix, however tempting it looks during a load spike.

## Why it matters

This is the most common Postgres operational surprise: disk usage that keeps climbing while row counts are flat, and queries that get slower for no visible reason. Being able to explain the link from MVCC to dead tuples to bloat, and to name the long-transaction cause, is a strong "has run a database in production" signal.

## Key points

- Vacuum exists because MVCC leaves dead row versions behind on every update and delete.
- Default autovacuum thresholds are proportional, so large hot tables need per-table tuning to be cleaned often enough.
- Plain `VACUUM` reuses space inside the table; it does not shrink the file on disk.
- `VACUUM FULL` reclaims disk but takes an exclusive lock — use `pg_repack` on anything live.
- One long-running or idle-in-transaction session blocks cleanup cluster-wide, regardless of how well autovacuum is tuned.
- Bloat degrades performance through page count and cache efficiency, not just disk cost.
- Transaction id wraparound can stop writes entirely; monitor freeze age, and never disable autovacuum.
