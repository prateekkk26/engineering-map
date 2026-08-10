---
title: Offline & Online Evaluation
summary: Offline evals tell you whether to ship; online signals tell you whether it worked — and when they disagree, production is right.
level: core
minutes: 15
order: 5
tags: [evals, quality, product, observability]

related:
  - ai/evals-and-quality/why-evals-are-the-real-work
  - ai/observability-and-cost/monitoring-quality-in-production
  - ai/ai-product-thinking/shipping-and-iterating-on-ai-features

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
  - title: Trustworthy Online Controlled Experiments
    url: https://experimentguide.com/
    source: Kohavi, Tang, Xu
    type: book
---

## In one line

Offline evaluation runs a fixed case set before release and gates the change; online evaluation measures real user behaviour after release and is the only ground truth about whether the product got better.

## What it is

**Offline** is the eval suite: fixed inputs, defined checks, run in CI, fast feedback, no users at risk. Its limitation is structural — a fixed set cannot represent the full distribution of what users send, and it measures output properties rather than whether anyone was helped.

**Online** measures the thing you actually care about. The signals divide into three kinds:

*Explicit feedback* — thumbs up and down, ratings, a report button. Low volume, heavily biased toward extremes, and still valuable because each item is a labelled case for the offline suite. Make the negative path cheap and ask an optional "what went wrong?".

*Implicit behaviour* — usually the strongest signal and routinely under-instrumented. Did they copy the answer? Accept the suggestion? Edit it heavily before using it? Retry with a rephrased question? Abandon mid-stream? Escalate to a human? Edit distance between what you generated and what the user shipped is one of the best quality proxies available, and regeneration rate is a clean dissatisfaction signal.

*Outcomes* — did the ticket get resolved, the code merged, the task completed, the purchase made. These are the metrics the business cares about and the ones worth arguing over.

Then run experiments. A/B a prompt or model version on a traffic slice and compare the online metrics, because offline scores and user behaviour disagree more often than people expect. A change that scores better on your rubric and produces more regenerations and fewer copies is not an improvement, whatever the rubric says. When they conflict, production wins — and the disagreement is a signal your offline checks measure the wrong thing, so feed it back into the suite.

The loop closes both ways: production failures become offline cases, and offline scores predict online results better over time as the case set comes to resemble real traffic. Sampling and reading real sessions on a schedule remains the highest-value habit, because it surfaces failure modes no metric was designed to catch.

Two cautions. Guardrail metrics — cost per request, latency, refusal rate, error rate — need watching alongside quality, since a quality win bought with tripled cost or doubled latency may not be a win. And you need enough traffic for statistical significance; below that, qualitative session review beats an underpowered A/B test.

## Why it matters

"How do you know it's working in production?" separates people who ship AI features from people who build them. Naming implicit behavioural signals — edit distance, regeneration rate, copy rate — is the specific thing that lands, because thumbs-up/down is the answer everyone gives and it is the weakest of the three.

## Key points

- Offline evals gate the release; online signals decide whether the release helped.
- A fixed eval set cannot represent the real distribution, so offline scores are a proxy, not a verdict.
- Explicit feedback is low-volume and biased, but every item is a free labelled eval case.
- Implicit behaviour is the strongest and most neglected signal: copy rate, edit distance, regeneration, abandonment, escalation.
- Outcome metrics — resolved, merged, completed — are what the business will actually judge the feature on.
- A/B test prompt and model changes on real traffic; offline and online results disagree more often than expected.
- When offline and online conflict, production is right and your offline checks need fixing.
- Watch guardrail metrics — cost, latency, refusal rate, error rate — so a quality win isn't paid for invisibly.
- Below meaningful traffic volume, reading sampled sessions beats an underpowered experiment.
- Close the loop: production failures become permanent offline cases.
