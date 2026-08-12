---
title: Connection Management & Pooling
summary: Why connections are the scarcest resource a service holds, and how pool sizing decides whether load becomes latency or errors.
level: core
minutes: 25
order: 3
tags: [database, pooling, performance, reliability]

related:
  - data/postgres-in-depth/connection-pooling
  - backend/services-in-production/serverless-vs-long-running-services
  - backend/services-in-production/calling-other-services

resources:
  - title: PgBouncer
    url: https://www.pgbouncer.org/features.html
    source: PgBouncer
    type: docs
    minutes: 20
  - title: About Pool Sizing
    url: https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing
    source: HikariCP
    type: article
    minutes: 15
    primary: true
  - title: Prisma — connection management
    url: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections
    source: Prisma
    type: docs
    minutes: 20
---

## In one line

A Postgres connection is a whole server process costing megabytes, so the pool is a hard capacity limit — and the right size is far smaller than most people's first guess.

## What it is

Opening a connection means a TCP handshake, TLS, and authentication — tens of milliseconds you don't want per query. A **pool** keeps a set open and lends them out. The counter-intuitive part is that **smaller pools are usually faster**: a database with 8 cores executes roughly 8 queries at a time regardless of how many connections you offer it, so 200 connections just means 200 clients contending, each slower, with more context switching and more memory. The classic formula is around `cores × 2 + effective spindles`, which lands in the range of 10–25 for typical instances — a number that surprises people every time.

When the pool is exhausted, requests **queue for a connection**, and this is the behaviour to reason about: with a checkout timeout, load turns into a fast, visible error; without one, it turns into unbounded latency and a service that appears hung. Always set an acquisition timeout, and export **pool wait time** as a metric — it is one of the clearest early warnings of database saturation.

**Multiply by instances.** Twenty replicas each with a pool of 20 is 400 connections against a database that might allow 100. Total connections across every service, every worker, and every migration tool must fit under `max_connections`. This is where serverless breaks the model entirely — instances scale with concurrency, so the arithmetic doesn't bound — and the answer is an external pooler like PgBouncer in transaction mode, or a serverless driver. Transaction-mode pooling comes with a caveat worth knowing: session-scoped features (prepared statements, `SET`, advisory locks, `LISTEN`) don't work across it.

Two more practical points. **Long transactions hold connections**, so anything doing a slow external call inside a transaction is holding your scarcest resource while waiting on someone else's network — never call an API mid-transaction. And **separate pools per workload**: giving background workers their own pool (and their own limit) stops a batch job from starving the web path, which is the pool-level version of a bulkhead.

## Why it matters

"Sorry, too many clients already" is one of the most common production incidents in a Node plus Postgres stack, and its causes — serverless fan-out, pool per instance, leaked connections from long transactions — are all things this topic names. Interviewers ask about pool sizing precisely because the intuitive answer (bigger is better) is wrong.

## Key points

- A Postgres connection is a backend process with real memory cost, so connections are capacity, not a free abstraction.
- Small pools usually outperform large ones — concurrency beyond core count adds contention, not throughput.
- Set a checkout timeout, so saturation surfaces as an error rather than as unexplained latency.
- Pool wait time is the metric that warns you before the database does.
- Total connections = pool size × instances, and it must fit under `max_connections` with room for tools.
- Serverless needs an external pooler; per-instance pools cannot bound anything.
- Transaction-mode pooling breaks prepared statements, session settings and advisory locks.
- Never make a network call inside a transaction — it holds a connection hostage to someone else's latency.
