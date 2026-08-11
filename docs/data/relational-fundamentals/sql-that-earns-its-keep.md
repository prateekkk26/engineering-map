---
title: SQL That Earns Its Keep
summary: The handful of SQL features — aggregation, window functions, CTEs, upserts — that replace a loop in application code.
level: core
minutes: 30
order: 2
tags: [data, sql]

related:
  - data/relational-fundamentals/joins-and-join-algorithms
  - data/scaling-data/n-plus-one-and-query-patterns
  - data/relational-fundamentals/reading-a-query-plan

resources:
  - title: Modern SQL
    url: https://modern-sql.com/
    source: Markus Winand
    type: article
    minutes: 40
    primary: true
  - title: Window Functions
    url: https://www.postgresql.org/docs/current/tutorial-window.html
    source: PostgreSQL
    type: docs
    minutes: 20
  - title: INSERT ... ON CONFLICT
    url: https://www.postgresql.org/docs/current/sql-insert.html
    source: PostgreSQL
    type: docs
    minutes: 15
  - title: SQL for the Modern Developer
    url: https://use-the-index-luke.com/sql/dml
    source: Markus Winand
    type: article
    minutes: 20
---

## In one line

Most application loops over query results are a window function, a `GROUP BY`, or an upsert that someone didn't know existed.

## What it is

**Aggregation with `GROUP BY`** collapses rows into groups and computes per group. The rule that trips people: every selected column must be either grouped or aggregated. `FILTER (WHERE ...)` gives you conditional counts in one pass — `count(*) FILTER (WHERE status = 'failed')` alongside a total — instead of three separate queries.

**Window functions** compute across a set of rows *without* collapsing them. `row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC)` plus an outer filter on `= 1` is the canonical "latest row per user", and it replaces the fetch-all-then-loop-in-JavaScript pattern outright. `lag`, `lead`, running totals with `sum(...) OVER (ORDER BY ...)`, and `rank` cover most of the rest.

**CTEs (`WITH`)** name a subquery so a complex statement reads top to bottom. In modern Postgres they are inlined and optimised like any subquery, so the old "CTEs are an optimisation fence" advice is stale — but `MATERIALIZED` still forces the old behaviour when you want it. Recursive CTEs walk trees: category hierarchies, threaded comments, org charts.

**Upsert** — `INSERT ... ON CONFLICT (key) DO UPDATE` — collapses read-then-write into one atomic statement, which is the difference between a correct concurrent write and a race that occasionally throws a unique-violation at 3am. `RETURNING` gives you back the row without a second round trip.

Two habits worth keeping. **Always paginate with a keyset** — `WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20` — rather than `OFFSET 10000`, which makes the database walk and discard ten thousand rows. And **`NULL` is not a value**: `= NULL` is never true, `NOT IN` with a NULL in the list returns nothing, and aggregates skip NULLs. Most "the query silently returned zero rows" bugs are one of those three.

## Why it matters

The practical round frequently hands you a repo where a list endpoint does one query per row; the fix is a join plus a window function, and knowing that on sight is a visible level signal. Pushing work into the database is also usually the single largest performance win available, because it removes a round trip per row.

## Key points

- A window function keeps rows and adds a computed column; `GROUP BY` collapses them. Reaching for the wrong one is the usual confusion.
- "Latest row per group" is `row_number() OVER (PARTITION BY ... ORDER BY ...)` filtered to 1 — not a loop.
- `INSERT ... ON CONFLICT DO UPDATE` is atomic; read-check-insert in application code is a race.
- Keyset pagination stays constant-time as the offset grows; `OFFSET n` is O(n) and degrades silently.
- `NULL` propagates: `NOT IN (SELECT ...)` returns nothing if the subquery yields a single NULL.
- CTEs are for readability and recursion; in current Postgres they no longer block optimisation unless you write `MATERIALIZED`.
- `RETURNING` saves a round trip and gives you the server-generated id or timestamp.
