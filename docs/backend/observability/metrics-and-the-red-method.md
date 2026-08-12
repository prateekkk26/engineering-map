---
title: Metrics & the RED Method
summary: The three numbers that describe any request-driven service, why you measure percentiles rather than averages, and what to alert on.
level: core
minutes: 20
order: 2
tags: [observability, metrics, monitoring]

related:
  - system-design/reliability-and-operations/availability-slos-and-error-budgets
  - backend/observability/observability-cost-and-cardinality
  - practices/incident-response/on-call-and-alerting

resources:
  - title: The RED Method
    url: https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/
    source: Grafana
    type: article
    minutes: 15
    primary: true
  - title: Monitoring distributed systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    source: Google SRE Book
    type: book
    minutes: 45
  - title: Histograms and summaries
    url: https://prometheus.io/docs/practices/histograms/
    source: Prometheus
    type: docs
    minutes: 20
---

## In one line

Rate, Errors, Duration — per endpoint, as percentiles — describes the health of any request-driven service, and everything else is detail you add once those three point somewhere.

## What it is

**RED** is the request-side counterpart to USE (Utilisation, Saturation, Errors) for resources. **Rate** is requests per second, **Errors** is the failing fraction, **Duration** is the latency distribution. Break all three down by endpoint and status, because an aggregate hides the one route that's broken.

**Percentiles, not averages.** An average latency of 200ms is consistent with half your users at 50ms and a tail at seconds; the average is the one number guaranteed to describe nobody. Track p50, p95, p99, and know that at any real scale a p99 is the experience of a lot of people — and that a single page making twenty requests means most page loads contain a p95. Two caveats worth knowing: **percentiles don't average**, so you cannot combine per-instance p99s into a service p99 (use histograms, which do aggregate correctly), and a **latency histogram's buckets must be chosen in advance** to cover the range you care about.

**Metrics versus logs versus traces**: metrics are cheap, aggregate, and answer "how much / how often"; they cannot tell you *why*. That's the deliberate trade — a counter costs almost nothing and can be retained for a year, while the log line explaining one request costs far more per event. Use metrics for alerting and dashboards, traces and logs for diagnosis.

**Alert on symptoms, not causes.** Page on what users experience — error rate above the SLO burn rate, p99 above the latency objective, queue depth growing without bound — not on CPU at 80%, which may be entirely fine. Every alert should be actionable and correspond to something a human can do at 3am; alerts that fire regularly and are routinely ignored are worse than no alerts, because they train the ignoring.

Some service-specific gauges earn a place beside RED: **event loop lag** for Node, **connection pool wait time**, **queue depth and oldest-message age**, and for AI features, **tokens and cost per request**. Each is a leading indicator that turns into user-visible failure if unwatched.

## Why it matters

"How do you know the service is healthy?" and "what would you alert on?" are standard senior questions, and RED plus symptom-based alerting is a complete, compact answer. The percentile point in particular is one interviewers listen for, because reasoning about tail latency is the difference between measuring a system and understanding it.

## Key points

- Rate, errors and duration per endpoint describe any request service; add resource metrics only when they point somewhere.
- Averages hide the tail — p50/p95/p99 is the minimum useful view of latency.
- Percentiles can't be averaged across instances; aggregate histograms, not pre-computed percentiles.
- A page with twenty requests means the typical user experiences your p95 on nearly every load.
- Metrics answer how much and how often; they never answer why, which is what traces and logs are for.
- Alert on user-visible symptoms and SLO burn rate, not on CPU or memory thresholds.
- An alert that isn't actionable at 3am trains people to ignore the ones that are.
- Event loop lag, pool wait time, queue age and token cost are the leading indicators specific to this stack.
