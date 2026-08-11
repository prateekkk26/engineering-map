---
title: Zero-Downtime Migrations
summary: The expand–migrate–contract sequence that lets a schema change ship while old and new code are both running.
level: core
minutes: 25
order: 5
tags: [data, migrations, deployment]

related:
  - data/transactions-and-consistency/locking-and-deadlocks
  - data/schema-design-and-migrations/designing-a-schema-for-a-feature
  - frontend/tooling/ci-cd-for-frontend

resources:
  - title: Common DB schema change mistakes
    url: https://postgres.ai/blog/20220525-common-db-schema-change-mistakes
    source: Postgres.ai
    type: article
    minutes: 30
    primary: true
  - title: Evolutionary Database Design
    url: https://martinfowler.com/articles/evodb.html
    source: Martin Fowler
    type: article
    minutes: 30
  - title: ALTER TABLE
    url: https://www.postgresql.org/docs/current/sql-altertable.html
    source: PostgreSQL
    type: docs
    minutes: 20
---

## In one line

During any deploy, old code and new code run against the same database at the same time, so every migration must be compatible with both.

## What it is

The pattern is **expand, migrate, contract**, across at least three deploys.

*Expand*: add the new structure, nullable and unused — a new column, a new table, a new index. Old code ignores it. *Migrate*: deploy code that writes to both old and new, then backfill existing rows in batches. *Contract*: once nothing reads the old structure, stop writing it, then drop it — in a later deploy, not the same one.

Renaming a column in one step is the canonical mistake: the moment the migration commits, every still-running old instance starts erroring. A rename is expand-migrate-contract with a temporary dual-write, or it is an outage.

**Lock behaviour decides which operations are safe.** In modern Postgres, adding a nullable column, adding a column with a non-volatile default, and dropping a column are all fast metadata-only changes. Adding `NOT NULL` to an existing column, changing a type, and adding a constraint all scan the table while holding `ACCESS EXCLUSIVE`. The safe form for a constraint is `ADD CONSTRAINT ... NOT VALID` followed by `VALIDATE CONSTRAINT`, which takes a weaker lock. Indexes always go in with `CREATE INDEX CONCURRENTLY`.

**The lock queue is the real danger.** A migration waiting for an exclusive lock blocks every query that arrives behind it, so a change that takes 50ms can take down a table for minutes if one long query is in flight. Always set `lock_timeout` (a couple of seconds) and retry rather than waiting.

**Backfills must be batched.** A single `UPDATE` over ten million rows holds locks, generates enormous WAL, bloats the table, and blocks vacuum. Loop in batches of a few thousand with a short pause, and make the job resumable.

Two rules that prevent most incidents: **migrations are forward-only in practice** — a `down` migration that drops a column is not a rollback, it is data loss, so roll forward instead. And **decouple deploy from migration**: run migrations as their own step, not on application boot, where N instances race to run the same DDL.

## Why it matters

This is standard practice at any company shipping continuously, and it is a frequent deep-dive question because it exposes whether you have actually operated a system or only built one. The failure modes — locked table, blocked deploy, half-backfilled column — are all recoverable if anticipated and expensive if not.

## Key points

- Every deploy runs old and new code against one database, so schema changes must be backward compatible for at least one release.
- Renaming or retyping in place breaks running instances; expand, dual-write, backfill, then contract.
- Adding a nullable column is metadata-only; adding `NOT NULL` or a validated constraint scans the whole table under an exclusive lock.
- Add constraints as `NOT VALID` and validate separately; build indexes with `CREATE INDEX CONCURRENTLY`.
- Set `lock_timeout` on DDL — a queued exclusive lock blocks every query behind it, not just the table.
- Backfill in resumable batches; one giant `UPDATE` bloats the table and stalls vacuum.
- Treat migrations as forward-only, and run them as a discrete step rather than on application startup.
