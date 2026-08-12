---
title: Calling Other Services
summary: The HTTP client as a reliability surface — timeouts, connection reuse, deadlines, and failing fast when a dependency is already down.
level: core
minutes: 25
order: 4
tags: [reliability, http, integration]

related:
  - system-design/reliability-and-operations/circuit-breakers-and-bulkheads
  - backend/async-work/retries-backoff-and-dead-letters
  - backend/observability/tracing-and-context-propagation

resources:
  - title: Timeouts, retries, and backoff
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/retry
    source: Microsoft Azure
    type: docs
    minutes: 15
  - title: undici — Node HTTP client
    url: https://undici.nodejs.org/
    source: Node.js
    type: docs
    minutes: 20
    primary: true
  - title: Avoiding fallback in distributed systems
    url: https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/
    source: AWS Builders' Library
    type: article
    minutes: 25
---

## In one line

Every outbound call is a place your service can hang, so the defaults that matter — a timeout, a connection pool, and a deadline inherited from the caller — belong in one shared client, not in each call site.

## What it is

**`fetch` has no timeout by default.** That is the first and most consequential fact: a hung upstream holds your request, your connection, and eventually every worker, until the OS gives up minutes later. Set an explicit timeout on every call with `AbortSignal.timeout()`, and set it from a real number — the upstream's p99 plus margin — rather than a round number someone liked.

**Deadlines beat per-call timeouts.** If the incoming request has 2 seconds of budget left and you're about to make three sequential calls with 5-second timeouts each, the timeouts are meaningless: the client gave up long ago and you're doing work for nobody. Propagate a deadline through the call chain and give each hop what's actually left. This is what makes a system shed load coherently instead of every layer independently waiting.

**Connection reuse matters more than people expect.** A keep-alive agent (undici's default pool in modern Node) avoids a TCP and TLS handshake per request — often 50–100ms saved on a cross-region call. Size the pool, and remember DNS: a long-lived pool can pin to an IP that has been rotated away.

**Fail fast when the dependency is already down.** A circuit breaker trips after a failure threshold and rejects immediately for a cooling period, then probes with a trickle. Without one, a dead dependency consumes all your capacity in requests that were always going to fail. Pair it with a **bulkhead** — a bounded concurrency limit per dependency — so one slow upstream can't consume every worker.

**Degrade deliberately.** Decide per dependency whether a failure is fatal (payment authorisation) or degradable (recommendations, analytics). Fallbacks have their own trap: an untested fallback path is code that runs only during an incident, which is exactly when you don't want to discover a bug. Prefer omitting the feature over an elaborate alternative path.

Finally, propagate **trace context and a request ID** on every outbound call. Without it, a slow request is a mystery that stops at your service boundary.

## Why it matters

Most outages are someone else's outage arriving through an unbounded client call. "What timeout do you set, and where does the number come from?" is a compact senior question, and deadline propagation is the answer that shows systems thinking rather than a checklist.

## Key points

- `fetch` has no default timeout — an unbounded call is the most common way a service hangs.
- Derive timeouts from the upstream's observed p99, and keep the number in shared client config.
- Propagate a deadline so later hops inherit the remaining budget instead of restarting the clock.
- Reuse connections with a keep-alive pool; the handshake is a large share of cross-region latency.
- A circuit breaker stops you spending capacity on calls that are already failing.
- Bulkheads cap concurrency per dependency so one slow upstream can't consume every worker.
- Classify each dependency as fatal or degradable in advance, and keep fallbacks simple enough to trust.
- Forward trace context and request IDs, or debugging stops at your boundary.
