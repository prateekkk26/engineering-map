---
title: Isolation Levels & Anomalies
summary: Each isolation level is defined by which concurrency anomalies it still allows — and read committed, the default, allows several.
level: core
minutes: 30
order: 2
tags: [data, transactions, concurrency]

related:
  - data/transactions-and-consistency/mvcc-and-snapshots
  - data/transactions-and-consistency/optimistic-vs-pessimistic-concurrency
  - data/transactions-and-consistency/locking-and-deadlocks

resources:
  - title: Transaction Isolation
    url: https://www.postgresql.org/docs/current/transaction-iso.html
    source: PostgreSQL
    type: docs
    minutes: 30
    primary: true
  - title: A Critique of ANSI SQL Isolation Levels
    url: https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-95-51.pdf
    source: Berenson et al.
    type: article
    minutes: 45
  - title: Jepsen — Snapshot Isolation
    url: https://jepsen.io/consistency/models/snapshot-isolation
    source: Jepsen
    type: article
    minutes: 15
---

## In one line

Isolation levels are a menu of which concurrency bugs you are willing to keep, traded against how much concurrency you keep with them.

## What it is

The anomalies, in the order they get eliminated:

**Dirty read** — seeing another transaction's uncommitted write. Postgres never allows this at any level; some engines do at `READ UNCOMMITTED`.

**Non-repeatable read** — reading a row twice in one transaction and getting different values because someone committed in between. Allowed at `READ COMMITTED`.

**Phantom read** — re-running a range query and finding new rows that match. Allowed at `READ COMMITTED` and, in the standard, at `REPEATABLE READ`.

**Lost update** — two transactions read a counter as 5, both write 6, one increment vanishes. This is the one that bites real applications, because it is the shape of every read-modify-write in application code.

**Write skew** — the subtle one. Two transactions each read a set, each check an invariant that still holds, and each write a *different* row; individually valid, jointly wrong. The canonical example is two on-call doctors both going off duty because each saw the other still on. Snapshot isolation permits this; only serializable prevents it.

**The levels.** `READ COMMITTED` (the Postgres default) takes a fresh snapshot for every statement — so each statement sees only committed data, but two statements in the same transaction can disagree. `REPEATABLE READ` in Postgres is snapshot isolation: one snapshot for the whole transaction, no non-repeatable or phantom reads, and concurrent conflicting writes fail with a serialization error you must retry. `SERIALIZABLE` in Postgres adds predicate tracking (SSI) so the outcome is always equivalent to some serial order — it also aborts transactions, more often, and it demands that **every** participating transaction runs at that level.

The practical rule: stay on read committed, and handle the specific races explicitly — `SELECT ... FOR UPDATE` to take a row lock, an atomic `UPDATE ... SET n = n + 1` instead of read-then-write, a unique constraint for insert races. Raise the level only for a genuine multi-row invariant, and only with a retry loop, because a serialization failure is a normal outcome, not an error.

## Why it matters

The interview version is "two users click buy at the same time — what happens?", and the answer requires naming the anomaly and the mechanism that prevents it. In production the same knowledge prevents the double-charge and the over-sold inventory, and it explains why an app that worked in testing breaks under concurrency.

## Key points

- Read committed takes a new snapshot per statement, so the same query twice in one transaction can return different rows.
- Lost update is the everyday failure: any read-modify-write in application code is exposed unless it locks or uses an atomic expression.
- `UPDATE t SET n = n + 1` is safe at any level; `SELECT n` then `UPDATE SET n = $1` is not.
- Postgres's `REPEATABLE READ` is snapshot isolation — no phantoms, but still permits write skew.
- Only `SERIALIZABLE` prevents write skew, and it needs every transaction involved to use it.
- Any level above read committed requires the application to retry serialization failures — treat them as expected.
- Higher isolation does not mean higher correctness for free; it converts silent corruption into visible aborts you must handle.
