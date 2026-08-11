---
title: Inference Serving & Capacity
summary: Why LLM capacity behaves unlike any other service — token-rate limits, batching, and the queueing you need when demand exceeds throughput.
level: core
minutes: 25
order: 2
tags: [ai, capacity, performance]

related:
  - ai/working-with-the-api/rate-limits-and-retries
  - ai/working-with-the-api/batch-and-async-processing
  - system-design/reliability-and-operations/capacity-planning-and-autoscaling

resources:
  - title: Rate Limits
    url: https://platform.claude.com/docs/en/api/rate-limits
    source: Anthropic
    type: docs
    minutes: 15
    primary: true
  - title: Batch Processing
    url: https://platform.claude.com/docs/en/build-with-claude/batch-processing
    source: Anthropic
    type: docs
    minutes: 20
  - title: Efficient Memory Management for LLM Serving with PagedAttention
    url: https://arxiv.org/abs/2309.06180
    source: vLLM / UC Berkeley
    type: article
    minutes: 45
---

## In one line

LLM capacity is measured in tokens per minute, not requests per second, and the two halves of a request — prefill and decode — have completely different cost profiles.

## What it is

**The limits you're actually working against.** With a hosted provider you have requests per minute, **input tokens per minute** and **output tokens per minute**, per organisation. That's a shared bucket: one team's batch job can starve the interactive product. The gateway's job is to divide it deliberately rather than let it be consumed first-come-first-served.

**Prefill versus decode.** Processing the prompt (prefill) is parallel across tokens and compute-bound — a 50,000-token prompt is processed fast relative to its size. Generating the response (decode) is sequential, one token at a time, and memory-bandwidth-bound. Consequences that show up in design: **output tokens cost several times input tokens** (for current Claude models, five times), long outputs dominate latency, and shortening the prompt helps cost more than latency while shortening the output helps both.

**Latency has two numbers, not one.** *Time to first token* is what the user perceives as responsiveness and is driven mostly by prompt length and queueing. *Tokens per second* thereafter determines how long the full answer takes. A design that streams gets to optimise TTFT and let the rest arrive progressively — which is why streaming is a capacity decision as much as a UX one.

**Caching changes the arithmetic.** Prompt caching lets a stable prefix — system prompt, tool definitions, retrieved context — be reused across requests at roughly a tenth of the input cost and with materially lower TTFT. It's prefix-matched, so anything volatile (timestamps, user IDs) must go *after* the cached portion or the cache never hits. Getting that ordering right is one of the highest-leverage things in an LLM system's cost profile.

**Batching for throughput.** Work with no user waiting on it — nightly classification, embedding backfills, evals, bulk summarisation — goes to the batch API: roughly half the price, results within hours rather than seconds, and it doesn't consume the interactive rate limit. Separating interactive from batch traffic is the same bulkhead argument as any other workload class.

**When demand exceeds throughput.** You can't autoscale a provider's rate limit. So: queue with a priority scheme, shed low-priority work, degrade to a smaller model, or return an honest "try again shortly". Decide which, per feature, in advance — a design that just assumes capacity is available isn't finished.

**Self-hosting** (vLLM and similar) replaces token limits with GPU capacity, continuous batching and KV-cache memory as the constraint. Worth knowing by name; for most product teams the hosted API is the right answer and saying so is the senior move.

## Why it matters

"What happens when you hit the rate limit?" and "how do you keep the batch job from breaking the chat feature?" are standard follow-ups, and they have no analogue in ordinary service design — you can't add servers. Understanding prefill versus decode also explains most of the cost and latency behaviour of a real LLM feature, which is what makes the optimisation conversation concrete.

## Key points

- Capacity is tokens per minute — input and output metered separately — and shared across the whole organisation.
- Prefill is parallel and compute-bound; decode is sequential, which is why output tokens cost several times input.
- Track time-to-first-token and tokens-per-second separately; they have different causes and different fixes.
- Prompt caching cuts repeated-prefix cost to roughly a tenth and improves TTFT — keep volatile content after the cached prefix.
- Send anything non-interactive to the batch API: about half price, and off the interactive rate limit.
- Isolate workload classes so bulk jobs can't starve user-facing traffic.
- You cannot autoscale a provider limit — plan queueing, shedding, model downgrade, or an honest error.
- Self-hosting trades token limits for GPU capacity, continuous batching and KV-cache pressure.
