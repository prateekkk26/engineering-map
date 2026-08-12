---
title: Tracing & Context Propagation
summary: Following one request across services and awaits — spans, trace context headers, and sampling that keeps the interesting traces.
level: core
minutes: 25
order: 3
tags: [observability, tracing, opentelemetry]

related:
  - backend/observability/structured-logging
  - ai/observability-and-cost/tracing-llm-applications
  - backend/services-in-production/calling-other-services

resources:
  - title: Traces
    url: https://opentelemetry.io/docs/concepts/signals/traces/
    source: OpenTelemetry
    type: docs
    minutes: 25
    primary: true
  - title: Context propagation
    url: https://opentelemetry.io/docs/concepts/context-propagation/
    source: OpenTelemetry
    type: docs
    minutes: 15
  - title: W3C Trace Context
    url: https://www.w3.org/TR/trace-context/
    source: W3C
    type: docs
    minutes: 20
---

## In one line

A trace is one request's whole journey as a tree of timed spans, and it only works if the trace ID crosses every process, queue and await boundary along the way.

## What it is

A **span** is a unit of work with a name, a start and end, attributes, and a parent. A **trace** is the tree of spans sharing a trace ID. The payoff is the waterfall view: an 800ms request resolves into 40ms of handler, 30ms of database, and 700ms sitting in a call to a service you'd forgotten was in the path — a question metrics can't answer and logs answer only by manual reconstruction.

**Propagation** is the mechanism, and it's where implementations break. Across HTTP, the W3C `traceparent` header carries the trace and parent span IDs; every outbound client must forward it, which is why the client should be one shared, instrumented module. Across a **queue**, you must put the trace context into the message yourself and restore it in the worker — otherwise the job's spans form a separate orphan trace, and the connection between "user clicked" and "worker failed" is lost. Within a process, `AsyncLocalStorage` carries the active context across `await` boundaries.

**Auto-instrumentation** gets you most of the way: OpenTelemetry's Node instrumentations wrap HTTP, Postgres, Redis and common frameworks, so spans appear without touching handler code. Add manual spans only where the business operation is meaningful — "rank results", "call model" — and attach attributes that make traces filterable: `user.id`, `tenant.id`, `model`, `tokens`.

**Sampling** is what makes tracing affordable. Head sampling decides at the start (keep 1%), is simple, and throws away most errors — because errors are rare, which is exactly why they're interesting. **Tail sampling** decides after the trace completes, so you can keep everything slow or failed plus a sample of the healthy ones. That's usually the policy you want, and it costs more infrastructure. Whatever you choose, the sampling decision must propagate, or you get half-traces.

Tie the three signals together: put `trace_id` on every log line and exemplars on metrics. Then a spike on a dashboard leads to a trace, and the trace leads to the log lines from the exact request — which is the actual workflow observability exists to support.

## Why it matters

Once a request touches more than one service — an API, a worker, a model provider — traces are the only practical way to answer "where did the time go". For AI products this is doubly true: a single user turn fans out into retrieval, several model calls and tool executions, and per-step latency and cost only make sense as a trace.

## Key points

- A trace is a tree of spans sharing an ID; its value is showing where the time actually went.
- `traceparent` must be forwarded on every outbound call, which argues for one shared HTTP client.
- Queue messages need trace context embedded manually, or background work becomes an orphan trace.
- `AsyncLocalStorage` is what keeps context alive across awaits inside a Node process.
- Auto-instrumentation covers the infrastructure; add manual spans for business-meaningful operations.
- Head sampling discards most errors; tail sampling keeps slow and failed traces and costs more to run.
- The sampling decision propagates with the context — inconsistent sampling produces broken traces.
- Log the `trace_id` on every line so metrics, traces and logs form one navigable path.
