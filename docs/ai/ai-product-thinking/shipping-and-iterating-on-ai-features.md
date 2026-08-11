---
title: Shipping & Iterating on AI Features
summary: The delivery loop for a feature whose quality you cannot fully predict — narrow scope, real traffic, tight feedback, and the willingness to pull it.
level: core
minutes: 20
order: 5
tags: [product, practices, quality, judgement]

related:
  - ai/evals-and-quality/offline-and-online-evaluation
  - ai/observability-and-cost/monitoring-quality-in-production
  - ai/ai-product-thinking/designing-for-nondeterminism

resources:
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
    primary: true
  - title: Your AI product needs evals
    url: https://hamel.dev/blog/posts/evals/
    source: Hamel Husain
    type: article
    minutes: 35
  - title: People + AI Guidebook
    url: https://pair.withgoogle.com/guidebook/
    source: Google PAIR
    type: docs
    minutes: 60
---

## In one line

Ship a narrow version to a small group behind a flag, instrument everything, read real sessions, and let observed usage rather than the demo decide what happens next.

## What it is

The distinctive difficulty is that you cannot know the quality of an AI feature before real users touch it. The input distribution is unbounded, and no amount of internal testing reproduces what people actually type. So the delivery loop is built around getting to real traffic quickly and safely.

**Scope narrowly first.** One task, one surface, one user segment. A feature that summarises one document type well is shippable; one that "helps with anything" cannot be evaluated, cannot be scoped, and cannot be fixed when it disappoints.

**Ship behind a flag to a small cohort** — internal users, then design partners, then a traffic percentage. Every stage is a chance to see real inputs before the blast radius is large.

**Instrument before launch, not after.** Traces with full prompts and outputs, token usage tagged by feature and user, latency split by component, and behavioural signals — regeneration, copy, edit distance, abandonment. Retrofitting this during a quality complaint is painful and slow.

**Read sessions.** This is the highest-value habit in the whole loop and the one most often skipped. Twenty real sessions a week will teach you more than any dashboard, because the failures you did not anticipate are invisible to metrics designed around the ones you did. Everything interesting you find becomes an eval case.

**Close the loop.** Production failure → eval case → fix → regression suite → ship. That cycle is what makes quality improve rather than oscillate.

**Expect the second-week problem.** Novelty inflates early usage; the honest read on whether a feature is valuable comes from retention among users who have had it long enough for the novelty to wear off. Judge on repeat usage and outcomes, not first-week engagement.

**Be willing to pull it.** An AI feature that is wrong often enough damages trust in the whole product, not just itself. Killing a disappointing feature is a legitimate outcome, and having said so up front makes it a decision rather than a defeat.

Two operational realities to plan for: models get deprecated on a schedule, so a shipped feature carries a re-evaluation and migration commitment; and the field moves fast enough that a workaround you built six months ago may now be a platform feature worth deleting.

## Why it matters

This is the process half of the behavioural round — "tell me about an AI feature you shipped" — and the strong answer is a loop with instrumentation, session review, and evals in it rather than a launch story. It is also what actually determines whether an AI product improves, since the teams that ship well are not the ones with better prompts but the ones with a faster loop from real failure to fix.

## Key points

- You cannot predict quality before real traffic; the loop exists to reach it quickly and safely.
- Scope to one task, one surface, one segment — an unbounded feature cannot be evaluated or fixed.
- Roll out behind a flag: internal, then design partners, then a percentage of traffic.
- Instrument before launch — traces, token usage by feature and user, latency by component, behavioural signals.
- Read twenty real sessions a week; it surfaces failures no metric was designed to catch.
- Every production failure becomes a permanent eval case, which is what makes quality improve rather than oscillate.
- Discount novelty: judge on retention and outcomes after the first weeks, not on launch engagement.
- Be prepared to kill it — a persistently wrong feature damages trust in the whole product.
- Model deprecations mean a shipped feature carries an ongoing re-evaluation and migration commitment.
- Revisit your own workarounds periodically; platform features regularly make them deletable.
