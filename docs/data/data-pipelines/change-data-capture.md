---
title: Change Data Capture
summary: Reading the database's own write-ahead log to get a reliable stream of every row change, without touching application code.
level: deep
minutes: 20
order: 2
tags: [data, pipelines, replication]

related:
  - data/scaling-data/outbox-and-dual-write-consistency
  - data/vector-data/keeping-embeddings-in-sync
  - data/scaling-data/replication-and-read-replicas

resources:
  - title: Debezium — Connector for PostgreSQL
    url: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
    source: Debezium
    type: docs
    minutes: 30
    primary: true
  - title: Logical Decoding
    url: https://www.postgresql.org/docs/current/logicaldecoding.html
    source: PostgreSQL
    type: docs
    minutes: 25
  - title: Change Data Capture
    url: https://martinfowler.com/eaaDev/EventSourcing.html
    source: Martin Fowler
    type: article
    minutes: 15
---

## In one line

CDC turns the database's replication log into an event stream, so every insert, update and delete becomes a message without any application code emitting it.

## What it is

Postgres's **logical decoding** exposes the WAL as a stream of row-level changes through a replication slot; Debezium and the managed equivalents turn that into messages on a topic. Because it reads the same log replication uses, it captures **every** change — including those made by a migration, an admin script or psql — which is precisely what an application-emitted event stream misses.

Uses: keeping a search index or cache current, feeding a warehouse without nightly full exports, driving embedding refresh, replicating to another service's database, and relaying the outbox table without polling.

**The operational hazards are specific and worth knowing.** A replication slot that no consumer is reading **retains WAL indefinitely**, and the disk fills until the primary stops. This is one of the more common ways to take down a Postgres instance, and it happens when a CDC consumer is turned off but its slot is left behind. Slots also do not survive failover in older setups, so promotion can lose the stream's position. And `REPLICA IDENTITY` decides how much of the row appears in an update or delete event: by default only the primary key, so if you want before-images you must set `REPLICA IDENTITY FULL`, which increases WAL volume.

**Semantics**: at-least-once with restarts replaying from the last committed offset, so consumers must be idempotent. Ordering is guaranteed per table and per key if you partition by primary key. Schema changes flow through as well, and a downstream consumer that assumes a fixed shape breaks on the next migration — which makes CDC a coupling between your internal schema and whatever consumes it. That coupling is the strongest argument for the outbox pattern instead: an outbox event is a deliberate contract, whereas raw CDC exports your table structure to other teams.

The pragmatic rule: **CDC for infrastructure concerns** — indexes, caches, warehouses, derived data you own — and **outbox events for cross-service contracts**.

## Why it matters

CDC is how "keep this derived thing up to date" is solved without scattering dual writes through the codebase, and it comes up whenever a design has a search index, a warehouse or an embedding store. The retained-WAL failure is also a good, concrete war story to have available in an operations discussion.

## Key points

- CDC reads the WAL, so it captures changes made outside the application — migrations, scripts, manual fixes.
- It removes dual writes: the database commit is the only thing that has to succeed.
- An unread replication slot retains WAL until the disk fills; abandoned slots are a real outage cause.
- `REPLICA IDENTITY` controls whether events carry before-images, at the cost of extra WAL volume.
- Delivery is at-least-once with replay from an offset, so every consumer must be idempotent.
- Raw CDC couples consumers to your internal schema; migrations then become breaking changes downstream.
- Use CDC for derived data you own, and outbox events for contracts other services depend on.
