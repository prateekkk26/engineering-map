---
title: ACID & What Each Letter Buys
summary: What a transaction actually guarantees, and why "I" is the only letter you have to make decisions about.
level: core
minutes: 20
order: 1
tags: [data, transactions]

related:
  - data/transactions-and-consistency/isolation-levels-and-anomalies
  - data/relational-fundamentals/constraints-and-data-integrity
  - data/scaling-data/outbox-and-dual-write-consistency

resources:
  - title: Designing Data-Intensive Applications — Ch. 7, Transactions
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
  - title: Transactions
    url: https://www.postgresql.org/docs/current/tutorial-transactions.html
    source: PostgreSQL
    type: docs
    minutes: 10
  - title: Jepsen — Consistency Models
    url: https://jepsen.io/consistency
    source: Jepsen
    type: article
    minutes: 20
---

## In one line

A transaction turns several statements into one all-or-nothing unit, and ACID names the four properties that makes possible.

## What it is

**Atomicity** — the whole transaction commits or none of it does. A crash mid-way leaves no half-written state. This is what lets you write "insert the order, decrement the stock" without a recovery routine for the gap between them.

**Consistency** — the database moves from one valid state to another, where "valid" means *your declared constraints hold*. This letter does less than people assume: it is not a magic correctness property, it is foreign keys, checks and uniqueness being enforced at commit. If you haven't declared the invariant, C guarantees nothing about it.

**Isolation** — concurrent transactions don't see each other's partial work. This is the only letter with a dial, and the dial has real costs; the levels and the anomalies each one permits are their own topic.

**Durability** — once commit returns, the data survives a crash. Achieved by writing to a write-ahead log and flushing it before acknowledging. Durability is where the honest caveats live: `synchronous_commit = off` trades a few hundred milliseconds of committed data for throughput, and a single-node fsync says nothing about surviving the loss of that node — that needs synchronous replication.

Practically, the things to get right are **scope and duration**. A transaction should wrap exactly the writes that must succeed together, and nothing else. Long transactions hold locks, block others, and in Postgres prevent vacuum from cleaning up — so never do an HTTP call to a payment provider or an LLM inside one. Never span a user's think-time. And **the transaction cannot include the outside world**: an email sent inside a transaction that later rolls back has still been sent, which is why side effects belong after the commit or in an outbox row written as part of it.

Also worth internalising: in most drivers, autocommit means every statement is its own transaction. Two statements without an explicit `BEGIN` are not atomic together, however adjacent they look in the code.

## Why it matters

Every design round with a write path asks some version of "what if it fails halfway?", and the answer is a transaction boundary plus a story for the non-transactional parts. Getting the boundary wrong is also a real production failure mode: long-running transactions holding locks during an external API call is a classic cause of a database-wide stall.

## Key points

- Atomicity is all-or-nothing; durability is survives-a-crash; those two are free once you're in a transaction.
- Consistency only enforces constraints you actually declared — it is not application correctness.
- Isolation is the only ACID property you tune, and every level below serializable permits specific named anomalies.
- Two adjacent statements are not atomic unless an explicit transaction wraps them; autocommit is per statement.
- Never make a network call inside a transaction — it holds locks for the duration of someone else's outage.
- A side effect outside the database (email, payment, webhook) cannot be rolled back; write an outbox row instead.
- Durability on one node is not durability of the system; that requires synchronous replication.
