---
title: Picking the Datastore in a Design
summary: A decision procedure for the storage box on the whiteboard — start at Postgres, and name what would have to be true to move.
level: core
minutes: 20
order: 9
tags: [data, architecture, tradeoffs]

related:
  - data/choosing-a-datastore/relational-vs-document
  - data/choosing-a-datastore/key-value-stores-and-redis
  - data/choosing-a-datastore/oltp-vs-olap-and-the-warehouse

resources:
  - title: Choose Boring Technology
    url: https://mcfunley.com/choose-boring-technology
    source: Dan McKinley
    type: article
    minutes: 20
    primary: true
  - title: Just Use Postgres for Everything
    url: https://www.amazingcto.com/postgres-for-everything/
    source: Amazing CTO
    type: article
    minutes: 10
  - title: Designing Data-Intensive Applications — Chapter 2, Data Models and Query Languages
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
---

## In one line

Pick storage by access pattern, not by data shape — and the honest default is one Postgres instance until a specific requirement breaks it.

## What it is

**Ask the access-pattern questions in order.** How is this read — by primary key, by a range, by a full-text query, by similarity, or aggregated across everything? What's the read:write ratio? How big does it get in a year? What consistency does the read need? Answer those four and the choice usually makes itself.

**The default.** Relational, meaning Postgres. It does transactions, joins, JSON documents, full-text search, geospatial via PostGIS, vectors via pgvector, and pub/sub via `LISTEN/NOTIFY`. One system with one operational story is worth an enormous amount, and each of those built-ins is good enough well past the scale most products reach. The strong version of this argument — start with Postgres and add a second system only when a measured requirement forces it — is a senior position and worth stating explicitly.

**What actually justifies a second system.**

- *Cache / ephemeral state / counters* → **Redis.** Sub-millisecond reads, atomic increments, TTLs, rate-limit buckets. The most commonly justified second system by a wide margin.
- *Large blobs* → **object storage.** Non-negotiable; bytes don't go in the database.
- *Relevance-ranked or fuzzy search over millions of documents* → a **search engine**, once Postgres full-text stops being enough.
- *Analytical scans over billions of rows* → a **columnar warehouse**. OLAP queries on your OLTP primary is the classic self-inflicted outage.
- *Extreme write volume with simple key access and no joins* → a **wide-column store** (Cassandra, DynamoDB). Real, and much rarer than design rounds imply.
- *Time series at high cardinality* → a **time-series store**. Metrics pipelines want this.

**Say the cost out loud.** A second datastore means a second copy of the data, a sync path that will drift, a second failure mode, a second backup and restore story, and one more thing to be on call for. That sentence — the cost, not just the benefit — is what distinguishes a design decision from a shopping list.

**Polyglot persistence is normal, ownership isn't shared.** Each store has one service that writes to it; everyone else reads through that service or through an event stream. Two services writing the same table is how you get consistency bugs nobody can reproduce.

## Why it matters

The storage box is where interviewers probe hardest, because it's the decision that's most expensive to reverse and the one candidates most often make by reflex. Choosing DynamoDB "for scale" on a system with 40GB of data and complex queries is a negative signal; choosing Postgres and articulating the trigger that would change your mind is a positive one.

## Key points

- Choose by access pattern and read:write ratio, not by whether the data "looks relational".
- Postgres is the default: transactions, joins, JSONB, full-text, geospatial and vectors in one system.
- Redis is the second system you can most often justify — cache, counters, TTLs, rate limits.
- Blobs go to object storage; analytics goes to a warehouse, never the OLTP primary.
- Wide-column stores are for very high write volume with simple key access — rarer than interviews suggest.
- Every extra datastore adds a sync path that will drift and an on-call surface.
- One writer per store; other services read through it or via events.
