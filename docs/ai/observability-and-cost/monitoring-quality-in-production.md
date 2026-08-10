---
title: Monitoring Quality in Production
summary: Quality regressions in an LLM feature arrive silently — no errors, no alerts, just answers getting slightly worse — so you have to monitor for them deliberately.
level: core
minutes: 20
order: 5
tags: [observability, quality, product, practices]

related:
  - ai/evals-and-quality/offline-and-online-evaluation
  - ai/observability-and-cost/tracing-llm-applications
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
  - title: Evaluating the effectiveness of LLM-evaluators
    url: https://eugeneyan.com/writing/llm-evaluators/
    source: Eugene Yan
    type: article
    minutes: 40
---

## In one line

A degraded LLM feature returns HTTP 200 with a worse answer, so quality needs its own monitoring — behavioural signals, sampled judging, and a canary suite running against production.

## What it is

The reason this needs saying: the usual production signals are all clean during a quality regression. No 500s, no latency spike, no error rate. The prompt change, the model update, the retrieval index that silently stopped refreshing — none of them page anyone. Users notice before you do, and only some of them tell you.

Four layers, in increasing cost.

**Behavioural signals** are cheap and continuous: regeneration rate, copy rate, edit distance between generated and finally-used text, abandonment, escalation to a human, follow-up rephrasing. These need no model call and move quickly when something breaks, which makes them the best alerting substrate you have.

**Automated checks on live traffic** run deterministic validations on real outputs: schema conformance, citation validity, forbidden-content checks, output length distribution, refusal rate. Refusal rate deserves specific mention — a model update that makes the system more cautious shows up here and nowhere else.

**Sampled LLM judging** scores a percentage of production outputs on faithfulness or helpfulness. More expensive, so sample, and remember the judge is a versioned dependency whose own behaviour can shift.

**Human review** on a small sample remains irreplaceable. Reading twenty real sessions a week finds failure modes no metric was designed to catch, and it is the source of most new eval cases.

Then a **canary suite**: run a subset of your eval set against production on a schedule. This is what catches the changes you did not make — a provider updating a model behind an alias, a retrieval index gone stale, a dependency shifting a default. It is the only signal that treats the whole system as the unit.

For alerting, watch distributions rather than instances. Mean output length, refusal rate, tool error rate, cache hit rate, retrieval score distribution, cost per task — each shifting sharply means something changed, even if no single request looks wrong. And keep a dashboard that pairs quality with cost and latency, because regressions frequently trade against each other and a "fix" that halves cost while quietly raising refusals is not a fix.

Finally, pin model versions explicitly. Floating aliases mean your behaviour can change without a deploy, which is the single most confusing class of production incident in this space.

## Why it matters

"How would you know if quality degraded in production?" is a strong senior question precisely because the standard observability answers do not apply, and it is a live risk: model updates, index staleness, and prompt edits all change behaviour with no error anywhere. Naming behavioural signals and a production canary suite is the answer that shows operational experience.

## Key points

- Quality regressions produce no errors and no latency change — standard monitoring will not see them.
- Behavioural signals are the cheapest continuous quality proxy: regeneration, copy rate, edit distance, abandonment, escalation.
- Run deterministic checks on live outputs — schema, citation validity, length distribution, and especially refusal rate.
- Sample LLM judging for subjective dimensions, and remember the judge model can itself drift.
- Read sampled real sessions on a schedule; it finds what no metric was designed to catch.
- Run a canary eval suite against production regularly to catch changes you did not make.
- Alert on distribution shifts — output length, refusal rate, retrieval scores, cost per task — not on individual requests.
- Pair quality dashboards with cost and latency so a trade-off is not mistaken for an improvement.
- Pin model versions explicitly; a floating alias means behaviour can change with no deploy of yours.
- Make user feedback link straight to the trace so complaints become inspectable cases rather than anecdotes.
