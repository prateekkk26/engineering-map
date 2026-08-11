---
title: Frontend API Design
summary: Designing the contract from the client's side — payload shape, pagination, error envelopes, and the endpoints that stop a UI from making ten round trips.
level: core
minutes: 25
order: 2
tags: [frontend-system-design, api, data]

related:
  - frontend/state-and-data/api-contracts-and-end-to-end-types
  - frontend/state-and-data/graphql-rest-and-rpc-from-the-client
  - frontend/state-and-data/pagination-and-infinite-lists
  - frontend/architecture/bff-and-api-layering

resources:
  - title: API Design Guide
    url: https://cloud.google.com/apis/design
    source: Google
    type: docs
    minutes: 40
    primary: true
  - title: Pagination — Relay Cursor Connections Specification
    url: https://relay.dev/graphql/connections.htm
    source: Relay
    type: docs
    minutes: 20
  - title: Problem Details for HTTP APIs (RFC 9457)
    url: https://www.rfc-editor.org/rfc/rfc9457.html
    source: IETF
    type: docs
    minutes: 20
---

## In one line

In a frontend design round you don't consume the API, you specify it — and the shape you ask for is what stops the UI from being slow.

## What it is

**Endpoints follow screens, not tables.** If a screen needs a post, its author, and a comment count, one endpoint returns all three. Asking the interviewer for a per-screen endpoint — or proposing a **BFF** that composes several backend calls — is a stronger answer than three parallel fetches and a waterfall. Say the word waterfall; it's the failure you're preventing.

**Pagination.** Offset (`?page=2&limit=20`) is fine for a numbered table where users jump pages, and wrong for a feed: rows shift under you as new items arrive, so you get duplicates and gaps. **Cursor-based** (`?after=<opaque>&limit=20`) is the default for anything infinite — stable under insertion, and the cursor stays opaque so the server can change what it encodes. Return `nextCursor` and `hasMore` rather than a total count, because counting is often the expensive part of the query.

**Response shape.** Flat and predictable beats clever. Return IDs for relations plus an `included` map when the client normalises; return embedded objects when it doesn't. Choose one and say why — this is where cache normalisation becomes a design decision rather than an implementation detail. Timestamps ISO-8601 in UTC, money as integer minor units with a currency code, enums as stable strings never numbers.

**Errors need a shape the UI can branch on.** A machine-readable `code`, a human `message`, and per-field errors for forms. HTTP status classifies (400 vs 401 vs 409 vs 429 vs 500); the body disambiguates. Say what the client does with each: 401 → refresh and retry once, 429 → back off with the `Retry-After` header, 409 → refetch and re-present, 5xx → retry with jitter then surface.

**Mutations need idempotency.** A client-generated key on POST so a retried request doesn't double-charge or double-post. This one line reliably surprises interviewers who expect frontend candidates not to raise it.

**REST vs GraphQL vs RPC** is a real question here. GraphQL solves over- and under-fetching for many-shaped screens at the cost of caching complexity and a harder perf story; REST plus a BFF gets most of the benefit with a boring cache. Have a position.

## Why it matters

The Interface phase of RADIO is where frontend candidates most often go thin, and it's the phase with the clearest right answers. Pagination strategy, error envelope and idempotency key are three concrete things you can specify in ninety seconds that mark you as someone who has shipped against a real API rather than mocked one.

## Key points

- Design endpoints around screens; one composed response beats three round trips and a waterfall.
- Cursor pagination is the default for feeds because offsets duplicate and skip rows under insertion.
- Return `nextCursor` and `hasMore` instead of a total — counting is usually the expensive part.
- Keep cursors opaque so the server can change the underlying ordering without a client release.
- Every error carries a machine-readable code; status classifies, body disambiguates, and the client branches per code.
- Send a client-generated idempotency key on mutations so retries can't double-apply.
- Choose embedded vs normalised responses deliberately — it decides the client cache design.
- GraphQL buys per-screen shaping and costs cache simplicity; a BFF over REST is often the cheaper trade.
