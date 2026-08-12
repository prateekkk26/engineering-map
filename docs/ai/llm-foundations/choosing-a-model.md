---
title: Choosing a Model
summary: Picking a model is a per-step cost, latency, and capability decision — not a one-time vendor choice for the whole product.
level: core
minutes: 20
order: 7
tags: [llm, fundamentals, cost, architecture]

related:
  - ai/working-with-the-api/token-accounting-and-cost
  - ai/working-with-the-api/reasoning-effort-and-thinking
  - ai/evals-and-quality/building-an-eval-set

resources:
  - title: Models overview
    url: https://platform.claude.com/docs/en/about-claude/models/overview
    source: Anthropic
    type: docs
    minutes: 15
    primary: true
  - title: Pricing
    url: https://platform.claude.com/docs/en/about-claude/pricing
    source: Anthropic
    type: docs
    minutes: 10
  - title: LMArena leaderboard
    url: https://lmarena.ai/
    source: LMArena
    type: repo
    minutes: 10
  - title: Artificial Analysis — model comparison
    url: https://artificialanalysis.ai/
    source: Artificial Analysis
    type: repo
    minutes: 15
---

## In one line

Choose per call site, not per product: route each step to the cheapest model that clears your eval bar for that step, and keep the routing behind one interface so the choice stays cheap to revisit.

## What it is

Providers ship a tier ladder — a frontier tier for hard reasoning and long-horizon agentic work, a mid tier that is close to frontier on most tasks at a fraction of the price, and a small fast tier for classification, extraction, and routing. Prices differ by roughly an order of magnitude across that ladder, and output tokens cost several times input tokens at every rung.

The dimensions that actually decide it:

**Capability on your task**, measured on your own evals. Public leaderboards are a shortlist generator, not a decision: they measure aggregate preference or benchmark suites that may have nothing to do with extracting fields from your invoices. The number that matters is the pass rate on fifty of your real cases.

**Cost**, which is input tokens plus output tokens weighted separately, and which is dominated by whichever of those your workload is heavy in. A summarisation feature is input-heavy and loves prompt caching; a code-generation feature is output-heavy and cares about the output rate.

**Latency**, which splits into time-to-first-token (dominated by prefill, so by prompt size) and tokens per second (which decides time-to-completion). A chat surface cares about the first; a background job cares about the second. Reasoning models trade both for quality — they emit a long stretch of thinking tokens before anything visible, which reads as a long pause unless your UI accounts for it.

**Context window and modality** — how much you need to fit, and whether you need images, PDFs, or audio.

**Everything non-technical**: data residency and retention terms, whether the provider is available through your cloud, rate limits at your tier, and deprecation cadence. Models retire. Anything that pins a model ID needs an owner.

The practical shape is a thin internal interface over the provider, a per-feature model choice, and an eval suite you can re-run against a candidate model in an hour. Then a model swap is an experiment rather than a project.

## Why it matters

This is a live cost lever and interviewers know it — "your inference bill tripled, what do you do?" is a realistic prompt and the answer is mostly routing and caching, not renegotiating. It is also a maturity signal: engineers who default everything to the biggest model, and engineers who cannot say why they chose the small one, both read the same way.

## Key points

- Route per step. A single product routinely uses three tiers — small for classification and routing, mid for the bulk of the work, frontier for the hard step.
- Benchmark on your own eval set; public leaderboards narrow the candidates but never decide.
- Output tokens cost several times input tokens, so the input/output ratio of your workload changes which model is actually cheapest.
- Latency is two numbers — time-to-first-token and tokens per second — and which one matters depends entirely on whether a human is waiting.
- Reasoning models buy quality with tokens and with a visible pause before output; use effort settings to tune the trade rather than switching model.
- Cheap models plus good context frequently beat expensive models plus bad context; fix retrieval before upgrading the model.
- Keep provider calls behind one internal interface so switching is a config change, and pin explicit model IDs so an upstream default change never silently alters behaviour.
- Models get deprecated on a published schedule — treat a pinned model ID as a dependency with an expiry date.
