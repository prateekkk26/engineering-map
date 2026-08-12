---
title: Designing a Schema for a Feature
summary: A repeatable path from a product description to tables, keys and indexes — the exercise a design round actually runs.
level: core
minutes: 25
order: 1
tags: [data, modelling, system-design]

related:
  - data/relational-fundamentals/relational-model-and-normalisation
  - data/schema-design-and-migrations/primary-keys-and-identifiers
  - data/relational-fundamentals/constraints-and-data-integrity

resources:
  - title: Thinking Fast vs. Slow With Your Data in Postgres
    url: https://www.crunchydata.com/blog/thinking-fast-vs-slow-with-your-data-in-postgres
    source: Crunchy Data
    type: article
    minutes: 20
  - title: Designing Data-Intensive Applications — Ch. 2
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
  - title: DDL — Creating Tables
    url: https://www.postgresql.org/docs/current/ddl-basics.html
    source: PostgreSQL
    type: docs
    minutes: 15
---

## In one line

Name the entities, decide each relationship's cardinality, choose the keys, then let the actual queries decide the indexes.

## What it is

**Start with nouns and their lifecycles.** Read the feature description and list the things that exist independently — a user, an organisation, a conversation, a message, a run. The test for an entity is whether it has its own identity and lifespan: a message survives independently of the UI that displays it, an "unread badge" does not.

**Then cardinality, out loud.** One-to-many needs a foreign key on the many side. Many-to-many needs a join table, and the join table almost always grows its own columns — `role`, `added_at`, `added_by` — which is why modelling it as a first-class entity from the start is cheaper than retrofitting. One-to-one usually means you had one table and split it, which is justified when the halves have different access patterns or sensitivity, and not otherwise.

**Decide what is a reference and what is a snapshot.** A line item's price must not follow the product price; a message's author name should. Getting this backwards produces invoices that silently change and is very expensive to reconstruct later.

**Model state as a column, not a table per state.** A `status` with a `CHECK` constraint beats `archived_items` and `deleted_items` tables. And model *history* explicitly when the product asks a historical question — "who changed this and when" needs an events or versions table, and bolting it on later means the history starts empty.

**Then the query pass.** Write down the three or four reads the feature actually performs: the list view with its filter and sort, the detail fetch, the counts. Each one implies an index, usually composite, usually `(tenant_id, something, created_at)`. This is also where you catch a shape that reads badly — if the list view needs four joins and an aggregate, consider whether a summary column with a clear owner is warranted.

Two things to state as decisions rather than let happen: **soft delete or hard delete**, and **whether the table is multi-tenant** (which is a tenant column on nearly everything, and an index prefix everywhere).

## Why it matters

The practical and design rounds both hand you an underspecified feature and watch how you decompose it. Schema is where the ambiguity surfaces first, so asking "can a user belong to two organisations?" is simultaneously the modelling question and the clarifying question interviewers score you on. A schema is also the hardest thing to change later — code gets rewritten weekly, tables outlive the team.

## Key points

- An entity has independent identity and lifecycle; a derived display value does not deserve a table.
- Many-to-many join tables acquire attributes, so model them as real entities from the beginning.
- Decide reference-versus-snapshot per column, and make the intent visible in the name.
- States belong in a constrained `status` column, not in parallel tables per state.
- If the product asks historical questions, model history from day one — retrofitted history starts empty.
- Indexes come from the actual read paths, not from intuition; write the queries down first.
- Tenancy and delete semantics are explicit design decisions that touch nearly every table.
