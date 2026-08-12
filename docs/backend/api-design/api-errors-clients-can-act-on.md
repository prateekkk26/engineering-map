---
title: API Errors Clients Can Act On
summary: Designing an error response as a contract — a stable code the client branches on, a message a human reads, and enough context to fix the request.
level: core
minutes: 20
order: 4
tags: [api, errors, dx]

related:
  - backend/api-design/conditional-requests-and-api-caching
  - backend/observability/structured-logging
  - frontend/ai-interfaces/error-retry-and-degraded-modes

resources:
  - title: Errors
    url: https://docs.stripe.com/api/errors
    source: Stripe
    type: docs
    minutes: 15
    primary: true
  - title: RFC 9457 — Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457.html
    source: IETF
    type: docs
    minutes: 25
  - title: Error Handling Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 10
---

## In one line

An error response has three audiences — the client's code, the developer reading logs, and the end user — and it fails if it doesn't serve all three.

## What it is

The status code carries the category; the body carries the specifics. The body needs a **machine-readable code** that never changes (`card_declined`, `rate_limit_exceeded`, `validation_failed`), because the alternative is clients doing `if (message.includes("declined"))` and breaking the day you fix a typo. Codes are a public API surface: adding one is a feature, renaming one is a breaking change.

Alongside it: a human-readable `message` for the developer, and for validation failures a **field-level list** — `[{ field: "items[0].quantity", code: "too_small", message: "..." }]` — because a form needs to know which input to highlight, and a single string can't say that. RFC 9457 gives a standard envelope for all of this (`type`, `title`, `status`, `detail`, `instance`, plus your own members); adopting it costs nothing and means tooling recognises your errors. Stripe's shape is the pragmatic alternative most people actually copy.

Two things belong in every error but are usually missing. A **request ID**, echoed in a header and in the body, so a user can paste it into a support ticket and you can find the exact log line. And, for anything transient, **whether to retry** — `429` and `503` should carry `Retry-After`, and a client should never have to guess.

**Never leak internals.** Stack traces, SQL fragments, upstream hostnames, and library exception text are reconnaissance for an attacker and noise for everyone else. Log the detail server-side keyed by request ID; return the code. The mirror-image mistake is a generic `{"error": "Something went wrong"}` for every failure, which is safe and completely useless.

Finally, be consistent about **who owns the message the user sees**. Most of the time the client should map your code to its own copy — it knows the locale, the tone, and the context. Your `message` is for the developer.

## Why it matters

The error paths are where reviewers of a take-home look for seniority, because the happy path is easy and everyone writes it. Operationally, a stable error code is what lets a frontend distinguish "retry this" from "tell the user their card failed", and a request ID is the difference between a five-minute support investigation and an hour of grep.

## Key points

- Machine-readable error codes are a public contract — stable, documented, and never parsed out of prose.
- Validation failures need per-field errors; one flat string can't drive a form.
- RFC 9457 Problem Details is a free standard envelope; if you don't use it, at least be consistent across every endpoint.
- Echo a request ID in the response and the logs, so a user report maps to a specific trace.
- Say whether the failure is retryable — `Retry-After` on `429`/`503` beats a client's guess.
- Internal details (stack traces, SQL, upstream names) go in logs, never in the response body.
- The end-user-facing wording usually belongs to the client, which owns locale and context; your message serves the developer.
