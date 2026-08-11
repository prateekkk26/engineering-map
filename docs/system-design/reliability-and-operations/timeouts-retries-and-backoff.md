---
title: Timeouts, Retries & Backoff
summary: The three settings that decide whether a dependency's bad minute is invisible or takes your service down with it.
level: core
minutes: 20
order: 3
tags: [reliability, resilience, networking]

related:
  - system-design/distributed-systems/idempotency-and-delivery-semantics
  - system-design/reliability-and-operations/circuit-breakers-and-bulkheads
  - ai/working-with-the-api/rate-limits-and-retries

resources:
  - title: Timeouts, Retries and Backoff with Jitter
    url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
    source: AWS Builders' Library
    type: article
    minutes: 30
    primary: true
  - title: Exponential Backoff and Jitter
    url: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
    source: AWS
    type: article
    minutes: 15
  - title: Good Retry, Bad Retry
    url: https://medium.com/yandex/good-retry-bad-retry-an-incident-story-648072d3cee6
    source: Yandex
    type: article
    minutes: 25 # unverified
---

## In one line

Every remote call needs a timeout, most retries need exponential backoff with jitter, and retrying without a budget turns a slow dependency into an outage.

## What it is

**Timeouts.** A call without one waits forever, holding a connection, a thread and memory; enough of those and your service is down because someone else was slow. Set them from the dependency's measured p99 plus headroom, not from a round number. Timeouts must also be *nested* correctly: if the client gives up after 3 seconds, the server spending 10 seconds on the work is pure waste. Propagate a deadline down the call chain and have each hop check whether there's time left before starting work.

**Retries.** Only retry what's safe: idempotent operations, or non-idempotent ones protected by an idempotency key. Only retry what might succeed — a 500 or a timeout, yes; a 400 or a 403, never, that's a bug you're hiding. And retry a small number of times, three or so; a request that fails four times is not going to succeed on the fifth, and each attempt costs the struggling dependency more.

**Backoff and jitter.** Fixed-interval retries from many clients synchronise into waves that hit the recovering service exactly when it's trying to come back — the thundering herd. Exponential backoff spreads them out; **jitter** (randomising the delay) is what actually breaks the synchronisation, and it's the part most often left out. Full jitter — a random delay between zero and the current backoff ceiling — is the recommended default.

**Retry amplification is the killer.** If each of three layers retries three times, one user request becomes 27 calls to the bottom service, precisely when it's already failing. Retry at **one** layer, ideally the one closest to the user's intent, and pass failures through elsewhere. This is the mistake that turns degradations into outages, and it's a great thing to raise unprompted.

**Retry budgets and circuit breakers.** Cap retries as a fraction of overall traffic (say 10%) so retries can never dominate. When failures are sustained, stop retrying altogether — that's the circuit breaker's job.

**Client behaviour matters too.** Honour `Retry-After` when the server sends it, and treat a 429 as an instruction rather than a transient error.

## Why it matters

These three settings, misconfigured, are behind a large share of real outages: no timeout so threads exhaust, no jitter so the herd stampedes, and retries at every layer multiplying load. In a design round, "I'd retry with exponential backoff and jitter, at one layer only, and only for idempotent operations" is a single sentence that demonstrates a lot of operational experience.

## Key points

- Every remote call gets a timeout derived from the dependency's p99, not from a round number.
- Propagate deadlines so no hop starts work the caller has already given up waiting for.
- Retry only idempotent operations, and only on failures that might resolve — never on 4xx.
- Cap attempts at around three; further attempts mostly add load to something already struggling.
- Exponential backoff without jitter still synchronises clients into a thundering herd.
- Retries at multiple layers multiply — three layers of three attempts is 27 calls. Retry at one layer.
- Use a retry budget so retries stay a small fraction of total traffic.
- Honour `Retry-After` and treat 429 as an instruction, not a transient blip.
