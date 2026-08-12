---
title: Conditional Requests & API Caching
summary: The validators a service emits — ETag, Last-Modified, Cache-Control — and how the same headers give you optimistic concurrency for free.
level: core
minutes: 20
order: 2
tags: [api, http, caching, concurrency]

related:
  - cs-fundamentals/networking/http-semantics-and-status-codes
  - data/transactions-and-consistency/optimistic-vs-pessimistic-concurrency
  - frontend/browser-platform/http-caching

resources:
  - title: Conditional requests
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests
    source: MDN
    type: docs
    minutes: 20
    primary: true
  - title: RFC 9111 — HTTP Caching
    url: https://www.rfc-editor.org/rfc/rfc9111.html
    source: IETF
    type: docs
    minutes: 45
  - title: Cache-Control for civilians
    url: https://csswizardry.com/2019/03/cache-control-for-civilians/
    source: Harry Roberts
    type: article
    minutes: 25
---

## In one line

If your responses carry an `ETag`, clients get cheap `304`s on reads and a `412` instead of a silent overwrite on writes — two hard problems solved by one header.

## What it is

A **validator** is a token identifying a specific version of a resource. `ETag` is the strong form (a hash or a version number); `Last-Modified` is the weaker one, limited to one-second resolution and useless when a resource can change twice in a second. Emit an `ETag` on every resource `GET` you can; deriving it from a row's `updated_at` plus `id`, or from an explicit `version` column, is enough — it does not have to be a hash of the body.

On reads, a client sends `If-None-Match: "abc"`, and if nothing changed you return `304 Not Modified` with no body. You still did the database lookup, so this saves bandwidth and client-side re-parsing rather than server work — meaningful for large payloads and mobile clients, marginal for small ones.

The more valuable half is **writes**. `If-Match: "abc"` says "only apply this if the resource is still the version I read". If it isn't, you return `412 Precondition Failed` and the client refetches and retries. That is optimistic concurrency control expressed in the protocol: two users editing the same document can no longer silently clobber each other, and you didn't invent a bespoke `version` field in your request bodies to get there. `If-None-Match: *` on a `POST`/`PUT` is the create-only variant — succeed only if the resource doesn't already exist.

For **`Cache-Control` on an API**, the defaults matter more than the tuning. Anything user-specific is `private, no-store` or at most `private, max-age=0, must-revalidate`, because a shared cache holding one user's data and serving it to another is a real incident, not a theoretical one. Public, slow-changing collections can take a short `max-age` plus `stale-while-revalidate` and get a genuine CDN win. Always set `Vary` on `Authorization` and `Accept-Encoding` when a response varies by them — a missing `Vary` is how caches serve the wrong body.

## Why it matters

"Two users edit the same record — what happens?" is a routine design follow-up, and `If-Match` plus `412` is a faster, more credible answer than describing a locking scheme. On the caching side, the failure mode is asymmetric: a missed cache hit costs milliseconds, a shared cache serving authenticated data is a data breach.

## Key points

- `ETag` is a version identifier, not necessarily a hash — `updated_at` or a version column is a fine source.
- `If-None-Match` on reads yields `304` and saves payload, not database work.
- `If-Match` on writes yields `412` on conflict, which is optimistic concurrency control at the protocol level.
- `Last-Modified` has one-second granularity, so it silently fails on resources that change rapidly.
- Authenticated responses need `private` or `no-store`; a shared cache holding them is a cross-user data leak.
- `Vary: Authorization` is what stops an intermediary reusing one user's response for another.
- `stale-while-revalidate` is the cheapest latency win available for public, slowly-changing endpoints.
