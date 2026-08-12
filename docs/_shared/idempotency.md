---
title: Idempotency
summary: Making an operation safe to repeat, which is the only way a retry over an unreliable network can ever be correct.
level: core
minutes: 25
tags: [api, reliability, distributed-systems]

surfaced_in:
  - backend/api-design
  - backend/async-work
  - system-design/distributed-systems

related:
  - backend/api-design/conditional-requests-and-api-caching
  - backend/async-work/idempotent-consumers

resources:
  - title: Making retries safe with idempotent APIs
    url: https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
    source: AWS Builders' Library
    type: article
    minutes: 25
    primary: true
  - title: Idempotent requests
    url: https://docs.stripe.com/api/idempotent_requests
    source: Stripe
    type: docs
    minutes: 10
  - title: Implementing Stripe-like idempotency keys in Postgres
    url: https://brandur.org/idempotency-keys
    source: Brandur Leach
    type: article
    minutes: 30
---

## In one line

An operation is idempotent if doing it twice leaves the system in the same state as doing it once — and without that property, every retry is a gamble on whether the first attempt actually failed.

## What it is

The problem is that **a failed request and a lost response are indistinguishable to the caller**. A client sends `POST /charges`, the connection drops, and it has no way to know whether the charge happened. It can retry and risk charging twice, or not retry and risk not charging at all. Idempotency removes the dilemma: retry freely, because a duplicate is a no-op.

Some operations are naturally idempotent — `PUT` of a full representation, `DELETE`, setting a value. Others are not: creating a resource, incrementing a counter, sending an email, calling a model. For those, the standard mechanism is an **idempotency key**: the client generates a unique key per logical operation (not per attempt), sends it as a header, and the server stores the key with the result. First request executes and records; a repeat of the same key returns the stored response without re-executing.

Three details decide whether the implementation is real. **The key and the state change must be committed atomically** — same database transaction — or a crash between them recreates the double-execution you were preventing. **A concurrent second request must be blocked, not just checked**: two identical requests arriving together will both see "no key found" unless you take a unique constraint or a lock, so the key row is inserted first and the conflict is what tells you a duplicate is in flight (return `409` or wait). And **the key must be scoped to the request**: if the same key arrives with a different body, that is a client bug — reject it rather than silently returning the old result.

Keys expire, usually after 24 hours, which bounds the storage and means retries beyond that window are the client's problem again. On the receiving end of queues, the same idea appears as a processed-message table keyed by message ID.

## Why it matters

At-least-once delivery is the default everywhere — HTTP retries, queues, webhooks, job runners — so idempotency is the property that makes the rest of a distributed system safe rather than merely eventual. It is asked directly ("how do you stop a double charge?") and indirectly, in every design where a retry is proposed and nobody says what happens on the second attempt.

## Key points

- The caller cannot distinguish a failed write from a lost response, which is the entire reason idempotency exists.
- The idempotency key belongs to the logical operation and must be identical across retries and unique across operations.
- Store the key and the effect in one transaction, or a crash between them defeats the mechanism.
- Insert the key first and rely on a unique constraint — a check-then-act loses to two concurrent retries.
- Same key with a different payload is a client error, not a cache hit.
- Retrying a naturally idempotent operation (`PUT`, `DELETE`) needs no key at all; know which of yours are.
- The queue-side equivalent is a processed-message ledger keyed by message ID, committed with the work.
