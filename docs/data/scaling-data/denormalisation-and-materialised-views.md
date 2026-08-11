---
title: Denormalisation & Materialised Views
summary: Precomputing an expensive read, and the three ways to keep the precomputed copy honest.
level: core
minutes: 20
order: 3
tags: [data, performance, caching]

related:
  - data/relational-fundamentals/relational-model-and-normalisation
  - _shared/caching
  - data/choosing-a-datastore/oltp-vs-olap-and-the-warehouse

resources:
  - title: Materialized Views
    url: https://www.postgresql.org/docs/current/rules-materializedviews.html
    source: PostgreSQL
    type: docs
    minutes: 15
    primary: true
  - title: REFRESH MATERIALIZED VIEW
    url: https://www.postgresql.org/docs/current/sql-refreshmaterializedview.html
    source: PostgreSQL
    type: docs
    minutes: 10
  - title: Generated Columns
    url: https://www.postgresql.org/docs/current/ddl-generated-columns.html
    source: PostgreSQL
    type: docs
    minutes: 10
---

## In one line

Denormalisation trades write complexity for read speed by storing a computed answer, which means someone now owns keeping that answer true.

## What it is

Three mechanisms, in increasing order of freshness and cost.

**A materialised view** stores the result of a query as a real table you can index. Refreshing it re-runs the query; `REFRESH MATERIALIZED VIEW CONCURRENTLY` avoids locking readers but needs a unique index and is slower. This is the right tool for dashboards, leaderboards and reports where minutes-old data is fine. Note it is *not* incremental in Postgres — the whole thing is recomputed, so it stops being viable when the underlying query gets slow enough that the refresh itself is a problem.

**A maintained counter or summary column** — `posts.comment_count`, `orders.total` — updated in the same transaction as the change, by application code or a trigger. Fresh and cheap to read, but now there are two sources of truth. It needs a **reconciliation job** that recomputes and compares, because counters drift: someone deletes rows in a migration, a code path forgets to decrement, a bug double-increments. If you take one thing: a denormalised counter without a periodic rebuild will be wrong within a year.

**A generated column** (`GENERATED ALWAYS AS ... STORED`) is denormalisation the database maintains for you — full names, computed totals from other columns of the same row, a `tsvector` for search. No drift possible, so prefer it whenever the value derives from the same row.

**Do this only after measuring.** A normalised query with the right index is often faster than people assume, and the aggregate that "must be precomputed" frequently turns out to be a missing index on a foreign key. When you do denormalise, write down: what the copy is derived from, who updates it, how stale it may be, and how it gets rebuilt. A denormalised value without a documented rebuild path is a future incident.

The related move at larger scale is a **read model** — a separate table shaped for one screen, updated from events — which is CQRS in miniature and the same trade-off with more machinery.

## Why it matters

Every read-heavy feature eventually reaches for this, and the interview question is not whether you know what a materialised view is but whether you can name the staleness and drift consequences. "Where does this number come from and how do you know it's right?" is a strong follow-up that precomputation has to answer.

## Key points

- Denormalisation moves cost from read time to write time and creates a second copy that can disagree with the first.
- Materialised views are indexable snapshots; Postgres recomputes them entirely, so refresh cost grows with the query.
- `REFRESH ... CONCURRENTLY` keeps readers unblocked but requires a unique index and takes longer.
- Counter columns must be updated in the same transaction as the change, and still need a reconciliation job.
- Generated columns cannot drift because the database maintains them — prefer them for same-row derivations.
- Measure the normalised query with the right index first; many "necessary" precomputations are a missing index.
- Every denormalised value needs a documented owner, staleness bound and rebuild path.
