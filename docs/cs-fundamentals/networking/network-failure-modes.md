---
title: Network failure modes
summary: The network is not reliable, and the hardest failure is not an error — it is a request that neither succeeds nor returns.
level: core
minutes: 25
order: 8
tags: [networking, reliability, fundamentals]

related:
  - cs-fundamentals/networking/http-semantics-and-status-codes
  - cs-fundamentals/concurrency/backpressure-and-bounded-queues
  - cs-fundamentals/concurrency/race-conditions-and-atomicity

resources:
  - title: Timeouts, retries and backoff with jitter
    url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
    source: Amazon Builders' Library
    type: article
    minutes: 30
    primary: true
  - title: Fallacies of distributed computing
    url: https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing
    source: Wikipedia
    type: docs
    minutes: 15
  - title: Circuit Breaker
    url: https://martinfowler.com/bliki/CircuitBreaker.html
    source: Martin Fowler
    type: article
    minutes: 20
  - title: Exponential Backoff And Jitter
    url: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
    source: AWS Architecture Blog
    type: article
    minutes: 15
---

## In one line

Every network call has three outcomes rather than two — success, failure, and *unknown* — and designing for the third is what separates code that survives a bad afternoon from code that doesn't.

## What it is

The fallacies of distributed computing are the checklist: the network is reliable, latency is zero, bandwidth is infinite, the network is secure, topology doesn't change, there is one administrator, transport cost is zero, the network is homogeneous. Every one of them is assumed by default in code that hasn't been made to think about it.

The **unknown outcome** is the important one. A request times out. Did the server never receive it, receive and fail, or receive, succeed, and lose the response on the way back? You cannot tell. If the operation was a payment, retrying might charge twice and not retrying might charge zero. The only real answer is **idempotency**: give the operation a client-generated key so a duplicate is recognised and collapsed server-side. Then retries become safe and the ambiguity stops mattering.

**Timeouts** are mandatory, and the default in most clients is either none or far too long. A request without a timeout holds a connection, a thread or a slot in a pool, and eventually the pool exhausts and a slow dependency becomes a total outage. Set timeouts from the p99 of the dependency, not a round number, and make them shorter as you go deeper in the call chain so an inner call fails before the outer one gives up.

**Retries** need three things or they amplify the incident. Retry only idempotent or idempotency-keyed operations. Use exponential backoff *with jitter*, because synchronised retries from thousands of clients create the thundering herd that keeps a recovering service down. And cap total attempts — plus a budget, so retries can never exceed a small fraction of traffic. Distinguish retryable failures (timeout, connection reset, 502/503/504, 429 with `Retry-After`) from ones where retrying is pointless (400, 401, 404, 422).

**Circuit breakers** stop the bleeding: after a threshold of failures, fail fast without calling the dependency at all, then let a trickle of requests probe for recovery. This is what stops a slow downstream from consuming every connection upstream. Alongside it, **bulkheads** (separate connection pools per dependency), **hedged requests** for tail latency, and **graceful degradation** — serve cached or partial data rather than an error — are the standard toolkit.

Client-side, the browser adds its own: offline, flaky mobile connections, captive portals returning HTML for your API, and requests cancelled by navigation. Handle offline explicitly, and never assume a non-2xx response body is JSON.

## Why it matters

Retry storms and missing timeouts are among the most common causes of cascading outages, and both are cheap to prevent and expensive to diagnose. In interviews the question is usually "what happens if that service is down or slow" — the expected answer is timeout, bounded retry with jitter, circuit break, degrade, and it applies equally to a fetch wrapper in a React app and a service call in a system design.

## Key points

- Every remote call has three outcomes, and the unknown one — timed out, result unclear — is the one that needs design.
- Idempotency keys make the unknown outcome safe by making retries harmless, which is stronger than trying to avoid retries.
- A request without a timeout eventually exhausts a connection pool and turns a slow dependency into a full outage.
- Timeouts should tighten as you go deeper in the call chain, so inner calls fail before the outer request gives up.
- Retry only what is safe to repeat, with exponential backoff and jitter, a capped attempt count, and a global retry budget.
- Synchronised retries without jitter cause a thundering herd that prevents a recovering service from recovering.
- Circuit breakers fail fast during an outage and protect the caller's own resources, not just the failing dependency.
- Degrading to cached, partial, or read-only behaviour is usually a better user outcome than an error page.
