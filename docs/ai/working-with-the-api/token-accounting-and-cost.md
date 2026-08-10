---
title: Token Accounting & Cost
summary: Turning the usage object into a cost per request, a cost per user, and an answer to "why did the bill triple?"
level: core
minutes: 20
order: 6
tags: [llm, api, cost, observability]

related:
  - ai/working-with-the-api/prompt-caching
  - ai/observability-and-cost/unit-economics-of-an-llm-feature
  - ai/llm-foundations/tokens-and-context-windows

resources:
  - title: Token counting
    url: https://platform.claude.com/docs/en/build-with-claude/token-counting
    source: Anthropic
    type: docs
    minutes: 15
    primary: true
  - title: Pricing
    url: https://platform.claude.com/docs/en/pricing
    source: Anthropic
    type: docs
    minutes: 10
  - title: Batch processing
    url: https://platform.claude.com/docs/en/build-with-claude/batch-processing
    source: Anthropic
    type: docs
    minutes: 15
---

## In one line

Every response carries a `usage` object with four token counts at four different prices, and multiplying them out per request is the whole of LLM cost engineering.

## What it is

The four counts: **input tokens** processed at full price, **cache creation tokens** at roughly 1.25× input, **cache read tokens** at roughly 0.1× input, and **output tokens** at typically five times the input rate. Reasoning tokens are output tokens. Total prompt size is the sum of the three input-side numbers, which is why an agent that has been running for an hour can report a small `input_tokens` while having processed a very large prompt — the rest was cache reads.

Cost per request is therefore a four-term sum, not tokens × one price, and the shape of your workload decides which term dominates. A summarisation feature is input-heavy: caching and retrieval discipline are the levers. A code-generation feature is output-heavy: model choice and response length are the levers. A chat feature is quadratic in turn count unless the prefix is cached, because the whole transcript is re-sent every turn.

Estimating ahead of the call is a separate tool: every provider exposes a token-counting endpoint, and it is the only accurate way to size a prompt before sending it. Character heuristics and other vendors' tokenisers are wrong by 15–30% on prose and worse on code, and token counts do not transfer between models, so a cost model built on one model's counts needs re-baselining after a switch.

What to actually instrument, from the first day the feature exists: log `usage` on every call, tagged with the feature, the model, and the user or tenant. That single decision is what lets you answer "which feature is the bill" and "which customers cost more than they pay" without a forensics project. Add derived metrics — cache hit rate, tokens per request, cost per successful task — and set alerts on the ratios rather than absolute totals, since traffic growth and a regression look identical on a raw cost graph.

The levers, in rough order of payoff: prompt caching, routing cheap steps to cheap models, cutting retrieved context to what is actually used, capping output length, the batch API's discount for anything not latency-sensitive, and semantic caching of repeat requests.

## Why it matters

Cost is a first-class design constraint for AI products in a way it is not for CRUD, and "what does this cost per user, and how would you halve it?" is a genuine interview question at companies whose margins depend on the answer. It is also the most common production surprise: a feature that was fine in beta becomes the largest line item when a long-conversation pattern meets an uncached prefix.

## Key points

- Four token classes at four prices — input, cache write (~1.25×), cache read (~0.1×), output (~5× input). Reasoning tokens bill as output.
- Total prompt size is input + cache creation + cache read; a small `input_tokens` on a long session means the cache is working, not that the prompt is small.
- Multi-turn conversations are quadratic in total tokens because the API is stateless; caching the prefix is what flattens that curve.
- Count tokens with the provider's endpoint before sending; heuristics and foreign tokenisers are unreliable, and counts do not transfer across models.
- Log `usage` per request tagged by feature, model, and tenant from day one — retrofitting attribution during a cost incident is painful.
- Alert on ratios (cost per task, tokens per request, cache hit rate), not on total spend, so growth and regression are distinguishable.
- Biggest levers in order: caching, model routing, trimming context, capping output, batch pricing for non-interactive work.
- Cost per *successful* task is the honest metric — a cheap model that needs three retries is not cheap.
