---
title: Indexes & How They Work
summary: A B-tree index is a sorted structure the database can binary-search, and every rule about column order and selectivity follows from that.
level: core
minutes: 30
order: 4
tags: [data, performance, indexes]

related:
  - data/postgres-in-depth/postgres-index-types
  - data/relational-fundamentals/reading-a-query-plan
  - data/relational-fundamentals/joins-and-join-algorithms

resources:
  - title: Use The Index, Luke!
    url: https://use-the-index-luke.com/
    source: Markus Winand
    type: article
    minutes: 60
    primary: true
  - title: Indexes
    url: https://www.postgresql.org/docs/current/indexes.html
    source: PostgreSQL
    type: docs
    minutes: 30
  - title: Index-only scans and covering indexes
    url: https://www.postgresql.org/docs/current/indexes-index-only-scans.html
    source: PostgreSQL
    type: docs
    minutes: 10
---

## In one line

An index is a separate sorted copy of some columns plus a pointer to the row, so the database can find matches without reading the whole table.

## What it is

The default index is a **B-tree**: a balanced tree of sorted keys, so a lookup is a few page reads regardless of table size. Because it is *sorted*, one structure serves equality lookups, range scans (`>`, `BETWEEN`), prefix matches (`LIKE 'foo%'` but never `LIKE '%foo'`), `ORDER BY` without a sort step, and `MIN`/`MAX` as a single edge read.

**Composite index column order is the rule people get wrong.** An index on `(tenant_id, created_at)` supports filtering by `tenant_id`, and by `tenant_id` plus a range on `created_at`, and ordering by `created_at` within a tenant. It does *not* help a query that filters only on `created_at` — a phone book sorted by surname then first name is useless for finding every "Prateek". Put equality columns first, the range or sort column last.

**A covering index** includes every column the query touches, so the database answers from the index alone — an index-only scan, no table access at all. In Postgres you add non-searchable payload columns with `INCLUDE`.

Indexes are not free, and this is the part candidates skip. Every one adds write amplification: an insert updates the table *and* every index. They consume memory and disk, they need vacuuming, and a redundant index — `(a)` when `(a, b)` already exists — is pure cost. **Selectivity decides usefulness**: an index on a boolean column that is `true` for 90% of rows will be ignored, because a sequential scan is cheaper than random-access-per-row. A partial index (`WHERE deleted_at IS NULL`) restores the value in exactly that case.

Three things that quietly disable an index: **wrapping the column in a function** (`WHERE lower(email) = $1` needs an expression index on `lower(email)`), a **type mismatch** that forces a cast, and a **leading wildcard** in `LIKE`. In each case the plan shows a sequential scan and the query looks unexplainably slow.

## Why it matters

"The query is slow, what do you do?" is one of the most common backend-flavoured questions in a full-stack loop, and the expected answer walks from plan to index to selectivity rather than jumping to "add an index". Knowing the write cost is what separates that answer from a junior one — the fix for a slow read is sometimes *removing* four unused indexes from a hot write path.

## Key points

- A B-tree is sorted, which is why one index serves equality, ranges, ordering and min/max.
- In a composite index, equality columns come first and the range or sort column last; a query filtering only on a later column cannot use it.
- An index-only scan requires every referenced column to be in the index — that is what `INCLUDE` is for.
- Low-selectivity columns don't benefit from an index; a partial index on the rare value does.
- Each index taxes every insert, update and delete, so unused indexes are a write-throughput bug.
- A function or a cast applied to the indexed column disables the index unless you build a matching expression index.
- `LIKE 'abc%'` uses a B-tree; `LIKE '%abc'` cannot, and needs a trigram or full-text index instead.
