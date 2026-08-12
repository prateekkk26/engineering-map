---
title: Observability Fundamentals
summary: Instrumenting a system so you can answer questions about it you didn't think to ask before it broke.
level: core
minutes: 25
tags: [observability, reliability, operations]

surfaced_in:
  - backend/observability
  - frontend/architecture
  - system-design/reliability-and-operations

related:
  - backend/observability/metrics-and-the-red-method
  - backend/observability/tracing-and-context-propagation
  - frontend/architecture/frontend-observability
  - system-design/reliability-and-operations/observability-at-design-altitude

resources:
  - title: Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    source: Google SRE Book
    type: book
    minutes: 40
    primary: true
  - title: Observability Primer
    url: https://opentelemetry.io/docs/concepts/observability-primer/
    source: OpenTelemetry
    type: docs
    minutes: 15
  - title: Observability — A Manifesto
    url: https://www.honeycomb.io/blog/observability-a-manifesto
    source: Honeycomb
    type: article
    minutes: 15
---

## In one line

Monitoring tells you that something you predicted has happened; observability is having enough detail recorded to explain something you didn't predict.

## What it is

The three signals are **logs**, **metrics**, and **traces**, and they answer different questions. A metric is a number over time, cheap and aggregated — good for "is it broken and how badly", useless for "why for this customer". A log is an event with context, good for the specifics, expensive at volume. A trace follows one request across services, which is the only one that answers "where did the 4 seconds go" in a system with more than two hops. Most debugging is a walk across all three: an alert on a metric, a trace to find the slow span, logs on that span to see what it was doing.

What makes them usable together is **high-cardinality structured events with correlation**. Structured, so you can query `status=500 AND tenant=acme AND region=eu` rather than grep. High-cardinality, so user id, tenant, endpoint, model name, and build sha are all attributes you can slice by — that is exactly the dimension pre-aggregated metrics throw away, and exactly the one you need when a problem affects 2% of traffic. And correlated by a **trace or request id that propagates everywhere**, including into the frontend and into background jobs, so one identifier pulls the whole story together. If you do only one thing, do this: emit one structured event per request, with the ids, the duration, the outcome, and the important attributes.

For what to measure, two small vocabularies cover nearly everything. **RED** for request-driven services: rate, errors, duration. **USE** for resources: utilisation, saturation, errors. Both are deliberately tiny, because the failure mode of dashboards is having two hundred graphs and no idea which one is abnormal.

Alerting deserves its own rule: **alert on symptoms, not causes.** Page on "checkout error rate above 2%" or "p99 latency above the SLO", not on "CPU above 80%" — high CPU may be fine, and a broken checkout is never fine. Every page should be actionable and tied to something a user experiences; anything else belongs on a dashboard, and an alert nobody acts on is training people to ignore the ones that matter.

The cost side is real. Cardinality is what you pay for, retention multiplies it, and an unbounded attribute (a raw URL with ids in it, a full prompt) can multiply a bill by an order of magnitude overnight. Sampling is the standard answer — keep all the errors and slow requests, sample the boring successes.

## Why it matters

"How would you debug this in production?" is asked in almost every senior loop, and the difference between a junior and a senior answer is whether you reach for a log grep or for a query across correlated events. In the deep dive, the follow-up to any incident story is how you found the cause — and the answer reveals immediately whether the system was instrumented on purpose.

## Key points

- Monitoring covers known failure modes; observability is about explaining the ones you didn't anticipate.
- Metrics for how bad, traces for where, logs for what exactly — and you need the ids to walk between them.
- Emit one structured, high-cardinality event per request; it is the highest-value instrumentation there is.
- Propagate a request or trace id everywhere, including the browser and background jobs.
- RED for services, USE for resources — small vocabularies beat large dashboards.
- Alert on user-visible symptoms and SLO burn, never on causes like CPU; every page must be actionable.
- Cardinality and retention are the cost drivers; sample successes, keep errors and slow requests.
- Instrumentation is part of building a feature, not something added after the first incident.
