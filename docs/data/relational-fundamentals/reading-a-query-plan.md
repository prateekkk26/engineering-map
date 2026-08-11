---
title: Reading a Query Plan
summary: How to run EXPLAIN ANALYZE and find the one node where the estimate and the reality diverge.
level: core
minutes: 25
order: 5
tags: [data, performance, debugging]

related:
  - data/relational-fundamentals/indexes-and-how-they-work
  - data/postgres-in-depth/diagnosing-a-slow-postgres
  - data/relational-fundamentals/joins-and-join-algorithms

resources:
  - title: Using EXPLAIN
    url: https://www.postgresql.org/docs/current/using-explain.html
    source: PostgreSQL
    type: docs
    minutes: 30
    primary: true
  - title: explain.dalibo.com
    url: https://explain.dalibo.com/
    source: Dalibo
    type: docs
    minutes: 10
  - title: EXPLAIN Explained
    url: https://www.pgmustard.com/docs/explain
    source: pgMustard
    type: article
    minutes: 25
---

## In one line

`EXPLAIN ANALYZE` shows what the planner expected and what actually happened, and the bug is almost always the node where those two numbers disagree.

## What it is

`EXPLAIN` prints the plan the planner chose. `EXPLAIN ANALYZE` *executes* the query and adds real timings and row counts — which means it really runs your `DELETE`, so wrap it in a transaction you roll back. Add `BUFFERS` (on by default with `ANALYZE` in recent versions) to see how much data was read and whether it came from cache.

Read the tree **inside out and bottom up**: leaves are scans, parents combine them, the top node produces the result. Each node reports `cost=start..total`, `rows=` the estimate, and with `ANALYZE`, `actual time=start..total rows=N loops=L`. **The per-node time is inclusive of its children**, and `actual time` is per loop — a node showing 0.5ms with `loops=20000` cost ten seconds. That multiplication is the single most misread thing in a plan.

The diagnostic move is to find the deepest node where `rows` estimated and `rows` actual differ by an order of magnitude or more. Everything above it is planning on a fiction, which is how you end up with a nested loop over two million rows. Causes: stale statistics (`ANALYZE the_table`), correlated columns the planner assumes are independent (fix with `CREATE STATISTICS`), or a predicate it cannot estimate, like an opaque function call.

Node types worth recognising on sight: **Seq Scan** (fine on a small table, suspicious on a large one with a selective filter), **Index Scan** vs **Bitmap Heap Scan** (the latter batches random reads when many rows match), **Index Only Scan** (best case), **Nested Loop / Hash Join / Merge Join**, **Sort** with `Sort Method: external merge Disk: NkB` — that means it spilled and `work_mem` is too small — and `Rows Removed by Filter`, which tells you how much work was wasted reading rows that didn't qualify.

Paste the JSON output into a visualiser rather than squinting at text; it colours the expensive node for you.

## Why it matters

Every "why is this slow" conversation ends here, and being able to read a plan out loud is the difference between guessing at indexes and knowing which one to add. It is also the evidence you bring to a review — "this adds a sort that spills to disk at 50k rows" beats an opinion.

## Key points

- `EXPLAIN ANALYZE` actually executes the statement; use a rolled-back transaction for writes.
- Read bottom-up; a node's reported time includes its children's.
- `actual time` is per loop — multiply by `loops` before deciding a node is cheap.
- The fault is at the lowest node where estimated and actual row counts diverge by 10× or more.
- A big estimate error usually means stale statistics or correlated columns, not a bad query.
- `Rows Removed by Filter` quantifies wasted reads and points straight at a missing or wrong index.
- `Sort Method: external merge` and a `Disk:` figure mean the operation spilled; raising `work_mem` for that query may beat any index change.
