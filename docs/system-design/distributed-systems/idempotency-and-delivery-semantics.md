---
title: Idempotency & Delivery Semantics
summary: Why exactly-once is a marketing term, and how idempotency keys turn at-least-once delivery into a system that doesn't double-charge anyone.
level: core
minutes: 25
order: 6
tags: [distributed-systems, reliability, api]

related:
  - system-design/building-blocks/message-queues-and-brokers
  - system-design/classic-problems/design-a-payment-ledger
  - data/scaling-data/outbox-and-dual-write-consistency

resources:
  - title: Idempotent Requests
    url: https://docs.stripe.com/api/idempotent_requests
    source: Stripe
    type: docs
    minutes: 10
    primary: true
  - title: Making Retries Safe with Idempotent APIs
    url: https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
    source: AWS Builders' Library
    type: article
    minutes: 25
  - title: Delivery Guarantees
    url: https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/
    source: Confluent
    type: article
    minutes: 30
---

## In one line

Networks make you choose between losing messages and duplicating them, and since nobody accepts loss, every consumer must be safe to run twice.

## What it is

**The three semantics.** *At-most-once* — send and don't retry; fast, loses messages on failure. *At-least-once* — retry until acknowledged; nothing is lost, duplicates are guaranteed to occur. *Exactly-once* — what everyone wants and what no system delivers end to end, because the acknowledgement itself can be lost and the sender genuinely cannot distinguish "the request failed" from "the response failed." What's marketed as exactly-once is at-least-once plus deduplication, which is a fine thing to build — just describe it accurately.

**Idempotency is the answer.** An operation is idempotent if applying it twice has the same effect as applying it once. Some operations are naturally idempotent: `PUT` with a full representation, `DELETE`, `SET x = 5`. Some are not: `POST /charges`, `balance = balance + 10`, appending to a list.

**The idempotency key pattern**, which is the concrete thing to describe:

1. The client generates a unique key per logical operation (a UUID) and sends it as a header.
2. The server tries to insert that key into a table with a unique constraint, inside the same transaction as the work.
3. If the insert succeeds, do the work and store the response against the key.
4. If it conflicts, the operation already happened — return the stored response.

The important part is that the key record and the effect commit **in the same transaction**. Checking a cache first and then doing the work is a race: two concurrent retries both see no key and both charge the customer. Keys need a retention window (Stripe uses 24 hours) and should be scoped per API key or account.

**Deduplication at the consumer.** Same idea for message consumers: a processed-messages table keyed on message ID, written transactionally with the effect. Where the effect is in another system that can't share a transaction, use the **outbox pattern** — write the business change and an outbox row atomically, and have a separate process publish from the outbox. This is the standard fix for the dual-write problem and worth naming.

**Retries make it necessary, not optional.** Any retry, at any layer — client, load balancer, queue, gateway — can duplicate the request. Design as though duplicates are certain, because at volume they are.

## Why it matters

This is the single most reusable idea in distributed systems for product engineers: it's the answer to "what if the payment request times out," "what if the webhook is delivered twice," and "what if the consumer crashes after writing but before acknowledging." Every design with money, messages or external side effects needs it, and interviewers ask about it constantly because it separates people who've handled a real retry bug from people who haven't.

## Key points

- Exactly-once delivery doesn't exist end to end; the honest version is at-least-once plus deduplication.
- The sender can't distinguish a failed request from a lost response, which is why retries duplicate.
- `PUT`, `DELETE` and absolute assignments are naturally idempotent; `POST` and increments are not.
- Idempotency keys must be persisted in the same transaction as the effect, or concurrent retries both execute.
- Store and replay the original response so a retry returns the same result, not a conflict error.
- Consumers deduplicate the same way, with a processed-message record written transactionally.
- The outbox pattern covers the case where the effect lands in a system that can't share your transaction.
- Assume duplicates are certain — some layer above you is retrying whether you asked it to or not.
