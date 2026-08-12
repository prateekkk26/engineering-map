---
title: Pagination, Filtering & Sorting
summary: Why cursor pagination beats offset for anything that changes, and how filters and sorts turn into an index you have to actually own.
level: core
minutes: 25
order: 5
tags: [api, pagination, performance]

related:
  - data/relational-fundamentals/indexes-and-how-they-work
  - frontend/state-and-data/pagination-and-infinite-lists
  - backend/api-design/rate-limits-and-quotas

resources:
  - title: Pagination
    url: https://docs.stripe.com/api/pagination
    source: Stripe
    type: docs
    minutes: 10
  - title: Paging Through Results
    url: https://use-the-index-luke.com/no-offset
    source: Markus Winand
    type: article
    minutes: 20
    primary: true
  - title: GraphQL Cursor Connections Specification
    url: https://relay.dev/graphql/connections.htm
    source: Relay
    type: docs
    minutes: 20
---

## In one line

Offset pagination is a correctness bug and a performance bug on any list that receives writes; cursor pagination is the default, and the cursor is just the sort key of the last row you returned.

## What it is

`LIMIT 20 OFFSET 10000` asks the database to find and discard ten thousand rows before returning anything, so page 500 is dramatically slower than page 1. Worse, it is **unstable**: if a row is inserted while the user is reading page 3, page 4 begins with a row they already saw, and if a row is deleted they skip one silently. Infinite-scroll feeds show this constantly.

**Keyset (cursor) pagination** fixes both. Sort by something stable and unique — `(created_at, id)` — and ask for rows *after* the last one you returned: `WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20`. The database seeks straight into the index, so page 500 costs what page 1 costs, and concurrent inserts can't shift the window. The tiebreaker column is not optional: two rows with the same timestamp will otherwise loop or skip.

Encode the cursor as an **opaque string** (base64 of the key fields, ideally signed). Opaque means you can change the underlying sort without breaking clients, and it stops people constructing cursors by hand. Return it as `next_cursor`, with `has_more` — not a total count, which usually requires a second full scan you can't afford. Offset still wins in one place: a UI with numbered pages over a stable, small dataset, like an admin table.

Filtering and sorting are the same problem wearing a different hat: **every filter and sort you expose is a query pattern you have committed to supporting**, and each needs an index or it is a sequential scan waiting for the table to grow. Allowlist the sortable fields rather than passing user input into an `ORDER BY` clause, cap `limit` with a hard maximum, and treat "filter by arbitrary combination of ten fields" as a request for a search engine, not a `WHERE` builder.

## Why it matters

"How would you paginate this feed?" is a standard frontend-system-design follow-up, and answering "offset" is a visible miss. In real systems it is the classic slow-query postmortem: an endpoint fine for a year, then unusable once one customer's table passes a million rows.

## Key points

- `OFFSET` makes the database read and throw away every skipped row, so deep pages degrade linearly.
- Offset pages drift under concurrent writes — readers see duplicates or miss rows entirely.
- A keyset cursor is the sort key of the last row, and it needs a unique tiebreaker like `id` to be correct.
- Cursors should be opaque and signed, so the sort implementation stays yours to change.
- `has_more` is cheap; a total count usually is not — don't promise one by default.
- Every exposed filter and sort is an index commitment; allowlist the fields and cap the page size.
- Numbered offset pages are still fine for small, stable, admin-facing lists — the rule is not absolute.
