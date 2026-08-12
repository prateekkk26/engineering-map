---
title: Retries, Backoff & Dead Letters
summary: Retrying only what's worth retrying, spreading the attempts so you don't amplify an outage, and giving permanent failures somewhere to go.
level: core
minutes: 25
order: 3
tags: [async, reliability, retries]

related:
  - system-design/reliability-and-operations/timeouts-retries-and-backoff
  - _shared/idempotency
  - backend/services-in-production/calling-other-services

resources:
  - title: Timeouts, retries and backoff with jitter
    url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
    source: AWS Builders' Library
    type: article
    minutes: 25
    primary: true
  - title: Exponential Backoff And Jitter
    url: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
    source: AWS
    type: article
    minutes: 15
  - title: Dead-letter queues
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html
    source: AWS
    type: docs
    minutes: 15
---

## In one line

Retry transient failures with exponential backoff and jitter, never retry deterministic ones, and cap the attempts so a permanently broken job ends up in a dead-letter queue instead of a loop.

## What it is

**Classify first.** A `503`, a connection reset, a lock timeout, a `429` — transient, retry. A validation error, a `404`, a `403`, a malformed payload — deterministic, and retrying is pure waste: the tenth attempt fails exactly like the first. Getting this wrong is common because both arrive as exceptions; the fix is typed errors carrying a `retryable` flag rather than a `catch` that retries everything.

**Backoff with full jitter.** Fixed-interval retries synchronise: a thousand jobs failing during a 30-second outage all retry at second 30 and knock the recovering service straight back over. Exponential backoff (1s, 2s, 4s, 8s…) spreads them, and jitter — sleeping a random duration between zero and the computed delay — is what actually breaks the synchronisation. Full jitter is the version to remember, and it measurably beats both no jitter and half-hearted variants.

**Bound the total.** Attempts cap, and a deadline: after N tries or T minutes, the message goes to a **dead-letter queue**. A DLQ is not a graveyard — it is a work queue for humans, and it needs an alert on depth, the original message with its failure history, and a replay path once the bug is fixed. A DLQ nobody looks at is silent data loss with extra steps.

Two amplification traps. **Retries at multiple layers multiply**: three at the HTTP client, three at the queue, three at the caller equals twenty-seven requests to a service that is already struggling. Pick one layer to own retries — usually the outermost with the most context — and make the others fail fast. And retries **make an overload worse**, which is what circuit breakers and token-bucket retry budgets exist for: stop retrying once the failure rate says the dependency is down, rather than contributing to the pile.

Finally, retries are only safe on operations that are idempotent. If the job charges a card or sends an email, the retry needs an idempotency key or a dedupe ledger, or "at least once" becomes "twice, to a customer".

## Why it matters

Retry storms are one of the most common ways a partial outage becomes a total one, so "what does your retry policy look like?" is a real reliability question with a specific right answer. It is also the first thing a reviewer looks for in a take-home that calls an external API — a bare `fetch` with no timeout and no retry, or a retry loop with no backoff, both read as inexperience.

## Key points

- Only transient failures are worth retrying; deterministic errors need typed classification, not a blanket `catch`.
- Exponential backoff without jitter re-synchronises clients into a thundering herd at recovery.
- Full jitter — a random delay between zero and the backoff window — is the version that actually spreads load.
- Cap attempts *and* elapsed time, then dead-letter; unbounded retries hide bugs and burn capacity.
- A DLQ needs an alert, the failure history, and a replay path, or it is just deferred data loss.
- Retries at several layers multiply — choose one owner and make the inner layers fail fast.
- Retrying anything non-idempotent without a key turns at-least-once delivery into duplicate side effects.
