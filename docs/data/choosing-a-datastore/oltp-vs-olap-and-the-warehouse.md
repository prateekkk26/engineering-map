---
title: OLTP vs OLAP & the Warehouse
summary: Why row storage suits transactions and column storage suits analytics, and why running dashboards on the production database eventually fails.
level: core
minutes: 20
order: 4
tags: [data, analytics, warehouse]

related:
  - data/data-pipelines/etl-vs-elt-and-the-warehouse
  - data/scaling-data/denormalisation-and-materialised-views
  - data/choosing-a-datastore/relational-vs-document

resources:
  - title: Designing Data-Intensive Applications — Ch. 3, Storage and Retrieval
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
  - title: DuckDB — Why columnar?
    url: https://duckdb.org/why_duckdb
    source: DuckDB
    type: docs
    minutes: 15
  - title: The Modern Data Stack
    url: https://www.getdbt.com/blog/future-of-the-modern-data-stack
    source: dbt Labs
    type: article
    minutes: 15
---

## In one line

Transactional systems read a few whole rows and columnar systems read a few columns of every row, and that single difference explains the entire split.

## What it is

**OLTP** — the production database. Many small concurrent transactions, each touching a handful of rows by key, latency measured in milliseconds, correctness enforced by constraints. Row-oriented storage suits it: a row lives contiguously, so fetching one is one page read.

**OLAP** — analytics. Few queries, each scanning millions of rows but only a few columns: revenue by month by plan, retention cohorts, funnel conversion. Column-oriented storage suits it, and the win is not marginal. Reading three columns of a fifty-column table reads 6% of the data. Values in a column are the same type and often repetitive, so compression is dramatic, and operations run over compressed vectors. Snowflake, BigQuery, Redshift, ClickHouse and DuckDB all sit here.

**Running analytics on the production database** works at first and then stops. Long scans compete for I/O and cache with user-facing queries, they hold snapshots open — blocking vacuum — and the schema is normalised for writes rather than shaped for questions. The staged escape route: read replica first (cheap, isolates the load, still row-oriented and still your schema), then a real warehouse when analysts want history, joins across sources, and a modelling layer of their own.

The warehouse-side vocabulary worth having: a **star schema** — a fact table of events with foreign keys to dimension tables — because that shape is what analytical tools and columnar engines are tuned for. **ELT over ETL**: load raw data first, transform inside the warehouse with SQL (dbt), because storage is cheap and re-transforming raw data is easier than re-extracting it. **Lakehouse** formats — Iceberg, Delta — put table semantics over object storage, which is how the warehouse and data lake distinction has been collapsing.

Also worth knowing: **DuckDB** made embedded analytics genuinely easy — you can run columnar queries over Parquet files locally with no infrastructure, which covers a surprising amount of "we need analytics" before any platform is warranted.

## Why it matters

Every product eventually needs metrics, and "should this run on the app database?" is a real decision with a predictable failure mode. In a design round, being able to say why columnar storage wins for aggregation — and to place a read replica between the two extremes — is a concrete, non-hand-wavy answer.

## Key points

- Row storage optimises fetching whole records by key; column storage optimises scanning few columns over many rows.
- Columnar wins by reading less data and compressing far better because a column is one type and often repetitive.
- Analytical queries on the production database compete for cache and I/O and hold snapshots that block vacuum.
- A read replica is the cheap intermediate step; a warehouse is warranted when history, cross-source joins and modelling arrive.
- Star schemas — facts plus dimensions — are the shape analytical engines and BI tools expect.
- ELT beats ETL when storage is cheap: land raw data, transform in SQL, and keep the ability to re-derive.
- DuckDB over Parquet handles a lot of analytics with no platform at all — check that before proposing one.
