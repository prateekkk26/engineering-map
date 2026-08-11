---
title: Observability at Design Altitude
summary: What you'd instrument and alert on, decided while drawing the system rather than after the first incident.
level: core
minutes: 20
order: 6
tags: [observability, operations, monitoring]

related:
  - system-design/reliability-and-operations/availability-slos-and-error-budgets
  - ai/observability-and-cost/tracing-llm-applications
  - system-design/distributed-systems/partial-failure-and-failure-detection

resources:
  - title: Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    source: Google SRE Book
    type: docs
    minutes: 35
    primary: true
  - title: OpenTelemetry — Observability Primer
    url: https://opentelemetry.io/docs/concepts/observability-primer/
    source: OpenTelemetry
    type: docs
    minutes: 20
  - title: Dapper — A Large-Scale Distributed Systems Tracing Infrastructure
    url: https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/
    source: Google Research
    type: article
    minutes: 40
---

## In one line

Monitoring tells you something is wrong; observability is having enough high-cardinality detail recorded to work out *why*, for a failure nobody predicted.

## What it is

**The three signals, and what each is for.** *Metrics* — cheap, aggregated numbers over time; what you alert on. *Logs* — detailed per-event records; what you read once you know roughly where to look, and structured (key-value) rather than prose, or you can't query them. *Traces* — one request's path across services with timing per hop; what tells you which of eight services spent the 900ms. In a design with several services, traces are the single highest-value thing to add, and propagating a request ID from the very edge is what makes them possible.

**The four golden signals** are the default answer for what to measure per service: **latency** (as a distribution, not a mean), **traffic**, **errors**, and **saturation** (how full the constrained resource is — connection pool, queue depth, CPU). For queues and pipelines the equivalents are consumer lag and oldest-unprocessed-message age.

**Alert on symptoms, not causes.** Page when users are affected: error rate up, latency past the SLO, queue backing up. Don't page on high CPU — if CPU is high and nobody's suffering, there's nothing to do at 3am. Every page should be actionable, urgent and novel; anything that isn't becomes noise, and noisy alerting is how real pages get missed.

**Cardinality is the whole game for debugging.** "Error rate is 2%" is nearly useless. "Error rate is 2%, and it's entirely one tenant, on one endpoint, in one region, since the deploy at 14:20" is the answer. That requires per-request attributes — tenant, endpoint, version, region — recorded in a way you can group by after the fact. Metrics labels are expensive at high cardinality; wide structured events or sampled traces are the usual answer.

**Design-time decisions, not afterthoughts.** Request IDs generated at the edge and propagated everywhere. Structured logs with a consistent schema. A version tag on every signal so you can compare before and after a deploy. Sampling strategy for traces — head sampling for volume, tail sampling to keep the interesting ones. And retention: observability data grows fast and costs real money.

**Dashboards nobody looks at aren't observability.** The useful artefacts are one service dashboard per team that answers the golden signals, and the ability to slice by dimension when something is odd.

## Why it matters

"How would you know this is working, and how would you debug it at 3am?" is one of the most reliable senior-signal questions in a design round, and most candidates have nothing prepared. It's also the difference between a 10-minute incident and a 3-hour one — with distributed tracing and per-tenant attributes you find the culprit; without them you read logs.

## Key points

- Metrics for alerting, logs for detail, traces for finding which hop was slow.
- Generate a request ID at the edge and propagate it through every hop and log line.
- Latency, traffic, errors and saturation are the default per-service measurements.
- For async paths, consumer lag and oldest-message age are the signals that matter.
- Alert on user-visible symptoms, never on causes like CPU — every page must be actionable.
- High-cardinality attributes (tenant, endpoint, version, region) are what turn "2% errors" into a diagnosis.
- Tag every signal with the deploy version so before-and-after comparison is possible.
- Decide sampling and retention at design time; observability data volume and cost grow fast.
