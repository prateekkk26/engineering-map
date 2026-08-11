---
title: Relational Model & Normalisation
summary: Why the relational model stores each fact once, and when deliberately breaking that rule is the right call.
level: core
minutes: 25
order: 1
tags: [data, modelling, sql]

related:
  - data/schema-design-and-migrations/designing-a-schema-for-a-feature
  - data/scaling-data/denormalisation-and-materialised-views
  - data/choosing-a-datastore/relational-vs-document

resources:
  - title: Database Design — Normalization
    url: https://www.postgresql.org/docs/current/ddl.html
    source: PostgreSQL
    type: docs
    minutes: 25
  - title: A Relational Model of Data for Large Shared Data Banks
    url: https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf
    source: E. F. Codd
    type: article
    minutes: 40
  - title: Database Design for Mere Mortals
    url: https://www.oreilly.com/library/view/database-design-for/9780134781945/
    source: Michael Hernandez
    type: book
  - title: Designing Data-Intensive Applications — Ch. 2, Data Models
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
---

## In one line

The relational model stores every fact exactly once and reassembles it with joins, and normalisation is the discipline that gets you there.

## What it is

A relation is a table of rows with a fixed set of typed columns, identified by a key. Relationships between tables are not pointers — they are values: a `posts.author_id` that matches a `users.id`. Nothing in the model says how the data is stored or how a query is executed; you declare what you want and the planner decides. That separation is the whole point, and it is why a query written in 2010 gets faster when you upgrade the database.

**Normalisation is a series of increasingly strict rules about where a fact is allowed to live.** First normal form: one value per column, no comma-separated lists, no `tag1`/`tag2`/`tag3`. Second: every non-key column depends on the *whole* key, not part of it. Third: no column depends on another non-key column — if `order.customer_city` is derivable from `customer_id`, it does not belong on `order`. In practice "3NF" is shorthand for *every fact has one home*, and that is 95% of the value.

The reason to care is not tidiness, it's **update anomalies**. If a customer's city is copied onto ten thousand order rows, changing it is a ten-thousand-row update that can half-fail, and the same question now has two answers depending on which row you read. A normalised schema makes the wrong state unrepresentable rather than merely unlikely.

**Denormalise deliberately, never accidentally.** Two legitimate cases: a value that is intentionally a historical snapshot rather than a reference — the price on an invoice line must not change when the product price does — and a read path where the join genuinely does not perform, handled with a materialised view or a maintained counter that has an owner and a rebuild story. "It felt faster" is not one of the cases; measure the join first.

## Why it matters

Schema design comes up in almost every practical round and every system design round, and the tell for a senior candidate is naming the anomaly a shape prevents rather than reciting normal forms. It also decides how much pain a migration is two years later: a schema where one fact lives in one place can be changed; one where it lives in five cannot.

## Key points

- A relational schema encodes relationships as values (foreign keys), not pointers, which is why the planner is free to choose the access path.
- Normalisation exists to prevent update anomalies, not to reduce disk usage — storage is cheap, contradictory copies are not.
- 3NF in one sentence: every non-key column depends on the key, the whole key, and nothing but the key.
- A repeating group or a comma-separated column is a 1NF violation and will eventually need a join table anyway.
- Copying a value is correct when you mean "as it was at the time" — invoice prices, shipping addresses — and that intent should be visible in the column name.
- Denormalise only behind a measured query plan, and give the copy an explicit owner and rebuild path.
