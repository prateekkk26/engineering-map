---
title: Design a Payment Ledger
summary: Money, where "eventually consistent" isn't an option — double-entry records, idempotent charges, and reconciling against a provider you don't control.
level: core
minutes: 25
order: 8
tags: [system-design, classic-problem, correctness]

related:
  - system-design/distributed-systems/idempotency-and-delivery-semantics
  - system-design/distributed-systems/distributed-transactions-and-sagas
  - data/transactions-and-consistency/acid-and-what-each-letter-buys

resources:
  - title: Idempotent Requests
    url: https://docs.stripe.com/api/idempotent_requests
    source: Stripe
    type: docs
    minutes: 10
  - title: Designing Financial Systems — Immutable Double-Entry Accounting
    url: https://www.moderntreasury.com/journal/accounting-for-developers-part-i
    source: Modern Treasury
    type: article
    minutes: 30
    primary: true
  - title: Best Practices for Handling Webhooks
    url: https://docs.stripe.com/webhooks
    source: Stripe
    type: docs
    minutes: 20
---

## In one line

Record money as immutable double-entry journal lines that always sum to zero, never as a mutable balance column, and make every external call idempotent because you will retry it.

## What it is

**Scope.** Charge a customer, record it, handle refunds and chargebacks, expose balances and statements, reconcile with the payment provider. The non-functional requirement dominates: correctness over availability. Losing a payment record is unacceptable in a way that losing a like is not — say that in scoping, because it justifies every subsequent choice.

**Double-entry, which is the core of the answer.** Every financial event writes two or more **immutable** journal lines that sum to zero: a €50 charge debits the customer's receivable and credits revenue. Balances are derived by summing lines (with periodic snapshots so you're not summing all history on every read), never stored as an updatable number. Three consequences: you get a complete audit trail for free, an imbalance is detectable by a sum-to-zero check across the whole ledger, and you can never lose the reason a balance changed. **Nothing is ever updated or deleted** — a correction is a new reversing entry. This is the single most important thing to say in this round.

**Money representation.** Integer minor units (cents), never floats. Currency stored per amount, no implicit conversion, and FX rates recorded on the transaction that used them.

**Idempotency everywhere.** A client-supplied idempotency key on the charge request, persisted in the same transaction as the journal lines, with the response stored and replayed on retry. Without it, a timeout plus a retry double-charges someone — the failure this whole topic exists to prevent.

**The state machine.** A payment is `pending → authorized → captured → settled`, with `failed` and `refunded` branches. Model it explicitly with allowed transitions enforced in the database; an invalid transition should be impossible, not merely unlikely.

**Talking to the provider.** The external call can't join your transaction, so: persist intent first (`pending`, with your idempotency key), then call the provider, then record the outcome. If you crash between, a reconciliation job finds `pending` rows older than N minutes and asks the provider what actually happened — never assume failure and never assume success. Webhooks arrive out of order, duplicated, and sometimes not at all: make handlers idempotent, verify the signature, key on the provider's event ID, and treat webhooks as an optimisation over polling rather than a source of truth.

**Reconciliation.** A daily job compares your ledger against the provider's settlement report and flags discrepancies for a human. This is not optional and interviewers notice its absence — external systems drift, and the only question is whether you find out from a job or from a customer.

**Consistency.** This all belongs in one relational database with real transactions. If the design forces money across service boundaries, use a saga with compensating entries (a refund, not a deletion) — and consider whether that boundary should exist at all.

## Why it matters

It's the problem where sloppy consistency answers are immediately disqualifying, and where the correct architecture — immutable append-only records, derived balances, idempotency keys, reconciliation — is specific and learnable. It also transfers directly: usage metering and token billing in an AI product are the same ledger with different units.

## Key points

- Immutable double-entry journal lines summing to zero; balances are derived, never stored as mutable columns.
- Corrections are reversing entries — nothing in a ledger is ever updated or deleted.
- Store money as integer minor units with an explicit currency; never floats.
- Persist the idempotency key in the same transaction as the journal lines, and replay the stored response.
- Model payment state transitions explicitly and enforce the legal ones in the database.
- Write intent before calling the provider, then reconcile stuck `pending` rows by asking what happened.
- Webhooks are duplicated, out of order and occasionally missing — verify signatures, dedupe on event ID, and poll as backup.
- A daily reconciliation job against the provider's report is mandatory, with a human path for discrepancies.
- Keep money in one database with real transactions; cross-service money needs sagas and compensating entries.
