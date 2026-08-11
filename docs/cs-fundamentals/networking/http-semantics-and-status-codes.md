---
title: HTTP semantics and status codes
summary: Methods, status codes, and headers as a contract — safe, idempotent, and cacheable are properties you promise, not descriptions of your handler.
level: core
minutes: 25
order: 5
tags: [networking, http, api-design]

related:
  - cs-fundamentals/networking/network-failure-modes
  - frontend/browser-platform/http-caching
  - system-design/frontend-system-design/frontend-api-design

resources:
  - title: HTTP Semantics (RFC 9110)
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    source: IETF
    type: docs
    minutes: 90
  - title: HTTP response status codes
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: HTTP request methods
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods
    source: MDN
    type: docs
    minutes: 20
  - title: Problem Details for HTTP APIs (RFC 9457)
    url: https://www.rfc-editor.org/rfc/rfc9457.html
    source: IETF
    type: docs
    minutes: 25
---

## In one line

HTTP methods carry semantic promises — safe, idempotent, cacheable — that clients, proxies, and browsers act on automatically, which is why using the wrong one causes bugs no code review catches.

## What it is

Three properties define the method table. **Safe** means no intended side effect: GET, HEAD, OPTIONS. **Idempotent** means repeating the request has the same effect as making it once: GET, HEAD, PUT, DELETE, OPTIONS. **Cacheable** means the response may be stored: GET and HEAD by default. POST is none of the three, PATCH is not idempotent unless you design it to be.

These are not documentation. Browsers prefetch links, proxies cache GETs, and clients retry idempotent requests automatically. A GET endpoint that mutates state will be triggered by a link prefetcher or a crawler, and this is a bug that ships regularly. Conversely, a POST that could safely be retried but isn't marked as such is why payment APIs need idempotency keys — the client cannot know whether a timed-out POST succeeded.

The status codes worth knowing precisely. **200** OK, **201** Created with a `Location`, **202** Accepted for async work, **204** No Content. **301** permanent redirect, cached aggressively and hard to undo; **302**/**307** temporary, with 307 preserving the method where 302 historically did not; **304** Not Modified, the conditional-request response that makes caching work. **400** malformed, **401** unauthenticated versus **403** authenticated-but-forbidden — a distinction people get backwards constantly. **404** not found, **409** conflict, **410** gone, **422** unprocessable, **429** too many requests with `Retry-After`. **500** unhandled, **502** bad gateway, **503** unavailable, **504** gateway timeout.

The rule underneath: 4xx means the client should change something before retrying, 5xx means the server failed and the same request might work later. That is what decides whether a client retry is sensible, and it is why returning 200 with `{"error": ...}` in the body is actively harmful — it defeats retry logic, monitoring, alerting, and every proxy in the path.

Headers carry the rest of the contract: `Content-Type` and `Accept` for negotiation, `Cache-Control` and `ETag` for caching and conditional requests, `Authorization`, `Retry-After`, and `Location`. For error bodies, RFC 9457's `application/problem+json` gives a standard shape — type, title, status, detail — rather than each service inventing its own.

## Why it matters

API design questions come up in almost every backend and system design round, and the fast way to sound senior is to reason from these properties: "PUT because it's idempotent, so a retry after a timeout is safe." It also matters in frontend work — knowing 401 from 403 decides whether you refresh a token or show a permissions error, and knowing which statuses are retryable is what makes a fetch wrapper correct.

## Key points

- Safe, idempotent, and cacheable are promises infrastructure acts on automatically, not descriptions of your implementation.
- A GET that mutates state will eventually be triggered by a prefetcher, crawler, or proxy — this is a real bug class.
- POST is not idempotent, so retry-safety for mutations requires a client-supplied idempotency key.
- 401 means "who are you", 403 means "I know who you are and no" — the confusion between them causes broken token-refresh loops.
- 4xx tells the client to change the request; 5xx says the server failed and a retry may succeed.
- Returning 200 with an error body breaks retries, caching, monitoring, and alerting all at once.
- 301 is cached hard by browsers and is very difficult to reverse; prefer 302 or 307 unless you truly mean forever.
- 429 should carry `Retry-After`, and clients should honour it rather than retrying on a fixed schedule.
