---
title: Observability Cost & Cardinality
summary: Why telemetry bills rival compute bills, what high cardinality does to a metrics system, and how to cut cost without going blind.
level: deep
minutes: 20
order: 5
tags: [observability, cost, metrics]

related:
  - backend/observability/metrics-and-the-red-method
  - ai/observability-and-cost/unit-economics-of-an-llm-feature
  - backend/observability/tracing-and-context-propagation

resources:
  - title: How to manage high cardinality metrics
    url: https://grafana.com/blog/2022/10/20/how-to-manage-high-cardinality-metrics-in-prometheus-and-kubernetes/
    source: Grafana
    type: article
    minutes: 20
    primary: true
  - title: Instrumentation — naming and labels
    url: https://prometheus.io/docs/practices/naming/
    source: Prometheus
    type: docs
    minutes: 15
  - title: Sampling
    url: https://opentelemetry.io/docs/concepts/sampling/
    source: OpenTelemetry
    type: docs
    minutes: 20
---

## In one line

Every distinct combination of label values is a separate time series, so one well-meaning `user_id` label turns a cheap metric into millions of them and takes the metrics system down with it.

## What it is

**Cardinality** is the number of unique label combinations on a metric. `http_requests_total{route, status, method}` with 50 routes, 8 statuses and 4 methods is 1,600 series — fine. Add `user_id` with a million users and it's 1.6 billion, which no time-series database will hold. This is the classic self-inflicted outage: an engineer adds a helpful label, and the metrics backend falls over. The rule is simple — **labels must be bounded and low-cardinality**: route templates (`/users/:id`, never the expanded path), status class, region, tenant *only if* you have few tenants.

High-cardinality data still matters; it just belongs in a different signal. Per-user and per-request detail goes in **traces and structured logs**, which are event-based and indexed for exactly this, not in metrics. That's the practical division: metrics for aggregates and alerts, events for detail.

**Cost** follows volume and retention across all three signals. Logs are usually the biggest line — debug logging left on in production, or an `info` line per iteration of a loop, can multiply ingest tenfold overnight. Traces are cheap only because they're sampled. Metrics are cheap per series and ruinous per cardinality explosion.

Levers, roughly in order of value for money: **sample traces by outcome** (keep errors and slow requests, sample the healthy ones); **cut log volume at the source** rather than shipping and dropping — the cost is in ingest; **tier retention** (30 days hot, cheap archive after); **drop the metrics nobody queries**, which after a year is a substantial fraction; and prefer **aggregating at the edge** over shipping raw events.

The judgement to state out loud in an interview: cutting observability spend by removing signal is a false economy, because the cost shows up later as a longer incident. The right cuts are the ones that reduce volume without reducing the ability to answer questions — sampling policy, cardinality hygiene, retention tiers — not turning off tracing to make a number look better.

## Why it matters

Observability bills routinely reach a meaningful share of infrastructure spend, so "our Datadog bill is bigger than our AWS bill" is a real conversation senior engineers are expected to have opinions in. The cardinality rule is also a concrete, checkable piece of knowledge that has caused real outages, which makes it a favourite follow-up.

## Key points

- Cardinality is the product of every label's distinct values, and it multiplies fast.
- Never label metrics with user IDs, request IDs, emails, or full URL paths — use route templates.
- Put high-cardinality detail in traces and logs, which are built for per-event indexing.
- Log volume is usually the largest bill; reduce at the source, because ingest is what you pay for.
- Sample traces by outcome so errors and slow requests survive while healthy traffic is thinned.
- Tier retention rather than keeping everything hot, and delete metrics nobody has queried in a year.
- Cutting signal to cut cost pays for itself back with interest during the next incident.
