---
title: On-call & alerting
summary: Every page should be urgent, actionable, and about something a user can feel — everything else is a dashboard or a ticket.
level: core
minutes: 22
order: 1
tags: [operations, observability, reliability]

related:
  - system-design/reliability-and-operations/availability-slos-and-error-budgets
  - practices/incident-response/triage-and-severity
  - practices/technical-communication/runbooks-and-operational-docs

resources:
  - title: Google SRE Book — Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    source: Google SRE
    type: docs
    minutes: 35
    primary: true
  - title: Google SRE Book — Being On-Call
    url: https://sre.google/sre-book/being-on-call/
    source: Google SRE
    type: docs
    minutes: 25
  - title: PagerDuty Incident Response — On-call
    url: https://response.pagerduty.com/oncall/being_oncall/
    source: PagerDuty
    type: docs
    minutes: 15
---

## In one line

Alert on symptoms users experience, not on causes you happen to be able to measure, and delete any alert nobody has ever acted on.

## What it is

The rule that fixes most alerting is **page on symptoms, not causes**. High CPU is a cause; it may be entirely fine. Checkout error rate above 2% for five minutes is a symptom, and it is always worth waking someone. The four golden signals — latency, traffic, errors, saturation — are where to start, and if you have SLOs, alerting on **burn rate** (how fast you're consuming the error budget) gives you urgency proportional to real user harm rather than a threshold someone guessed in 2022.

Every page needs three properties: **urgent** (it must be handled now, not at 9am), **actionable** (a human can do something; if the system self-heals, it's a ticket), and **novel** (not the fourth copy of a firing alert). A page that fails any of these trains people to ignore pages, and alert fatigue is a genuine reliability risk — the outage that gets missed is the one that looked like the noise.

**Tiering** is how you keep that bar: page for user-facing breakage, ticket for things that need action this week, dashboard for everything else. Reviewing the last month of pages and deleting or downgrading anything with no action taken is a half-hour exercise that pays for itself.

Beyond alerts, on-call is a **structure**: a rotation with enough people that it isn't punishing, a documented escalation path, a runbook per alert (linked from the alert itself), and the authority to act — including rolling back someone else's change at 3am without asking. Interrupt work should be capped; SRE practice is a rough half-day-of-toil ceiling, and if a rotation is consistently busier than that, the answer is engineering time on the causes, not stoicism.

The most useful cultural detail: **follow-up work from on-call goes into the backlog with priority**, and whoever holds the pager writes a short handover at the end of the shift. Otherwise the same page recurs monthly and everybody knows the workaround by heart, which is a strong sign of an unpaid debt.

## Why it matters

Any senior role at a small company means carrying a pager, and hiring managers ask how you've handled it. It's also the topic where "I've operated something" is most obviously distinguishable from "I've read about operating something" — the tell is talking about alert quality and fatigue rather than tooling.

## Key points

- Alert on user-visible symptoms; causes belong on dashboards until they predict user harm.
- Latency, traffic, errors, saturation are the default starting signals for any service.
- SLO burn-rate alerts scale urgency to actual budget consumption rather than a fixed threshold.
- Every page must be urgent, actionable, and novel — anything else trains people to ignore pages.
- Alert fatigue is a reliability risk in itself: the missed outage looks like the noise.
- Each alert links to a runbook; an alert with no documented first step is unfinished.
- On-call needs an explicit escalation path and the authority to roll back without permission.
- Recurring pages are unpaid debt — track follow-ups as prioritised work, not as folklore.
