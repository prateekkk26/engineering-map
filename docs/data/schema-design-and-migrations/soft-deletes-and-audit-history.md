---
title: Soft Deletes & Audit History
summary: Marking a row deleted is a product decision with a query-correctness cost, and audit history is a different problem people solve with the same column.
level: core
minutes: 20
order: 4
tags: [data, modelling, compliance]

related:
  - data/schema-design-and-migrations/designing-a-schema-for-a-feature
  - data/relational-fundamentals/constraints-and-data-integrity
  - frontend/security/privacy-consent-and-gdpr

resources:
  - title: Soft Deletion Probably Isn't Worth It
    url: https://brandur.org/soft-deletion
    source: Brandur Leach
    type: article
    minutes: 15
    primary: true
  - title: Temporal Patterns
    url: https://martinfowler.com/eaaDev/timeNarrative.html
    source: Martin Fowler
    type: article
    minutes: 25
  - title: Audit Trigger
    url: https://wiki.postgresql.org/wiki/Audit_trigger_91plus
    source: PostgreSQL Wiki
    type: docs
    minutes: 15
---

## In one line

A `deleted_at` column keeps the row and makes every subsequent query responsible for remembering it exists.

## What it is

**Soft delete** replaces `DELETE` with `UPDATE ... SET deleted_at = now()`. The appeal is obvious: undo, accidental-deletion recovery, keeping referential integrity for rows that reference the deleted one, and preserving history for support.

The costs are equally concrete. **Every query now needs `WHERE deleted_at IS NULL`**, and the one that forgets is a bug that shows deleted data to users — silently, and usually in a report or an export rather than the main list. Unique constraints break: a soft-deleted `user@example.com` still occupies the unique index, so the user cannot sign up again — the fix is a partial unique index `WHERE deleted_at IS NULL`. Foreign keys stop meaning what they say, since a live row can point at a deleted parent. Indexes and table size keep growing with data nobody queries. And under GDPR, "deleted" that isn't deleted is not erasure, so a right-to-be-forgotten request needs a real deletion path anyway.

The mitigations that work: expose the filter in **one place** — a view, a repository method, a Prisma/Drizzle middleware — so no query hand-writes it; make deleted rows *invisible by default* rather than filtered by convention; and pair soft delete with a **retention job** that hard-deletes after 30 or 90 days, so the table doesn't grow forever and erasure has a real meaning.

**Audit history is a different requirement** and deserves a different mechanism. "Show me who changed this field and when" is not answered by a `deleted_at` column; it needs either an append-only `*_events` table written in the same transaction as the change, or a trigger-maintained history table, or event sourcing if the events genuinely are the source of truth. The pragmatic middle ground most products land on: a single `audit_log` table with actor, action, entity, timestamp and a `jsonb` diff, written by the application at the points that matter.

Worth stating plainly: for many tables the right answer is a **hard delete plus an archive row**, not a soft delete. Deletion is rare; the tax of the filter is paid on every query forever.

## Why it matters

"How do you handle deletes?" sounds trivial and is a good level filter — the senior answer names the unique-constraint problem, the leak risk, and the GDPR angle rather than just picking a column. It is also a common source of real incidents: deleted content reappearing in a search index or an export.

## Key points

- Soft delete moves a correctness requirement into every future query, and the query that forgets it leaks data.
- Unique constraints need a partial index restricted to live rows, or deleted values block re-creation.
- Foreign keys no longer guarantee a live parent once parents can be soft-deleted.
- Enforce the filter in one shared place — a view or data-access layer — never by convention.
- Soft deletion alone does not satisfy GDPR erasure; pair it with a retention job that hard-deletes.
- Audit history is a separate problem: an append-only events or audit table, written in the same transaction as the change.
- For most tables, hard delete plus an archive record is cheaper over the lifetime of the codebase.
