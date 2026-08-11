---
title: Batch vs Streaming
summary: Whether to process data on a schedule or as it arrives, and why latency requirements — not fashion — decide it.
level: core
minutes: 20
order: 1
tags: [data, pipelines, architecture]

related:
  - data/data-pipelines/change-data-capture
  - data/data-pipelines/idempotent-jobs-and-data-quality
  - data/choosing-a-datastore/oltp-vs-olap-and-the-warehouse

resources:
  - title: Designing Data-Intensive Applications — Ch. 11, Stream Processing
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
  - title: Questioning the Lambda Architecture
    url: https://www.oreilly.com/radar/questioning-the-lambda-architecture/
    source: Jay Kreps
    type: article
    minutes: 20
  - title: Kafka — Introduction
    url: https://kafka.apache.org/documentation/#introduction
    source: Apache Kafka
    type: docs
    minutes: 25
---

## In one line

Batch processes a bounded set of data on a schedule; streaming processes an unbounded flow as it arrives, and everything else follows from that difference.

## What it is

**Batch** — a job runs hourly or nightly over a defined window. It is simpler in every way that matters operationally: reruns are trivial, the input is fixed so results are reproducible, failures are retried by running it again, and testing is straightforward because you can hold the input still. Most reporting, billing, nightly aggregation and bulk embedding jobs are batch, and should be.

**Streaming** — records are processed within seconds of arriving, usually via a log like Kafka (or Kinesis, Pub/Sub, Redpanda). You need this when the latency requirement is genuinely low: fraud checks, live dashboards, presence, real-time personalisation, alerting.

Streaming brings a specific set of problems batch does not have. **Late and out-of-order events** — a mobile client that was offline sends yesterday's events today — which forces a distinction between *event time* (when it happened) and *processing time* (when you saw it), and introduces **watermarks** and **windowing** (tumbling, sliding, session) to decide when a window is closed. **State** must be kept somewhere durable and recovered on restart. **Replay** means reprocessing from an offset rather than rerunning a job. And **at-least-once delivery** means consumers must be idempotent.

The honest framing for an interview: **start with batch, and move the specific paths that need low latency to streaming.** A nightly job plus a small realtime path is a common, defensible architecture. The Lambda architecture — a batch layer and a speed layer computing the same things — is mostly a warning about maintaining two implementations of the same logic; Kappa's answer is to stream everything and replay the log when logic changes.

At product scale, note that a lot of "streaming" is really **micro-batch**: a job every minute over recent rows. That gets you most of the latency benefit with none of the state and windowing machinery, and it is very often the right call.

## Why it matters

"How would you get this data into the dashboard?" is a common design branch, and answering "Kafka" reflexively is a weaker answer than asking what latency the product actually needs. Recognising that event time versus processing time is the real complexity in streaming — not throughput — is the senior signal here.

## Key points

- Batch has a bounded input, which makes reruns, reproducibility and testing easy; that simplicity is its main advantage.
- Streaming is justified by a latency requirement, and should be scoped to the paths that have one.
- Event time and processing time diverge whenever clients can be offline, and windowing must be based on event time.
- Streaming systems need durable state, checkpoints and a replay story from a log offset.
- Delivery is at-least-once, so stream consumers must be idempotent by construction.
- Lambda architecture duplicates business logic in two places; treat that duplication as the primary cost.
- Micro-batching every minute captures most of the value of streaming with a fraction of the complexity.
