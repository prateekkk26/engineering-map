---
title: Postgres Index Types
summary: B-tree, GIN, GiST, BRIN and hash — what each one is for, and the three you will actually reach for.
level: core
minutes: 25
order: 1
tags: [data, postgres, indexes]

related:
  - data/relational-fundamentals/indexes-and-how-they-work
  - data/postgres-in-depth/jsonb-and-semi-structured-data
  - data/choosing-a-datastore/full-text-search-engines

resources:
  - title: Index Types
    url: https://www.postgresql.org/docs/current/indexes-types.html
    source: PostgreSQL
    type: docs
    minutes: 25
    primary: true
  - title: pg_trgm — trigram matching
    url: https://www.postgresql.org/docs/current/pgtrgm.html
    source: PostgreSQL
    type: docs
    minutes: 15
  - title: Postgres Indexes for Newbies
    url: https://www.crunchydata.com/blog/postgres-indexes-for-newbies
    source: Crunchy Data
    type: article
    minutes: 15
---

## In one line

Postgres ships six index access methods, and choosing the right one is mostly about whether your column holds one value or many.

## What it is

**B-tree** is the default and the answer roughly 90% of the time: equality, ranges, sorting, uniqueness, and index-only scans on scalar columns.

**GIN** — Generalized Inverted Index — indexes *the elements inside* a value. That makes it the right choice for `jsonb` containment (`@>`), array membership, and full-text search over `tsvector`. It is slower to build and to update than a B-tree, and with `pg_trgm` it also powers substring search: `LIKE '%term%'` and fuzzy similarity, which no B-tree can serve.

**GiST** is a framework for indexing things where "overlaps" or "is near" is the question: geometric types, PostGIS, `tstzrange` and exclusion constraints, nearest-neighbour ordering. If your predicate is a range overlap or a distance, GiST is what makes it fast.

**BRIN** stores a summary per block range rather than an entry per row, so it is tiny — kilobytes where a B-tree would be gigabytes. It only works when the physical row order correlates with the column value, which is exactly true for append-only time-series data keyed by `created_at`. On a large events table it is often the better trade than a B-tree.

**Hash** supports equality only, and B-tree does that too; it is rarely worth choosing. **SP-GiST** exists for space-partitioned data and you can safely leave it alone until you need it.

Cross-cutting features that matter more than the exotic types. **Partial indexes** (`WHERE deleted_at IS NULL`) shrink the index to the rows you actually query. **Expression indexes** (`ON users (lower(email))`) are required whenever the query wraps the column in a function. **`INCLUDE`** adds payload columns for index-only scans. And **`CREATE INDEX CONCURRENTLY`** builds without taking a write lock — the only acceptable way to add an index to a live table, at the cost of being unable to run inside a transaction and leaving an `INVALID` index behind if it fails.

## Why it matters

"Search is slow" and "the JSON query does a sequential scan" both have specific, non-obvious answers here — GIN and trigram indexes — and reaching for them is a strong signal you have used Postgres beyond CRUD. It also lets you argue against adding Elasticsearch for a feature that a GIN index handles.

## Key points

- B-tree covers equality, range, sort and uniqueness on scalars; assume it unless the data is multi-valued.
- GIN indexes the contents of composite values: `jsonb` containment, array membership, and full-text `tsvector`.
- `LIKE '%substring%'` needs a `pg_trgm` GIN index; a B-tree cannot serve a leading wildcard.
- GiST answers overlap and distance questions, and backs exclusion constraints on ranges.
- BRIN is orders of magnitude smaller than a B-tree but only works when physical order correlates with the value.
- Partial and expression indexes are usually higher-value than exotic index types.
- Always add indexes to live tables with `CREATE INDEX CONCURRENTLY`, and check for `INVALID` indexes afterwards.
