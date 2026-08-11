---
title: Hot Rows & Write Contention
summary: When every request updates the same row, throughput collapses to one transaction at a time — and the fixes are all forms of spreading the write out.
level: deep
minutes: 20
order: 4
tags: [data, concurrency, performance]

related:
  - data/transactions-and-consistency/locking-and-deadlocks
  - data/scaling-data/denormalisation-and-materialised-views
  - data/choosing-a-datastore/key-value-stores-and-redis

resources:
  - title: Explicit Locking — Row-Level Locks
    url: https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-ROWS
    source: PostgreSQL
    type: docs
    minutes: 15
  - title: Postgres Rocks, Except When It Blocks
    url: https://www.citusdata.com/blog/2018/02/22/seven-tips-for-dealing-with-postgres-locks/
    source: Citus Data
    type: article
    minutes: 20
    primary: true
  - title: Rate Limiting with Redis
    url: https://redis.io/glossary/rate-limiting/
    source: Redis
    type: article
    minutes: 15
---

## In one line

A single row that every transaction updates serialises the entire system, no matter how many application servers you add.

## What it is

Writers block writers on the same row. If a thousand concurrent requests all `UPDATE accounts SET balance = balance - 1 WHERE id = 42`, they queue: each waits for the previous transaction to commit, so throughput is one over the transaction duration. Nothing about horizontal scaling helps. Typical hot rows: a global counter, a per-tenant usage or credit balance, an inventory count on a popular item, a sequence table, the "current" row in a state machine.

**The lock is held for the whole transaction, not the statement.** So the most common amplifier is a transaction that updates the hot row early and then does something slow — another query, an API call, an LLM request. Move the hot update to the *end* of the transaction, and keep the transaction as short as possible. That one change often fixes the problem outright.

**Fixes, roughly in order of cost.**

*Aggregate instead of updating.* Insert one row per event and sum on read, optionally with a rollup job. Inserts don't contend; updates to a shared row do.

*Sharded counters.* Split the counter into N rows keyed by a random bucket; increment a random one, sum on read. Contention drops by a factor of N. This is the standard answer for high-rate counters.

*Move it out of the database.* A Redis `INCR` is atomic, in-memory and far faster; flush periodically to Postgres. Correct for rate limits and view counts, and a real durability trade for anything financial.

*Batch.* Coalesce many increments into one update per interval per key — precise enough for metrics, wrong for anything that must be exact per request.

*Change the model.* Reserve capacity in blocks instead of decrementing per unit; use a queue so one worker owns the row; or use optimistic concurrency and retry when the product tolerates it.

The thing to say out loud: **exactness has a price.** Strictly correct inventory under a flash sale means serialising on that item, and the design question is whether the product needs exactness or can accept eventual convergence with an occasional apology.

## Why it matters

This is the mechanism behind "we scaled the API to 20 instances and it got no faster", and it appears in design rounds as flash sales, seat booking, credit balances and rate limiting — all of which are token-and-usage shaped in an AI product, so the question arrives often in these loops.

## Key points

- Concurrent updates to one row serialise; adding application servers cannot increase throughput past one transaction at a time.
- The row lock lasts until commit, so anything slow in the same transaction multiplies the contention.
- Update hot rows as late in the transaction as possible, and never hold one across a network call.
- Insert-and-aggregate replaces contention with volume, which databases handle far better.
- Sharded counters divide contention by the number of buckets and sum on read.
- Redis `INCR` removes contention entirely for counters you can afford to lose a second of.
- Exact real-time counts require serialisation — decide explicitly whether the product needs exactness or convergence.
