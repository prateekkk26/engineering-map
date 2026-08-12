---
title: Structured Logging
summary: Logging events as objects with a request ID attached, so production questions are queries instead of grep.
level: core
minutes: 20
order: 1
tags: [observability, logging, node]

related:
  - backend/observability/tracing-and-context-propagation
  - backend/api-design/api-errors-clients-can-act-on
  - practices/incident-response/debugging-production-systems
  - _shared/observability-fundamentals

resources:
  - title: Pino — logging in Node.js
    url: https://getpino.io/#/
    source: Pino
    type: docs
    minutes: 20
    primary: true
  - title: Logging Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 20
  - title: Logs and events
    url: https://opentelemetry.io/docs/concepts/signals/logs/
    source: OpenTelemetry
    type: docs
    minutes: 15
---

## In one line

Log one JSON object per event with consistent field names and a request ID on every line, because the value of a log is whether you can filter and aggregate it six months later.

## What it is

`console.log("user " + id + " failed to update")` is unqueryable: you can grep for a substring, but you can't ask "how many failures per tenant in the last hour". The same event as `{ level: "error", msg: "update failed", userId, tenantId, durationMs, errorCode }` answers that in one query. Structured logging is that swap, and everything else is discipline about the fields.

**Consistency of field names is the whole game.** `userId` in one service and `user_id` in another means every query needs both. Agree a small set — `requestId`, `userId`, `tenantId`, `route`, `status`, `durationMs`, `errorCode` — and attach them everywhere. OpenTelemetry's semantic conventions are a ready-made vocabulary worth adopting rather than inventing your own.

**Correlation is what makes logs usable.** Generate a request ID at the edge (or accept an inbound one), put it in `AsyncLocalStorage`, and have the logger include it automatically on every line — including from deep inside library code you didn't write. Then one filter reconstructs everything that happened during a request, across services if you propagate the ID outward. Without this you have a pile of true statements with no way to relate them.

**Log levels need a rule, or they decay.** `error` = someone should look at this; `warn` = degraded but handled; `info` = a business event worth counting (user created, payment captured); `debug` = off in production, enabled per-request or per-service when needed. Logging every function entry at `info` is how a team ends up with a five-figure observability bill and no signal.

**Never log secrets or personal data.** Tokens, passwords, API keys, full request bodies, card numbers, and — in a GDPR context — anything identifying beyond what you can justify. Use a redaction list in the logger itself rather than trusting call sites, and remember that error objects from HTTP clients frequently contain the full request including the `Authorization` header.

Two practical Node notes: log to stdout as JSON and let the platform ship it (12-factor), and use an async, low-overhead logger — synchronous file writes block the event loop, which is a self-inflicted latency problem.

## Why it matters

The first thing anyone does in an incident is search the logs, and whether that takes thirty seconds or an hour is decided months earlier by whether lines carry a request ID and consistent fields. Being able to describe that setup is a strong operability signal in a deep-dive round.

## Key points

- One structured object per event beats interpolated prose, because it can be filtered and aggregated.
- A shared field vocabulary across services is what makes cross-service queries possible at all.
- A request ID propagated via `AsyncLocalStorage` and injected by the logger is the highest-value single change.
- Levels need an agreed meaning; `info` on everything is a cost problem disguised as thoroughness.
- Redact secrets and PII in the logger, not at call sites — error objects often carry auth headers.
- Log to stdout and let the platform handle shipping and rotation.
- Use an async logger; synchronous writes block the single thread you have.
