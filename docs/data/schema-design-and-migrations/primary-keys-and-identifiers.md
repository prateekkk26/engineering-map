---
title: Primary Keys & Identifiers
summary: Sequential integer, UUIDv4 or UUIDv7 — the choice affects index locality, enumeration risk, and whether clients can generate ids.
level: core
minutes: 20
order: 2
tags: [data, modelling, api]

related:
  - data/relational-fundamentals/indexes-and-how-they-work
  - data/schema-design-and-migrations/designing-a-schema-for-a-feature
  - data/scaling-data/partitioning-and-sharding

resources:
  - title: RFC 9562 — UUID versions 6, 7 and 8
    url: https://www.rfc-editor.org/rfc/rfc9562.html
    source: IETF
    type: docs
    minutes: 25
  - title: The Best UUID Type for a Database Primary Key
    url: https://vladmihalcea.com/uuid-database-primary-key/
    source: Vlad Mihalcea
    type: article
    minutes: 20
    primary: true
  - title: UUID Type
    url: https://www.postgresql.org/docs/current/datatype-uuid.html
    source: PostgreSQL
    type: docs
    minutes: 10
---

## In one line

Pick a key by what it has to do outside the database — be guessable or not, be generatable by the client or not — because inside the database the differences are mostly index locality.

## What it is

**Sequential integers** (`bigint` with an identity column) are small, fast, and produce excellent B-tree locality: new rows go to the rightmost page, so the hot part of the index stays in cache. Two costs. They **leak information** — `/invoices/1042` tells a competitor your volume, and an incrementing id invites enumeration if authorisation is weak. And they must be assigned by the database, so a client cannot know the id before the round trip, which rules out offline creation and makes idempotent retries harder.

**UUIDv4** is random, unguessable, and client-generatable. The classic objection is that randomness destroys index locality: inserts scatter across the whole B-tree, causing page splits, cache misses, and more WAL. On a large, write-heavy table that is a measurable throughput difference; on a table with a few million rows it is noise.

**UUIDv7** is the current answer to that objection: a millisecond timestamp prefix plus randomness, so ids sort roughly by creation time and inserts stay at the right edge of the index — v4's properties with v1-like locality. Postgres 18 has `uuidv7()` built in; before that, generate it in the application or with an extension. ULID and KSUID are the same idea with different encodings.

Whatever you choose, **the primary key should be a surrogate**. Natural keys — email, slug, order number — change, and a changing key means cascading updates across every referencing table. Keep the natural key as a `UNIQUE` column instead.

Two practical extras. **Prefixed public ids** (`user_01H8...`, the Stripe style) make ids self-describing in logs and support errors, and let you validate the type before a lookup. And ids in URLs are part of your public contract — changing the format later is a migration of every link anyone saved.

## Why it matters

This is a small decision that is nearly irreversible, and it comes up in every schema design conversation. Being able to say "UUIDv7, because the client generates ids for offline creates and we still want index locality" is a compact demonstration of knowing why the trade-off exists rather than reciting a preference.

## Key points

- Sequential integers give the best index locality and the smallest keys, and leak volume and ordering.
- Enumerable ids are an authorisation smell — but the fix is authorisation, not obscurity.
- UUIDv4 costs write throughput on large tables through random B-tree insertion and page splits.
- UUIDv7 is time-ordered, so it restores insert locality while staying unguessable; prefer it over v4 for new work.
- Store UUIDs in a native `uuid` column, never as text — half the size and a real comparison.
- Primary keys should be surrogate and immutable; keep emails and slugs as unique columns instead.
- Client-generated ids make create retries naturally idempotent, which server-assigned integers cannot.
