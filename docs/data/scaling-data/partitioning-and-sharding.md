---
title: Partitioning & Sharding
summary: Splitting one big table across partitions or machines, and why the key you choose is the decision you can't undo.
level: core
minutes: 25
order: 2
tags: [data, scaling, system-design]

related:
  - data/scaling-data/replication-and-read-replicas
  - data/schema-design-and-migrations/multi-tenancy-data-models
  - data/schema-design-and-migrations/primary-keys-and-identifiers

resources:
  - title: Table Partitioning
    url: https://www.postgresql.org/docs/current/ddl-partitioning.html
    source: PostgreSQL
    type: docs
    minutes: 30
    primary: true
  - title: Designing Data-Intensive Applications — Ch. 6, Partitioning
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
  - title: Sharding Postgres with Citus
    url: https://docs.citusdata.com/en/stable/sharding/data_modeling.html
    source: Citus
    type: docs
    minutes: 25
---

## In one line

Partitioning splits a table into pieces within one database; sharding spreads those pieces across machines — and both live or die by the partition key.

## What it is

**Declarative partitioning** in Postgres splits one logical table into child tables **by range** (usually time — a partition per month), **by list** (region, tenant tier), or **by hash** (even distribution). The planner prunes partitions that can't match, so a query filtered on the key touches one child instead of the whole table. The real prize is usually maintenance rather than query speed: dropping last year's data becomes `DROP TABLE` on a partition — instant, no bloat — instead of a `DELETE` of a hundred million rows. Vacuum, index builds and backups also get per-partition granularity.

The constraint: **the partition key must be part of every unique constraint and primary key**, and queries that don't filter on it hit every partition. Choosing the key means choosing which queries stay fast.

**Sharding** is the same idea across machines, and it is a different order of complexity. Cross-shard joins and aggregates need a coordinator or application-level fan-out. Cross-shard transactions need two-phase commit or must be designed away. Rebalancing when one shard gets hot is a migration. Unique constraints are only enforceable within a shard. Options range from doing it in the application, to Citus, to a database built for it (Vitess, CockroachDB, Yugabyte, Spanner).

**Picking the key.** For B2B SaaS, `tenant_id` is usually right, because it keeps each tenant's data co-located so almost every query is single-shard — with the caveat that a single huge tenant then can't be split. For time-series, range by time and get cheap retention. Hash gives even distribution and destroys range queries. Avoid keys with hot spots: sharding by `created_at` on writes means every insert lands on the newest shard.

**Say the threshold out loud in an interview.** Sharding is the last resort, after indexing, query fixes, caching, read replicas, partitioning within one database, and a bigger machine. Modern hardware runs a single Postgres instance with several terabytes and very high throughput; most products never need to shard, and doing it early costs a year of engineering for capacity nobody uses.

## Why it matters

"How would you scale this when the table hits a billion rows?" is a standard design question, and the strong answer separates partitioning from sharding, names the key, and explains what queries the key makes expensive. Partitioning is also immediately practical: time-based retention is a real operational need in every product with events or logs.

## Key points

- Partitioning is within one database; sharding is across machines and adds distributed-systems problems.
- Partition pruning only helps queries that filter on the partition key — the key defines which queries stay fast.
- The partition key must be included in every primary key and unique constraint on the table.
- Cheap retention via `DROP TABLE` on an old partition is often the main reason to partition at all.
- Sharding breaks cross-shard joins, transactions and global uniqueness; each needs a deliberate answer.
- `tenant_id` co-locates a customer's data and keeps most queries single-shard; time-based keys create write hot spots.
- Exhaust indexing, caching, replicas, partitioning and vertical scale before sharding — most products never reach it.
