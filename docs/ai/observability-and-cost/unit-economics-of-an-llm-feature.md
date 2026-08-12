---
title: Unit Economics of an LLM Feature
summary: What one user, one task, and one plan actually cost you — the analysis that decides whether an AI feature is a product or a subsidy.
level: core
minutes: 20
order: 2
tags: [cost, product, observability, architecture]

related:
  - ai/working-with-the-api/token-accounting-and-cost
  - ai/observability-and-cost/caching-strategies-for-llm-apps
  - ai/ai-product-thinking/when-not-to-use-an-llm

resources:
  - title: Pricing
    url: https://platform.claude.com/docs/en/about-claude/pricing
    source: Anthropic
    type: docs
    minutes: 10
    primary: true
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
  - title: Artificial Analysis — model comparison
    url: https://artificialanalysis.ai/
    source: Artificial Analysis
    type: repo
    minutes: 15
---

## In one line

Cost per successful task, multiplied by tasks per user per month, compared against what that user pays — the arithmetic that decides whether the feature scales or bleeds.

## What it is

Traditional SaaS has a marginal cost near zero, so growth is unambiguously good. LLM features do not: every use costs real money, heavy users cost far more than light ones, and the same flat monthly price can be wildly profitable for one customer and deeply unprofitable for another. That is a genuinely different business shape, and it is why unit economics became an engineering concern rather than a finance one.

The arithmetic starts with **cost per task**, and the word "task" matters more than "request". A task that takes three retries, two tool round trips, and a reranking call costs the sum of all of them, so the honest denominator is *successful* tasks. A cheaper model that fails more often is not cheaper.

Multiply by expected usage per user per month, compare against revenue per user, and the interesting number falls out: how heavy a user can be before they cost more than they pay. Then look at the distribution rather than the mean, because usage is reliably long-tailed — a small fraction of users generate a large fraction of cost, and a mean that looks fine can hide accounts losing money every month.

The levers, roughly in order of payoff:

**Prompt caching** — often the single biggest reduction, and it costs a reordering of the prompt rather than a redesign. **Model routing** — small model for classification and routing, mid tier for the bulk, frontier only for the hard step. **Context discipline** — retrieved chunks and conversation history are usually where the tokens quietly go; trimming them cuts cost and often improves quality. **Output caps** — output tokens are the expensive class, so bounding response length is a direct saving. **Semantic caching** — repeat and near-repeat requests answered from a previous result. **Batch pricing** for anything not interactive.

Then the product-side levers, which are frequently larger than the technical ones: usage limits per plan, credit systems, usage-based pricing tiers, and simply not running the model when a cheaper path will do — a cached answer, a template, a deterministic rule.

What to instrument: cost per request, per feature, per user, and per tenant, from the day the feature launches. Alert on cost per task rather than total spend, since growth and regression look identical on a raw spend graph. And track the ratio of cost to revenue per account so the unprofitable tail is visible before it is large.

## Why it matters

At an AI-forward company this is a live conversation with the founders, not a back-office concern, and "what does this cost per user and how would you halve it?" is a real interview question. Being able to reason about the long tail, name the levers in order, and mention plan limits alongside caching reads as someone who has thought about the business, which is exactly what the hiring-manager round is testing.

## Key points

- LLM features have real marginal cost, so growth is not automatically good and heavy users can be unprofitable.
- Measure cost per *successful* task, not per request — retries, tool calls, and reranking all belong in the numerator.
- Look at the usage distribution, not the mean; cost is long-tailed and averages hide loss-making accounts.
- Prompt caching is usually the largest single lever, and the cheapest to implement.
- Route by step: small models for classification and routing, frontier only where it is genuinely needed.
- Context is where tokens hide — trimming retrieved chunks and history cuts cost and often improves quality.
- Output tokens are the expensive class, so capping response length is a direct saving.
- Semantic caching and batch pricing cover repeat work and non-interactive work respectively.
- Product levers — plan limits, credits, usage-based tiers — are often bigger than the technical ones.
- Alert on cost per task and cost-to-revenue per account, not total spend, or growth masks regression.
