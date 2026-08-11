---
title: Relational vs Document
summary: What a document database actually buys you now that Postgres has JSONB, and the one thing it still buys.
level: core
minutes: 20
order: 1
tags: [data, nosql, tradeoffs]

related:
  - data/postgres-in-depth/jsonb-and-semi-structured-data
  - data/relational-fundamentals/relational-model-and-normalisation
  - data/choosing-a-datastore/oltp-vs-olap-and-the-warehouse

resources:
  - title: Designing Data-Intensive Applications — Ch. 2, Document vs Relational
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
  - title: Data Modeling Introduction
    url: https://www.mongodb.com/docs/manual/data-modeling/
    source: MongoDB
    type: docs
    minutes: 25
  - title: Just Use Postgres for Everything
    url: https://www.amazingcto.com/postgres-for-everything/
    source: Stephan Schmidt
    type: article
    minutes: 10
---

## In one line

Document stores optimise for reading a whole aggregate in one go; relational stores optimise for asking questions the schema designer didn't anticipate.

## What it is

A document database stores nested records addressed by key. If your access pattern is "fetch this entire object and render it", that is one read with no joins and it is genuinely fast. The cost is that data is denormalised by design: the same fact appears in many documents, so an update touches many places, and the store gives you no help keeping them consistent. Cross-document joins are either unavailable, awkward, or performed in the application.

**Schema flexibility is often the stated reason and it is the weakest one.** The schema doesn't disappear when you stop declaring it; it moves into application code, where five versions of the shape coexist and nothing tells you which rows have which. A relational schema with a `jsonb` column gives you flexible fields *and* constraints on the parts that matter, which is why "Postgres for everything until proven otherwise" is a defensible default in 2026 — it covers documents, key-value, full-text, queues, geo and vectors adequately, with one operational story.

**What document stores still genuinely buy.** Horizontal scale-out with automatic sharding as a first-class feature, rather than something you build. A developer experience tuned for nested data. Managed, geo-distributed offerings with simple elastic scaling. And for very high write volumes of independent, schema-varying records, they need less tuning to get there.

The right framing in an interview is **access pattern first**. Are the reads mostly "give me one aggregate by id" (document-friendly), or "aggregate across entities filtered several ways" (relational)? Do multiple features need to read the same entity differently (relational — a document is shaped for one reader)? Are there invariants across entities (relational — nothing else will enforce them)? And how many datastores can this team actually operate well? Every additional store adds backups, monitoring, migrations, on-call knowledge and a consistency boundary between it and everything else.

"NoSQL scales better" is not a sufficient argument. A single well-indexed Postgres instance handles far more load than most products ever see, and the read-replica plus partitioning path goes further still.

## Why it matters

"Would you use Postgres or Mongo here, and why?" is a standard design-round question and a trap for candidates who answer with a preference. The expected answer starts from access patterns, invariants and operational cost — and names the one-datastore default explicitly rather than assuming it.

## Key points

- Document stores win when the read is "the whole aggregate by id" and the aggregate has one natural shape.
- Denormalisation is inherent to the document model, so multi-place updates become the application's problem.
- Schemaless does not mean no schema — it means the schema is implicit, versioned by accident, and unenforced.
- Postgres with `jsonb` covers most flexible-field use cases while keeping constraints on the structured parts.
- The durable advantages of document stores are built-in sharding, elastic managed scaling, and nested-data ergonomics.
- Cross-entity invariants are a strong argument for relational: nothing else will enforce them for you.
- Every extra datastore costs backups, monitoring, migrations and a consistency boundary — count that in the decision.
