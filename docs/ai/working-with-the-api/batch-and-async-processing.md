---
title: Batch & Async Processing
summary: Half price for work nobody is waiting on, and the job architecture that any long-running LLM task needs anyway.
level: deep
minutes: 15
order: 8
tags: [llm, api, cost, architecture]

related:
  - ai/working-with-the-api/rate-limits-and-retries
  - ai/working-with-the-api/token-accounting-and-cost
  - ai/observability-and-cost/unit-economics-of-an-llm-feature

resources:
  - title: Batch processing
    url: https://platform.claude.com/docs/en/build-with-claude/batch-processing
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Batch API
    url: https://platform.openai.com/docs/guides/batch
    source: OpenAI
    type: docs
    minutes: 15
  - title: Message Batches API reference
    url: https://platform.claude.com/docs/en/api/creating-message-batches
    source: Anthropic
    type: docs
    minutes: 10 # unverified
---

## In one line

Submit many independent requests as one batch, get results back within a day at roughly half the per-token price, and stop competing with your interactive traffic for rate limit.

## What it is

The batch endpoint takes an array of ordinary Messages API requests, each tagged with your own `custom_id`, and returns a batch id. You poll until processing ends, then stream the results. Most batches complete far inside the stated maximum — typically within an hour, guaranteed within twenty-four — and results stay retrievable for weeks. Every feature works inside a batch: tools, vision, caching, structured outputs. Streaming does not, because there is nothing to stream to.

Two rules to get right. Results come back in **arbitrary order**, so you key by `custom_id`; anything that pairs results by array position is a latent data-corruption bug. And each entry succeeds or fails independently — a validation error on one request does not fail the batch, so you handle per-item outcomes rather than one status.

The fit is anything with no human waiting: back-filling classifications or embeddings over an existing corpus, nightly enrichment or summarisation, generating an eval run across hundreds of cases, bulk translation, offline dataset labelling. The anti-fit is anything a user is staring at, or anything whose output feeds the next step within the same interaction.

The wider point is that batch is one instance of a pattern you need regardless: **long LLM work belongs in a job, not a request**. A serverless function has a response timeout well under the time a deep agent run can take, and a browser tab is not a reliable execution context. The durable shape is submit → persist a job record → process out of band → notify. That gives you retries without the user re-triggering, resumability across deploys, progress visible in the UI, and a place to put the cost accounting. Once a feature crosses roughly thirty seconds, this is the architecture whether or not you use the batch endpoint.

## Why it matters

The discount is the obvious reason, and on a bulk workload it is half the bill for a scheduling change. The less obvious reason is the interview one: when a system-design prompt involves processing a large corpus, the answer that separates candidates is recognising that it is a queue-and-jobs problem with an LLM in it, not a loop of API calls — including the parts about partial failure, idempotency, and progress reporting.

## Key points

- Roughly 50% off per token for asynchronous processing, with results typically inside an hour and a 24-hour ceiling.
- Results return in arbitrary order — always key by your `custom_id`, never by position.
- Each request in a batch succeeds or fails independently; handle per-item results rather than a single batch status.
- All features work in batch except streaming, since there is no interactive consumer.
- Batch traffic does not contend with your interactive traffic for the same rate-limit pressure, which is often as valuable as the discount.
- Any LLM work over ~30 seconds belongs in a durable job — submit, persist, process, notify — regardless of whether batch pricing applies.
- A job record gives you retries, resumability across deploys, progress UI, and a natural place to attribute cost.
- Design for partial failure: a 5,000-item batch will have failures, and re-running the whole thing is the expensive way to handle them.
