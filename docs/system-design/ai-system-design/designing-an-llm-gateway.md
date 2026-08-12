---
title: Designing an LLM Gateway
summary: One service between your product and the model providers — auth, routing, quotas, caching, retries and observability in a single place.
level: core
minutes: 25
order: 1
tags: [ai, architecture, gateway]

related:
  - system-design/building-blocks/reverse-proxies-and-api-gateways
  - ai/observability-and-cost/unit-economics-of-an-llm-feature
  - system-design/ai-system-design/multi-tenant-quotas-and-cost-control
  - system-design/ai-system-design/inference-serving-and-capacity

resources:
  - title: Rate Limits
    url: https://platform.claude.com/docs/en/api/rate-limits
    source: Anthropic
    type: docs
    minutes: 15
  - title: Prompt Caching
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
    source: Anthropic
    type: docs
    minutes: 25
    primary: true
  - title: Building Effective Agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 30
---

## In one line

An LLM gateway is the API gateway pattern applied to model providers: every model call in the company goes through one service that owns keys, routing, quotas, caching, retries and telemetry.

## What it is

**Why it exists.** Without it, every team calls the provider SDK directly. Nobody knows total spend, one team's traffic exhausts the org's rate limit and breaks another's, provider keys are scattered across services, switching models means a deploy in six repos, and there's no single place to see what was sent to a model or what came back. That list is the design justification, and it's the answer to "why not just call the API?"

**What it owns.**

- **Credentials.** One place holds provider keys; services authenticate to the gateway with their own identity. Key rotation stops being a company-wide migration.
- **Routing.** Requests name a *capability* ("summarise", "code-review") or a logical model, and the gateway maps it to a concrete model. That indirection is what lets you move from Sonnet to Opus, or to a cheaper model for a subset of traffic, without touching callers.
- **Quotas and rate limiting.** Per tenant and per feature, in **tokens** rather than requests — a request can be a hundred tokens or a hundred thousand, so request-per-minute limits are close to meaningless here.
- **Caching.** Provider-side prompt caching is configured here (cache reads cost roughly a tenth of input tokens, writes ~1.25× for the short TTL), plus an optional exact-match response cache for repeated identical prompts.
- **Retries and fallback.** Retry the retryable errors with backoff and jitter, respect `Retry-After` on 429s, and fail over to a second model or provider when one is degraded — a circuit breaker per provider.
- **Observability.** One place that records tokens in and out, latency (including time to first token), cost, model version, cache hit rate, and errors — attributed per tenant and per feature.
- **Safety hooks.** Input and output checks, PII redaction, and prompt-injection defenses applied consistently rather than per team.

**What it must not own.** Prompts and business logic. If the gateway starts holding each feature's prompt templates, it becomes a distributed monolith and every prompt change blocks on the gateway team. Templates and versions belong with the feature; the gateway takes a rendered request.

**Streaming is the constraint that shapes the implementation.** Most calls stream, so the gateway proxies SSE rather than buffering — which means it must handle client disconnects (and cancel upstream, or you pay for tokens nobody reads), count tokens as they pass, and still enforce timeouts on a response that legitimately takes minutes.

## Why it matters

This is the single most likely AI system design prompt at a company that ships model-backed features, because it's the thing they actually built. It also demonstrates that you know the operational realities — shared rate limits, per-tenant cost attribution, provider outages, streaming — rather than just the API surface.

## Key points

- Centralise credentials, routing, quotas, caching, retries and telemetry; keep prompts and business logic out.
- Route on a logical capability so the concrete model can change without touching callers.
- Rate limit and quota on tokens, not requests — request counts don't reflect cost or load.
- Configure prompt caching at the gateway: reads are ~10% of input cost, writes a modest premium.
- Retry with backoff and jitter, honour `Retry-After`, and circuit-break a degraded provider to a fallback model.
- Proxy streaming rather than buffering, and cancel upstream when the client disconnects.
- Record tokens, latency, time-to-first-token, cost, model version and cache hit rate per tenant and per feature.
- The gateway is on the path of every AI request — it needs the redundancy and monitoring of any critical edge service.
