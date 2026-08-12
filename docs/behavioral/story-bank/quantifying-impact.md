---
title: Quantifying Impact
summary: A number turns a claim into evidence, and an honest small number beats an impressive one you can't defend.
level: core
minutes: 15
order: 4
tags: [impact, metrics, storytelling]

related:
  - behavioral/story-bank/star-and-how-it-fails
  - behavioral/positioning-and-outreach/resume-and-linkedin-for-senior
  - practices/team-workflow/measuring-delivery-and-devex

resources:
  - title: Measuring an engineering organization
    url: https://lethain.com/measuring-engineering-organizations/
    source: Will Larson
    type: article
    minutes: 20
    primary: true
  - title: DORA metrics — the four keys
    url: https://dora.dev/guides/dora-metrics-four-keys/
    source: DORA
    type: docs
    minutes: 20
  - title: Cannot measure productivity
    url: https://martinfowler.com/bliki/CannotMeasureProductivity.html
    source: Martin Fowler
    type: article
    minutes: 15
---

## In one line

Attach a number to the outcome, be precise about how you know it, and never round up past what you could defend under one follow-up question.

## What it is

"It made things faster" is a claim. "p95 went from 1.9s to 380ms on the search endpoint, measured in production over the following week" is evidence. The second is not more impressive because the number is big — it's more impressive because it demonstrates you were measuring at all, which is the actual senior behaviour.

**Where numbers come from when you think you have none.** Latency and error rates from dashboards. Build and deploy times. Bundle size and Core Web Vitals. Support ticket volume on a flow. Conversion or drop-off at a step. Time-to-first-PR for new hires. Incident count or on-call pages per week. Cost per thousand requests — increasingly load-bearing for LLM features, where a prompt or model change moving spend from $4k to $900 a month is a genuinely senior result. Even "three engineers stopped spending Mondays on this" is quantified.

**When you truly don't have a number**, say what you observed and how: the queue stopped growing, the flaky test disappeared from the last 200 CI runs, the on-call rotation stopped getting paged for it. Direction plus evidence is honest and lands fine. Inventing precision is the one unrecoverable move here, because interviewers probe numbers and a fabricated one collapses immediately.

**Be honest about attribution.** If the redesign shipped alongside a pricing change, don't claim the revenue. "Conversion went up 12%; I can only attribute part of that to the perf work, but the flow I owned went from 6% to 2% drop-off" is a far stronger answer than a clean claim you can't defend, and it demonstrates exactly the analytical care the number was supposed to signal.

Note also that the interesting number is often the counterfactual — what the thing cost, not just what it gained. "It took three weeks and we deferred the mobile work to do it" shows you knew the price.

## Why it matters

Senior candidates are expected to connect work to outcomes, and it's the most common gap in otherwise strong stories. Numbers also protect you in the deep dive: an answer anchored in measurement invites follow-ups you can answer, whereas an unquantified claim invites the one you can't.

## Key points

- Pair every result with how you know it — the dashboard, the window, the population.
- Sources you probably already have: latency, error rate, build time, bundle size, ticket volume, drop-off, pages, cost per request.
- LLM cost and token spend are first-class impact metrics at these companies.
- No number is fine; fabricated precision is not, and it fails on the first follow-up.
- Direction plus observable evidence ("stopped paging", "no flakes in 200 runs") is a legitimate result.
- Split attribution honestly when other changes shipped alongside — the caveat strengthens the claim.
- Say what the work cost as well as what it returned.
- Capture numbers while you still have dashboard access; they're unrecoverable after you leave.
