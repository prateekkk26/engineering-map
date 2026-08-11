---
title: JSONB & Semi-Structured Data
summary: When a JSONB column is the right modelling choice, and the discipline that stops it becoming a schema-shaped landfill.
level: core
minutes: 20
order: 2
tags: [data, postgres, modelling]

related:
  - data/postgres-in-depth/postgres-index-types
  - data/choosing-a-datastore/relational-vs-document
  - data/relational-fundamentals/constraints-and-data-integrity

resources:
  - title: JSON Types
    url: https://www.postgresql.org/docs/current/datatype-json.html
    source: PostgreSQL
    type: docs
    minutes: 20
    primary: true
  - title: JSON Functions and Operators
    url: https://www.postgresql.org/docs/current/functions-json.html
    source: PostgreSQL
    type: docs
    minutes: 25
  - title: When to use JSONB in your database design
    url: https://www.crunchydata.com/blog/using-jsonb-in-postgres-how-to-effectively-store-index-json-data-in-postgresql
    source: Crunchy Data
    type: article
    minutes: 15
---

## In one line

`jsonb` gives you a document column inside a relational table — indexable and queryable, but with none of the guarantees the rest of your schema has.

## What it is

`json` stores the text verbatim; **`jsonb` stores a parsed binary form** — slightly slower to write, much faster to query, deduplicates keys, loses key order, and is the one to use. Query it with `->` (returns json), `->>` (returns text), `#>` for paths, and `@>` for containment. Since Postgres 12 there is also full **JSONPath** via `jsonb_path_query`, and since 17 the SQL/JSON `JSON_TABLE` function for turning a document into rows.

**Indexing**: a GIN index on the whole column supports containment queries across every key — broad but large. `jsonb_path_ops` is a smaller, faster GIN variant that supports only `@>`. If you query one key constantly, a plain B-tree expression index on `(payload->>'status')` is far cheaper than indexing the whole document.

**When it's the right call.** Genuinely heterogeneous data whose shape you don't control: webhook payloads, LLM tool-call arguments, provider responses you want to keep verbatim for debugging. Sparse per-tenant custom fields. A settings or preferences blob read as a unit. Event bodies where the schema varies by event type. These share a property: you never need a foreign key into the contents, and you rarely filter on them across all rows.

**When it isn't.** Anything you filter, sort, join or aggregate on regularly; anything with a real relationship to another table; anything with an invariant. There is no `NOT NULL` inside a document, no foreign key, no type checking — `{"count": "12"}` and `{"count": 12}` both store fine and one of them breaks a sum later. The failure mode is a `data` column that has quietly become the actual schema, with five code paths each assuming a different shape and no migration story.

The pattern that works: **promote fields as they earn it.** Keep the raw document, and lift the fields you query into real typed columns — with a `CHECK` on the jsonb structure or a generated column if you want the database to maintain them. Hybrid is the point; `jsonb` is a supplement to a schema, not a replacement for one.

## Why it matters

AI-facing products accumulate semi-structured data fast — model responses, tool arguments, eval traces — and "how would you store this?" is a live design question in those loops. The senior answer distinguishes the parts that need constraints from the parts that only need to be kept, rather than defaulting to either extreme.

## Key points

- Use `jsonb`, not `json`: binary storage, indexable, faster queries; it does not preserve key order or duplicates.
- `->>` returns text and `->` returns json — mixing them up is the usual cause of a confusing comparison failure.
- A GIN index supports containment across all keys; a B-tree expression index on one extracted key is much smaller.
- A document column has no null, type, uniqueness or foreign-key guarantees — every invariant becomes application code.
- Good fits: payloads you don't control, sparse custom fields, verbatim provider responses, event bodies.
- Bad fits: anything you filter, join, or aggregate on across rows, or anything with a real relationship.
- Promote hot fields out of the document into typed columns as they prove themselves; keep the raw copy for debugging.
