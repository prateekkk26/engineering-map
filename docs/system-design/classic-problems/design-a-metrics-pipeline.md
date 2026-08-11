---
title: Design a Metrics Pipeline
summary: Ingesting a firehose of events and answering aggregate queries fast — pre-aggregation, time-series storage, and cardinality as the thing that kills you.
level: core
minutes: 25
order: 9
tags: [system-design, classic-problem, data]

related:
  - system-design/building-blocks/event-logs-and-stream-processing
  - data/data-pipelines/batch-vs-streaming
  - system-design/reliability-and-operations/observability-at-design-altitude

resources:
  - title: Monarch — Google's Planet-Scale In-Memory Time Series Database
    url: https://research.google/pubs/monarch-googles-planet-scale-in-memory-time-series-database/
    source: Google Research
    type: article
    minutes: 45
  - title: Prometheus — Storage and Data Model
    url: https://prometheus.io/docs/prometheus/latest/storage/
    source: Prometheus
    type: docs
    minutes: 20
    primary: true
  - title: Lambda Architecture and Its Discontents
    url: https://www.oreilly.com/radar/questioning-the-lambda-architecture/
    source: Jay Kreps / O'Reilly
    type: article
    minutes: 20
---

## In one line

Writes arrive constantly and queries are always aggregates over time ranges, so you pre-aggregate on ingest and store rollups rather than keeping every raw point queryable forever.

## What it is

**Scope.** Clients emit counters, gauges and timings with dimensions (service, endpoint, region, tenant). Users query aggregates over time ranges and group by dimensions, and alerts evaluate continuously. Ask about retention and query granularity early — "raw for 7 days, one-minute rollups for 30, one-hour for a year" is the shape of the answer and it decides the storage design.

**Estimate.** 1,000 services × 100 metrics × one point every 10 seconds = 10M points/minute ≈ 170K writes/second. **Extremely write-heavy, append-only, immutable, time-ordered** — which is a completely different profile from an OLTP system and the reason a general-purpose database is the wrong tool.

**Ingest.** Agents batch locally and push, or you scrape endpoints on an interval (Prometheus's model — pull gives you a free liveness signal and avoids a stampede on your ingest tier). Buffer through a log like Kafka so ingestion is decoupled from storage and a storage outage costs you a backlog rather than data. Sample or drop at the edge under overload, and be explicit that metrics are lossy by design — a dropped data point is acceptable, and that assumption is what lets everything else be fast.

**Cardinality is the whole problem.** A time series is the unique combination of metric name and all its label values. Adding `user_id` as a label to a metric turns one series into millions, and cardinality — not write volume — is what takes down time-series databases. The rule: labels must be bounded and low-cardinality (service, endpoint, status code, region). High-cardinality dimensions belong in traces or a wide-event store, not in metrics. Being the person who says this unprompted is a strong signal.

**Storage.** A purpose-built time-series store — columnar, chunked by time window, heavily compressed (delta-of-delta encoding on timestamps, XOR on float values, which achieves remarkable ratios), with the recent window in memory and older chunks on disk or object storage. Partition by time so expiring old data is dropping a chunk, not deleting rows.

**Pre-aggregation and downsampling.** Compute rollups (per minute, per hour) as data arrives and store those alongside; a query over 30 days reads hourly rollups, not 260M raw points. Retention tiers delete raw data early and keep rollups longer. Percentiles need care: **you cannot average percentiles across rollups** — store histograms (bucketed counts, which do merge correctly) rather than precomputed p99 values. That detail is a favourite follow-up.

**Query and alerting.** Time-bounded, aggregated queries with limits; a query that would scan too much should be rejected rather than run. Alert rules evaluate on a schedule over the same store, and alert state (firing, resolved, silenced) needs its own durable storage.

## Why it matters

It's the design problem where the storage profile genuinely differs from everything else in the section, so it tests whether you choose systems by access pattern. Cardinality is the specific, hard-won insight, and it applies directly to instrumenting your own services — the same mistake (adding a user ID label) is one people make in real work every year.

## Key points

- Metrics are append-only, immutable and time-ordered — a profile that justifies a specialised store.
- Buffer ingest through a log so storage problems become backlogs rather than data loss.
- Metrics are lossy by design; dropping points under overload is acceptable and enables the rest.
- Cardinality, not write volume, is what kills time-series systems — keep label values bounded.
- High-cardinality dimensions like user or request ID belong in traces or wide events, not metrics.
- Chunk storage by time window so expiry is a chunk drop and compression works on similar data.
- Pre-aggregate rollups on ingest and query them for long ranges instead of raw points.
- Store histograms, not precomputed percentiles — percentiles can't be averaged across rollups.
- Reject queries that would scan more than a bound rather than letting them run.
