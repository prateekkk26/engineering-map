---
title: Diagnosing a Slow Postgres
summary: A repeatable order of operations for "the database is slow" — from pg_stat_statements down to the single bad plan.
level: core
minutes: 25
order: 6
tags: [data, postgres, debugging, operations]

related:
  - data/relational-fundamentals/reading-a-query-plan
  - data/postgres-in-depth/vacuum-bloat-and-autovacuum
  - data/scaling-data/n-plus-one-and-query-patterns

resources:
  - title: pg_stat_statements
    url: https://www.postgresql.org/docs/current/pgstatstatements.html
    source: PostgreSQL
    type: docs
    minutes: 20
    primary: true
  - title: The Statistics Collector Views
    url: https://www.postgresql.org/docs/current/monitoring-stats.html
    source: PostgreSQL
    type: docs
    minutes: 25
  - title: Demystifying Database Performance for Developers
    url: https://www.crunchydata.com/blog/demystifying-database-performance-for-developers
    source: Crunchy Data
    type: article
    minutes: 20
---

## In one line

Find the query that accounts for the time before you theorise about the cause — `pg_stat_statements` ordered by total time answers that in one query.

## What it is

The order matters, because every step below rules out a whole class of cause.

**1. Is it the database at all?** Check application-side latency against database time. A p99 that is all connection-pool wait time is a pool problem, not a query problem.

**2. What is running right now?** `pg_stat_activity` — look at `state`, `wait_event_type`, and `query_start`. Long `active` queries, a pile of `idle in transaction`, or many rows waiting on `Lock` each point somewhere different. This is also where you find the blocker in a lock cascade.

**3. Where does the time go in aggregate?** `pg_stat_statements` ordered by `total_exec_time` gives the honest ranking. The top entry is frequently not the slow query anyone complained about — it is a 2ms query executed 400,000 times, which is an N+1 in the application, not a database problem.

**4. Why is that statement slow?** `EXPLAIN (ANALYZE, BUFFERS)`, and look for the node where estimated and actual row counts diverge, a sequential scan on a large table with a selective filter, a sort spilling to disk, or a nested loop with a huge `loops` count.

**5. Is it the data rather than the query?** `pg_stat_user_tables` for dead tuples and last autovacuum; bloat and stale statistics make good queries slow without any code changing. A plan that flipped overnight is usually this.

**6. Is it resources?** Cache hit ratio from `pg_stat_database`, disk I/O, CPU, and whether the working set still fits in RAM. A database that was fine until it outgrew memory degrades sharply and looks like a query problem.

Two habits that make this faster: enable `pg_stat_statements` and `auto_explain` *before* you need them, and log slow queries with `log_min_duration_statement`. Diagnosing without them means reproducing the incident first.

## Why it matters

"The app got slow, walk me through what you'd check" is a standard senior question in full-stack loops and the answer is judged on order and elimination, not on knowing exotic commands. Having a sequence — activity, aggregate, plan, table health, resources — is the difference between a systematic answer and a list of guesses.

## Key points

- Rank by total time (calls × mean), not by the slowest single execution; the top cost is often a fast query run too often.
- `pg_stat_activity` with `wait_event_type` distinguishes locking, I/O and CPU-bound problems in one look.
- A query that was fast last week and is slow now is usually stale statistics, bloat, or a crossed size threshold — not a code change.
- Check pool wait time before blaming the database; connection starvation looks exactly like query slowness from the app.
- Always capture `BUFFERS` — knowing whether reads came from cache or disk changes the diagnosis.
- Enable `pg_stat_statements`, `auto_explain` and slow-query logging in advance; they cost little and are useless retroactively.
- Rising `idle in transaction` is an application bug and simultaneously blocks vacuum, so it degrades everything else too.
