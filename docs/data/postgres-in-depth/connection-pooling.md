---
title: Connection Pooling
summary: Why a Postgres connection is expensive, and why serverless functions break the usual assumptions about pooling.
level: core
minutes: 20
order: 3
tags: [data, postgres, operations, serverless]

related:
  - data/postgres-in-depth/diagnosing-a-slow-postgres
  - data/transactions-and-consistency/locking-and-deadlocks
  - frontend/nextjs/rendering-strategies

resources:
  - title: PgBouncer — Features and pool modes
    url: https://www.pgbouncer.org/features.html
    source: PgBouncer
    type: docs
    minutes: 20
    primary: true
  - title: Connections and Authentication
    url: https://www.postgresql.org/docs/current/runtime-config-connection.html
    source: PostgreSQL
    type: docs
    minutes: 15
  - title: Serverless and databases
    url: https://neon.com/docs/connect/connection-pooling
    source: Neon
    type: docs
    minutes: 15
---

## In one line

Every Postgres connection is a separate OS process with its own memory, so the fix for "too many clients" is a pooler, not a bigger `max_connections`.

## What it is

Postgres forks a backend process per connection. That costs several megabytes of memory each plus scheduling overhead, and throughput *falls* past a certain concurrency because the processes contend rather than progress. A machine that serves 3,000 requests per second happily on 40 connections will collapse at 800. Raising `max_connections` to make the errors go away is the wrong lever; it converts a clear error into a slow, cluster-wide degradation.

A **pool** keeps a small set of connections open and hands them to requests briefly. Application-side pools (`pg` in Node, HikariCP, SQLAlchemy) work when you have a few long-lived processes: set the pool size so that `processes × pool_size` stays comfortably under `max_connections`, and remember that each instance of your app has its own pool.

**External poolers** — PgBouncer, pgcat, or the managed equivalent from Supabase, Neon or RDS Proxy — sit between the app and the database and multiplex many client connections onto few server ones. The pool mode is the thing to understand. *Session* mode assigns a server connection for the client's whole session and saves little. *Transaction* mode, the useful one, assigns a server connection only for the duration of each transaction, so hundreds of idle clients share a handful of backends. The catch: anything that assumes session state breaks — `SET` outside a transaction, `LISTEN`/`NOTIFY`, session-level advisory locks, and server-side prepared statements unless the pooler and driver support them explicitly.

**Serverless is where this actually bites.** Every concurrent lambda or edge invocation wants its own connection, there is no long-lived process to hold a pool, and a traffic spike becomes a connection storm. The options are a transaction-mode pooler in front of the database, a driver that speaks HTTP instead of the wire protocol, or a data platform that pools for you. This is a real design question for Next.js on serverless, not a theoretical one.

Watch `pg_stat_activity`: many rows in `idle in transaction` means the application is holding connections across slow work, and that starves the pool just as effectively as too few connections.

## Why it matters

"We deployed to Vercel and started getting `too many connections`" is one of the most common production incidents in this stack, and the fix requires understanding both the process model and pool modes. It also comes up whenever a design round touches serverless plus a relational database.

## Key points

- A connection is a process, not a socket; connection count is a memory and scheduling cost, not a free dial.
- Throughput peaks at modest concurrency and degrades past it — small pools usually outperform large ones.
- Total connections is pool size × number of app instances; teams forget the multiplication and exhaust the server.
- Transaction-mode pooling is what actually multiplexes; session mode mostly just moves the problem.
- Transaction mode breaks session state: `LISTEN`/`NOTIFY`, session advisory locks, and unsupported prepared statements.
- Serverless runtimes need an external pooler or an HTTP driver — an in-process pool per invocation does not work.
- `idle in transaction` connections hold both a slot and a snapshot; treat a rising count as a bug in the application.
