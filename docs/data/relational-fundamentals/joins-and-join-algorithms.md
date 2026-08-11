---
title: Joins & Join Algorithms
summary: What each join type returns, and the three physical algorithms the planner picks between to produce it.
level: core
minutes: 25
order: 3
tags: [data, sql, performance]

related:
  - data/relational-fundamentals/reading-a-query-plan
  - data/relational-fundamentals/indexes-and-how-they-work
  - data/relational-fundamentals/sql-that-earns-its-keep

resources:
  - title: Joins and Indexes
    url: https://use-the-index-luke.com/sql/join
    source: Markus Winand
    type: article
    minutes: 25
    primary: true
  - title: Planner / Optimizer
    url: https://www.postgresql.org/docs/current/planner-optimizer.html
    source: PostgreSQL
    type: docs
    minutes: 15
  - title: Table Joins
    url: https://www.postgresql.org/docs/current/tutorial-join.html
    source: PostgreSQL
    type: docs
    minutes: 15
---

## In one line

A join matches rows from two relations on a predicate, and the planner decides *how* — nested loop, hash, or merge — based on what it thinks the row counts are.

## What it is

**Logically**, `INNER` keeps only matched pairs; `LEFT` keeps every left row and pads with NULLs; `FULL` does both sides. `CROSS` is the cartesian product, which is also what you get from a missing join condition — the classic cause of a query that hangs and then returns 40 million rows. The subtle one: a condition in `WHERE` on a left-joined table's column turns the `LEFT JOIN` back into an inner join, because `NULL = 'x'` is not true. Conditions that must survive the outer join belong in `ON`.

**Physically**, there are three algorithms and it is worth being able to name all three.

**Nested loop** — for each row on the outer side, look up matches on the inner side. Excellent when the outer side is small *and* the inner side has an index on the join key; catastrophic when the planner underestimates the outer row count and does two million index lookups.

**Hash join** — build a hash table on the smaller side, then stream the larger side past it. The default for joining two large unsorted sets. Needs memory: if the hash doesn't fit in `work_mem` it spills to disk in batches and gets dramatically slower, which is why a query can be fast for a year and then fall off a cliff as data grows.

**Merge join** — sort both sides by the join key, then walk them in lockstep. Wins when both inputs are already sorted, typically because an index supplies the order.

You do not choose these directly. You influence them by giving the planner **an index on the foreign key side**, **accurate statistics** (a stale `ANALYZE` is a common cause of a bad plan), and a predicate the planner can estimate. Foreign key columns are not indexed automatically in Postgres — only the primary key gets an index — and adding that index is one of the highest-value one-line changes available.

## Why it matters

"This page got slow" is a join problem more often than anything else, and the diagnosis is a plan reading where a nested loop is running against an estimate that is off by three orders of magnitude. In a design round, knowing that a hash join needs memory proportional to one side is how you reason about whether a query survives at 100× the data.

## Key points

- Filtering a left-joined table in `WHERE` silently converts the query to an inner join; put the condition in `ON`.
- Nested loop is fast with a small outer side and an indexed inner side, and pathological when the row estimate is wrong.
- Hash join is the workhorse for large unsorted inputs, and degrades sharply when the hash spills past `work_mem`.
- Merge join needs sorted inputs and is usually chosen when an index already provides the order.
- Postgres indexes primary keys automatically but not foreign keys — the missing FK index is the most common join-performance bug.
- Bad plans usually mean bad estimates; check `ANALYZE` freshness before rewriting the query.
- A join with no condition is a cross join, and the row count is the product, not the sum.
