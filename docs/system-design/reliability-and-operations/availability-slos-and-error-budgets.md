---
title: Availability, SLOs & Error Budgets
summary: Turning "it should be reliable" into a number, and using the gap between that number and 100% as a budget you're allowed to spend.
level: core
minutes: 20
order: 1
tags: [reliability, sre, operations]

related:
  - system-design/design-fundamentals/requirements-and-scoping
  - system-design/reliability-and-operations/observability-at-design-altitude
  - system-design/reliability-and-operations/rollouts-and-safe-deploys

resources:
  - title: Service Level Objectives
    url: https://sre.google/sre-book/service-level-objectives/
    source: Google SRE Book
    type: docs
    minutes: 35
    primary: true
  - title: Implementing SLOs
    url: https://sre.google/workbook/implementing-slos/
    source: Google SRE Workbook
    type: docs
    minutes: 45
  - title: Alerting on SLOs
    url: https://sre.google/workbook/alerting-on-slos/
    source: Google SRE Workbook
    type: docs
    minutes: 30
---

## In one line

An SLO is a target for a measured indicator, and the difference between that target and perfection is an error budget you spend on shipping.

## What it is

**The three terms.** An **SLI** is the measurement — the proportion of requests that succeed, or that complete under 300ms. An **SLO** is your internal target for it: 99.9% of requests succeed over 30 days. An **SLA** is a contract with money attached, and it's always set looser than the SLO so you find out you're in trouble before a customer does.

**The nines, as time.** 99% is 7.2 hours of downtime a month. 99.9% is 43 minutes. 99.99% is 4.3 minutes — which is less than the time it takes a human to read the page and open a laptop, so it implies automated recovery, not on-call heroics. 99.999% is 26 seconds a month and requires an architecture and an organisation built around it. Each nine is roughly a tenfold increase in cost and complexity, and knowing that is why "as available as possible" is not an answer.

**Availability multiplies.** A request that depends on five services at 99.9% each is at 99.5% before you've written any code. Serial dependencies compound; redundancy is what pushes back. This arithmetic is the argument for graceful degradation — a non-critical dependency should not be able to fail your request at all.

**Error budgets.** At 99.9% over 30 days you're allowed 43 minutes of failure. That budget is a currency: while it's unspent, ship fast and take risks; once it's exhausted, the team stops feature work and spends it on reliability. It converts an argument between product and engineering into a rule agreed in advance, which is the actual point.

**Measure from the user's side.** Server-side success rates miss the failures where the load balancer never reached your service, the DNS was wrong, or the response was too slow to be useful. Latency belongs in the SLO too — a request served in 30 seconds is a failure with a 200 status.

**Burn-rate alerting.** Don't alert on every failed request; alert on the *rate* at which you're consuming the budget. A fast burn (budget gone in an hour at this rate) pages someone; a slow burn opens a ticket. This is what makes on-call sustainable rather than noisy.

## Why it matters

It's the vocabulary for the design-round question "what availability does this need?", and the answer shapes the architecture — multi-AZ, multi-region, or a single instance with backups are all correct answers to different targets. It also demonstrates you've been on call: candidates who've carried a pager talk about degradation and budgets, candidates who haven't say "highly available."

## Key points

- SLI is the measurement, SLO the internal target, SLA the contract — and the SLA is always looser.
- 99.9% is 43 minutes a month; 99.99% is 4.3 minutes and implies automated recovery, not paging a human.
- Each additional nine costs roughly ten times as much, so pick the target from the business need.
- Serial dependencies multiply: five 99.9% services in a chain give you 99.5%.
- The error budget converts reliability-versus-velocity from an argument into a pre-agreed rule.
- Measure availability from the client's perspective, and include latency — slow enough is down.
- Alert on error-budget burn rate, not on individual failures, to keep on-call sustainable.
