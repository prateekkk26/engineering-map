---
title: Multi-Tenant Quotas & Cost Control
summary: Metering tokens per tenant, enforcing limits before the spend happens, and designing a feature whose unit cost scales with usage.
level: core
minutes: 25
order: 9
tags: [ai, cost, multi-tenancy]

related:
  - ai/observability-and-cost/unit-economics-of-an-llm-feature
  - system-design/scalability/rate-limiting-and-backpressure
  - system-design/classic-problems/design-a-payment-ledger

resources:
  - title: Pricing
    url: https://platform.claude.com/docs/en/about-claude/pricing
    source: Anthropic
    type: docs
    minutes: 10
  - title: Prompt Caching
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
    source: Anthropic
    type: docs
    minutes: 25
    primary: true
  - title: The Cost of Cloud, a Trillion Dollar Paradox
    url: https://a16z.com/the-cost-of-cloud-a-trillion-dollar-paradox/
    source: Andreessen Horowitz
    type: article
    minutes: 25
---

## In one line

In an AI product the marginal cost of a request is real money, so you need per-tenant metering, limits enforced before the spend, and a design where the expensive path is the exception.

## What it is

**The shape of the problem.** Traditional SaaS marginal cost per request rounds to zero. LLM features don't: output tokens are priced several times input tokens, and a single power user can generate orders of magnitude more spend than the median. Gross margin becomes an engineering property, and "how much does this feature cost per user per month?" is a design input on the same footing as latency.

**Metering.** Record per request: tenant, user, feature, model, input tokens, cached-read tokens, output tokens, and computed cost. Cached reads are billed at a fraction of normal input and must be counted separately or your numbers are wrong. Streaming complicates it — the final usage figures arrive at the end of the stream, and a cancelled request still incurs cost for what was generated, so meter on completion *and* on cancellation. Aggregate asynchronously via an event stream rather than writing a row synchronously on the request path.

**Enforcement, before the spend.** Check the tenant's remaining budget *before* calling the model, using an estimate (prompt token count plus `max_tokens` as the worst case), then reconcile with actual usage after. Post-hoc-only checking means the overspend has already happened. Limits worth having: tokens per minute (burst protection), tokens per day or month (budget), and concurrent requests (one tenant can't monopolise capacity).

**What happens at the limit is a product decision.** Hard block, degrade to a cheaper model, queue for later, or allow overage and bill it. Say which, and say it differs by plan tier — that's the answer that shows you've thought about the business, not just the mechanism.

**The cost levers, in order of impact.**

*Prompt caching.* A stable prefix — system prompt, tool definitions, few-shot examples, retrieved documents — read at roughly a tenth of input cost. Often the largest single saving available, and it's a prompt-ordering change rather than an architecture change.

*Model routing.* Send the easy majority to a smaller, cheaper model and escalate only what needs the frontier one. The spread is wide — roughly 5× between the current Haiku and Opus tiers on both input and output — so routing is worth real effort. Route on a measurable signal and validate with evals.

*Bound the output.* Output tokens dominate; `max_tokens` and prompt instructions that ask for concision both cut cost directly.

*Batch anything asynchronous.* Roughly half price, and it stays off the interactive rate limit.

*Cache full responses* for genuinely repeated identical requests, and de-duplicate work across users where the answer isn't user-specific.

**Attribute before you optimise.** A dashboard of cost per tenant, per feature and per model tells you where the money goes; without it you'll optimise the wrong thing. It also surfaces the abuse case early — one tenant, one endpoint, an unexpected share of spend.

## Why it matters

At AI-forward companies inference is often the largest variable cost in the product, so cost control is an engineering responsibility rather than a finance one. Bringing it up unprompted — with the specific levers and a number attached — is a differentiator in both the design round and the hiring-manager conversation.

## Key points

- Marginal cost per request is real and skewed; a few tenants generate most of the spend.
- Meter tokens per tenant, user, feature and model, counting cached reads separately.
- Meter on cancellation too — generated tokens are billed whether or not they're read.
- Enforce budgets before the call using an estimate, then reconcile with actual usage.
- Limit tokens per minute, tokens per period, and concurrency — request counts are meaningless here.
- Decide and state the behaviour at the limit: block, downgrade, queue, or bill overage, by plan tier.
- Prompt caching is usually the biggest single saving, and it's a prompt-ordering change.
- Routing easy traffic to a smaller model exploits a roughly 5× price spread between tiers.
- Attribute cost per tenant and per feature before optimising anything.
