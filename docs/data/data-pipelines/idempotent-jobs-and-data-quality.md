---
title: Idempotent Jobs & Data Quality
summary: Any job that can be retried will be, so design for re-running the same input twice — and check the output, because pipelines fail silently.
level: core
minutes: 20
order: 4
tags: [data, pipelines, reliability, correctness]

related:
  - data/scaling-data/outbox-and-dual-write-consistency
  - data/data-pipelines/batch-vs-streaming
  - data/vector-data/keeping-embeddings-in-sync

resources:
  - title: Idempotent Requests
    url: https://docs.stripe.com/api/idempotent_requests?lang=curl
    source: Stripe
    type: docs
    minutes: 15
  - title: Data Quality Testing
    url: https://docs.getdbt.com/docs/build/data-tests
    source: dbt Labs
    type: docs
    minutes: 20
  - title: Designing Data-Intensive Applications — Ch. 11, Fault Tolerance
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
---

## In one line

An idempotent job produces the same end state whether it runs once or five times, which is the only property that makes automatic retries safe.

## What it is

Jobs get retried — by the queue after a timeout, by an operator after a partial failure, by a redeploy that restarts a worker mid-run. If a rerun double-counts, sends a second email, or charges twice, retries become dangerous and every failure needs a human. Making the job idempotent turns recovery into "run it again", which is the difference between a 3am page and a scheduled retry.

**The mechanisms.** *Upsert instead of insert* — `ON CONFLICT DO UPDATE` keyed on something stable derived from the input. *Deterministic keys* — a natural key or a hash of the input, so the same input maps to the same row rather than a new one; a random uuid per attempt guarantees duplicates. *Idempotency keys* for external calls — pass the same key to the payment or email provider so their side deduplicates. *Delete-then-insert per partition* — for a batch that recomputes a day's aggregates, replacing the partition is idempotent while incrementing is not. *Checkpoints* — record progress so a resumed run skips completed work, and make the checkpoint update part of the same transaction as the work.

**State to avoid**: `count = count + 1` in a retryable job, appending to a file, and any side effect that isn't keyed. Note that "at-least-once delivery plus an idempotent consumer" is how exactly-once is actually achieved in practice — there is no other way.

**Data quality is the other half**, because a pipeline that runs successfully and produces wrong output reports nothing. The checks that pay for themselves: row counts within an expected range (a table that suddenly has zero rows or ten times as many is broken), uniqueness on keys, no unexpected nulls, referential integrity across models, freshness (the newest row is not older than X), and distribution drift on important columns. dbt tests, Great Expectations or hand-written assertions all work; the choice matters less than **failing loudly and stopping** rather than publishing the bad table.

Two framing points: **a job that never fails visibly is not necessarily correct**, and the worst pipeline outcome is silent partial success — half the rows loaded, no error, a dashboard that is quietly wrong for a month.

## Why it matters

Any background work — embeddings, emails, exports, aggregations, webhooks — hits this, and "what happens if this runs twice?" is a standard code-review and interview question. In AI products it is sharper still: re-running an embedding job without idempotency duplicates chunks, and duplicated chunks degrade retrieval quality in a way that is hard to trace.

## Key points

- Retries are inevitable, so idempotency is a design requirement rather than a nice-to-have.
- Derive keys deterministically from the input; a fresh random id per attempt guarantees duplicates on retry.
- Upserts, partition replacement and transactional checkpoints are the three practical idempotency mechanisms.
- Idempotency keys push deduplication onto external providers for payments, emails and webhooks.
- Exactly-once in practice is at-least-once delivery plus an idempotent consumer — nothing else achieves it.
- Pipelines fail silently, so assert row counts, uniqueness, nulls, freshness and distributions on the output.
- A failed check must stop publication; producing a wrong table quietly is worse than producing nothing.
