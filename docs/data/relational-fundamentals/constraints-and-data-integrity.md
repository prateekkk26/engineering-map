---
title: Constraints & Data Integrity
summary: Why the invariant belongs in the schema rather than in application code, and what each constraint type actually guarantees.
level: core
minutes: 20
order: 6
tags: [data, modelling, correctness]

related:
  - data/relational-fundamentals/relational-model-and-normalisation
  - data/transactions-and-consistency/acid-and-what-each-letter-buys
  - data/schema-design-and-migrations/zero-downtime-migrations

resources:
  - title: Constraints
    url: https://www.postgresql.org/docs/current/ddl-constraints.html
    source: PostgreSQL
    type: docs
    minutes: 25
    primary: true
  - title: Postgres Constraints for Newbies
    url: https://www.crunchydata.com/blog/postgres-constraints-for-newbies
    source: Crunchy Data
    type: article
    minutes: 15
  - title: Data Types
    url: https://www.postgresql.org/docs/current/datatype.html
    source: PostgreSQL
    type: docs
    minutes: 20
---

## In one line

A constraint makes an invalid row impossible to write, which is strictly stronger than an application that promises not to write one.

## What it is

**`NOT NULL`** is the one people under-use. Nullable-by-default columns push a "what if it's missing?" branch into every consumer forever, including the TypeScript type. Make columns non-null unless absence is genuinely meaningful, and give them a default where one exists.

**`UNIQUE`** enforces at most one row per value and is backed by an index, so it also serves lookups. A partial unique index expresses conditional uniqueness — one active subscription per user, while allowing many cancelled ones: `CREATE UNIQUE INDEX ... ON subscriptions (user_id) WHERE status = 'active'`. This is the correct answer to a race that application-level checking cannot win, because two concurrent requests can both pass a `SELECT` before either `INSERT`s.

**Foreign keys** guarantee referential integrity and let you declare the delete behaviour: `RESTRICT` (default, refuse), `CASCADE` (delete the children), `SET NULL`. `CASCADE` is convenient and occasionally terrifying — one delete can remove a subtree. Note that the FK checks the child on write and the parent on delete, both of which want an index on the child column.

**`CHECK`** encodes domain rules — `price >= 0`, `ends_at > starts_at`, a status in a known set. **Exclusion constraints** generalise uniqueness to any operator, most usefully "no two bookings for the same room with overlapping time ranges", which is otherwise a nasty concurrency problem.

Then there are **types as constraints**: `numeric` not `float` for money, `timestamptz` not `timestamp`, a real `date` not a string, `citext` or a case-normalised column for emails. Choosing an honest type removes a whole class of invalid state before any constraint is needed.

The trade-off worth stating: constraints cost a little on write, they make some migrations harder, and a violation surfaces as a database error your API must translate into a decent message. That is a good trade — the alternative is discovering the bad rows a year later during an incident.

## Why it matters

"Where do you enforce this rule?" is a standard design follow-up, and the senior answer is *in the schema, with a friendly message in the app* — validation in application code is a UX affordance, not a guarantee, because it can be bypassed by a script, a second service, or a race. Unique constraints in particular are the only correct fix for check-then-insert races.

## Key points

- Application-level validation is advisory; the database constraint is the only thing that cannot be bypassed by a concurrent request or a one-off script.
- A partial unique index expresses "only one active X per Y" and wins races that a `SELECT`-then-`INSERT` loses.
- Default columns to `NOT NULL`; every nullable column becomes a branch in every consumer, including the generated types.
- Foreign keys need an index on the child column, or deletes on the parent do a sequential scan.
- `ON DELETE CASCADE` is a real deletion policy decision, not a convenience — say out loud what it removes.
- `CHECK` and exclusion constraints encode domain rules like non-negative amounts and non-overlapping bookings.
- Type choice is the cheapest constraint: `numeric` for money, `timestamptz` for time, never a string for either.
