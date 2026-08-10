---
title: Rate Limits & Retries
summary: Provider limits are per-minute token budgets, not just request counts — and the retry strategy that works is the one that doesn't stampede.
level: core
minutes: 20
order: 7
tags: [llm, api, reliability, integration]

related:
  - ai/working-with-the-api/the-messages-api-shape
  - ai/working-with-the-api/batch-and-async-processing
  - ai/ai-product-thinking/designing-for-nondeterminism

resources:
  - title: Rate limits
    url: https://platform.claude.com/docs/en/api/rate-limits
    source: Anthropic
    type: docs
    minutes: 15
    primary: true
  - title: Errors
    url: https://platform.claude.com/docs/en/api/errors
    source: Anthropic
    type: docs
    minutes: 10
  - title: Timeouts, retries, and backoff with jitter
    url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
    source: Amazon Builders' Library
    type: article
    minutes: 25
---

## In one line

You are limited on requests per minute *and* input and output tokens per minute, so a handful of very large requests can rate-limit you while your request count looks healthy.

## What it is

Providers meter three things separately: requests per minute, input tokens per minute, and output tokens per minute — scoped to an organisation or workspace, and per model family. Newer models typically have their own bucket rather than sharing with the previous generation, so migrating traffic does not inherit the old headroom. Exceeding any of them returns 429 with a `retry-after` header and response headers describing your remaining quota, which are worth logging: they let you see how close you are running before you fall over.

The token dimension is the one that surprises people. A feature sending 100K-token prompts can exhaust a token-per-minute budget at a request rate that looks trivially low. That is also why prompt caching helps twice — cached reads are cheaper *and* usually count differently against the limit.

Retries: 429, 5xx, 529 overload, and connection errors are retryable. 400 (malformed request), 401/403 (auth), and 404 (bad model id) are not — retrying them is a tight loop against a bug. The official SDKs already retry the retryable set with exponential backoff, typically twice by default, which is the right starting point and something to check before hand-rolling one.

The rule that matters beyond the defaults is **jitter**. Exponential backoff alone synchronises clients — everyone who failed at t=0 retries at t=1, fails together, and retries at t=2 together. Randomising the delay is what breaks the convoy. And every retry policy needs a ceiling: a bounded attempt count, and a wall-clock deadline, because retry delay multiplies with request timeout and a "10 minute" timeout with two retries is a half-hour worst case.

At the architecture level, the answers to sustained pressure are a queue with controlled concurrency rather than firing everything at once, the batch API for anything not latency-sensitive, degrading to a smaller model on overload rather than failing, and — for user-facing surfaces — your own per-user rate limiting so one tenant cannot consume the organisation's whole budget. Streaming complicates it slightly: a mid-stream failure has already produced billable tokens, so a blind retry pays twice.

## Why it matters

This is standard backend reliability with one twist — the token dimension — and interviewers use it to check whether you treat a model provider as a flaky third-party dependency rather than a function call. The failure is also very visible in a product: a launch spike hits the token limit, naive retries amplify the load, and the outage lasts longer than the spike did.

## Key points

- Limits are enforced on requests per minute *and* input and output tokens per minute; large prompts exhaust token budgets long before request budgets.
- Limits are per model family and newer models usually get their own bucket — migrating traffic does not carry over headroom.
- Retry 429, 5xx, 529, and connection errors. Never retry 400, 401, 403, or 404; those are bugs, and a retry loop makes them worse.
- Honour `retry-after` when present, and add jitter to backoff — without it, failed clients synchronise and retry in a convoy.
- Bound every retry policy by attempt count *and* wall-clock deadline; timeout × attempts is the real worst case.
- Log the rate-limit response headers so you can see how close to the ceiling you run before you hit it.
- Queue and control concurrency rather than fanning out; use the batch API for anything without a human waiting.
- Degrade rather than fail — fall back to a smaller model, a cached answer, or a queued job — and rate-limit per user so one tenant cannot starve the rest.
- A retry after a mid-stream failure re-bills the tokens already generated; decide deliberately whether to resume or restart.
