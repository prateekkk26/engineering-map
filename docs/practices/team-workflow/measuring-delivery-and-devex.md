---
title: Measuring delivery & developer experience
summary: The four DORA metrics measure the system rather than the people, and they're the credible answer to "how do you know your team is doing well?"
level: core
minutes: 22
order: 1
tags: [devex, delivery, metrics]

related:
  - practices/ci-cd-and-delivery/continuous-integration-in-practice
  - practices/quality-and-tech-debt/making-the-case-for-paydown
  - practices/team-workflow/local-environments-and-onboarding

resources:
  - title: DORA — the four keys
    url: https://dora.dev/guides/dora-metrics-four-keys/
    source: DORA
    type: docs
    minutes: 25
    primary: true
  - title: The SPACE of Developer Productivity
    url: https://www.microsoft.com/en-us/research/publication/the-space-of-developer-productivity/
    source: Microsoft Research
    type: article
    minutes: 30
  - title: Accelerate
    url: https://itrevolution.com/product/accelerate/
    source: Forsgren, Humble & Kim
    type: book
---

## In one line

Deployment frequency, lead time for changes, change failure rate, and time to restore — measured together, they resist gaming and describe the delivery system rather than individual output.

## What it is

The **four keys** split into throughput and stability. *Deployment frequency* and *lead time for changes* (commit to running in production) measure speed; *change failure rate* and *failed deployment recovery time* measure stability. The central finding of the research is that these do **not** trade off: high performers are better at all four, because the practices producing speed — small batches, automation, fast feedback — are the same ones producing stability.

They work as a set. Any one alone is trivially gamed: deploy frequency rises if you deploy empty commits; failure rate falls if you stop shipping. Together they describe the system's actual capability. And they're **team-level, not individual** — using them to compare engineers is the fastest way to destroy their usefulness, along with the honesty of the data feeding them.

**SPACE** is the broader frame worth knowing by name: satisfaction, performance, activity, communication, and efficiency. Its point is that productivity is multidimensional and that any single metric will be optimised at the expense of the others. In practice the most useful additions to DORA are the ones you can only get by asking people: how long the build takes, how often the pipeline is flaky, how long onboarding takes, and how often someone is blocked waiting on something.

Metrics that mislead, and why they keep reappearing: lines of code (rewards volume), commit or PR counts (rewards splitting work, not delivering it), story points completed (a planning estimate, not an output), and hours worked. Each is easy to collect, which is exactly why it survives.

The practical move is smaller than a metrics program: pick the two or three numbers where you already suspect friction — pipeline duration, PR time-to-merge, time from merge to production — measure them for a month, and use the trend to justify the fix. That is also the data that makes the tech-debt conversation land.

## Why it matters

"How would you tell whether the team is healthy?" and "what would you improve in your first ninety days?" are standard hiring-manager questions, and DORA gives a specific, research-backed answer instead of a vibe. Recognising which metrics are harmful is equally important — being handed lines-of-code dashboards is a real thing that happens.

## Key points

- The four keys: deployment frequency, lead time for changes, change failure rate, time to restore.
- Throughput and stability rise together; speed and safety are not a tradeoff in practice.
- Measure the delivery system at team level — individual comparison corrupts both the metric and the data.
- Any single metric is gameable; the set is what makes it meaningful.
- SPACE adds the dimensions you can only get by asking people, including satisfaction.
- Lines of code, PR counts, and story points measure activity, not delivered value.
- Pipeline duration, PR merge time, and onboarding time are cheap, high-signal DX measures.
- Use the trend, not the absolute number, to justify investment.
