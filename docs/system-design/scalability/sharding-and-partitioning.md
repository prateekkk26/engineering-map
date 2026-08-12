---
title: Sharding & Partitioning
summary: Splitting data across machines when one can't hold it — choosing the key, and living with the queries the key makes impossible.
level: core
minutes: 25
order: 4
tags: [scalability, data, partitioning]

related:
  - data/scaling-data/partitioning-and-sharding
  - system-design/scalability/hot-keys-and-load-imbalance
  - system-design/distributed-systems/distributed-transactions-and-sagas
  - system-design/classic-problems/design-a-nearby-places-service

resources:
  - title: Designing Data-Intensive Applications — Chapter 6, Partitioning
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
  - title: Consistent Hashing and Random Trees
    url: https://www.akamai.com/site/en/documents/research-paper/consistent-hashing-and-random-trees-distributed-caching-protocols-for-relieving-hot-spots-on-the-world-wide-web.pdf
    source: Karger et al. / Akamai
    type: article
    minutes: 40
  - title: Vitess — Sharding
    url: https://vitess.io/docs/concepts/shard/
    source: Vitess
    type: docs
    minutes: 15
---

## In one line

Sharding splits one logical dataset across independent machines by a partition key, and that key permanently decides which queries are cheap and which become impossible.

## What it is

**Partitioning** is splitting a table into pieces; **sharding** usually means those pieces live on separate machines, each with its own resources. It's the only way to scale *writes* past one machine, which is why it's the last resort — everything else on the read side is cheaper.

**Strategies.**

*Hash of the key.* Even distribution, no range scans. `hash(user_id) % N` is the naive version and rehashes almost everything when N changes; **consistent hashing** fixes that by mapping shards and keys onto a ring so adding a shard moves roughly 1/N of the keys. Virtual nodes smooth the distribution.

*Range.* Partition by an ordered value — date is the common one. Range scans and time-based queries stay efficient, and dropping old data is a partition drop instead of a mass delete. The risk is that the newest partition takes all the writes.

*Directory / lookup.* A service maps key to shard. Maximum flexibility, including per-tenant placement and rebalancing; the lookup itself becomes a critical dependency.

**Choosing the key is the whole decision.** The right key makes the majority of queries hit one shard. `user_id` works when the access pattern is per-user; it fails for a query like "all orders in the last hour", which now fans out to every shard and merges. Cross-shard queries, joins and transactions are the tax: aggregations become scatter-gather, and a transaction spanning shards needs a saga or two-phase commit. Also: **unique constraints and foreign keys only hold within a shard**, and global uniqueness needs a separate mechanism.

**Rebalancing.** Adding shards means moving data while serving traffic — dual writes, backfill, verify, cut over. Plan for it up front by partitioning into many more logical shards than physical machines, so growing means moving whole logical shards rather than resplitting.

**Say the cheaper alternatives first.** Archive cold data, move blobs to object storage, add replicas, split the largest table into its own database (functional partitioning), buy a bigger machine. Sharding should follow a specific number — write throughput or dataset size that a single primary provably can't hold — not a hunch.

## Why it matters

This is the highest-consequence, least-reversible decision in a data-heavy design, and interviewers use it to test whether you understand consequences rather than mechanisms. The strongest answer names the key, then immediately names the query that key makes expensive and how you'd serve it anyway — usually a secondary index, a denormalised copy keyed differently, or a search engine.

## Key points

- Sharding is the only way to scale writes past one machine, and the last resort for everything else.
- Hash keys distribute evenly and kill range scans; range keys preserve scans and risk a hot newest partition.
- Consistent hashing moves ~1/N of keys when a shard is added instead of nearly all of them.
- The partition key decides which queries are single-shard; everything else becomes scatter-gather.
- Cross-shard transactions need sagas or 2PC — uniqueness and foreign keys only hold within a shard.
- Create many logical shards up front so rebalancing moves whole shards rather than resplitting them.
- Exhaust archiving, replicas and functional splits first, and shard against a measured number.
- Always pair the key choice with how you'd still serve the queries it makes expensive.
