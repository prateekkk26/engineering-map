---
title: Backpressure and bounded queues
summary: When a producer outruns a consumer something must give, and choosing what gives is the difference between graceful degradation and a memory-exhaustion crash.
level: core
minutes: 25
order: 4
tags: [concurrency, reliability, fundamentals]

related:
  - cs-fundamentals/concurrency/processes-threads-and-async-io
  - cs-fundamentals/networking/network-failure-modes
  - cs-fundamentals/data-structures/linked-structures-stacks-and-queues

resources:
  - title: Backpressuring in Streams
    url: https://nodejs.org/en/learn/modules/backpressuring-in-streams
    source: Node.js
    type: docs
    minutes: 30
    primary: true
  - title: Queues Don't Fix Overload
    url: https://ferd.ca/queues-don-t-fix-overload.html
    source: Fred Hebert
    type: article
    minutes: 20
  - title: Streams API concepts
    url: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts
    source: MDN
    type: docs
    minutes: 20
  - title: Load shedding
    url: https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/
    source: Amazon Builders' Library
    type: article
    minutes: 25
---

## In one line

Backpressure is the signal that flows backwards from an overwhelmed consumer telling the producer to slow down, and a queue without a bound is that signal being ignored until memory runs out.

## What it is

Every pipeline has a rate mismatch somewhere: a socket delivering faster than you can parse, a file read faster than you can write, a user typing faster than the API responds, a producer publishing faster than workers consume. When the mismatch persists, exactly four options exist, and a system that has not chosen one has chosen the first by default.

**Buffer** — hold the excess. Fine for a burst, fatal for a sustained mismatch, because an unbounded buffer is a memory leak with a queue's name on it. This is the failure that looks like a healthy service until it is OOM-killed.

**Block or slow the producer** — real backpressure. The consumer refuses to accept more until it has capacity, and the pressure propagates upstream. Node streams do this with the `write()` return value and the `drain` event, and `pipe`/`pipeline` handle it for you, which is the entire reason to prefer them over manual `on('data')` loops. Web Streams do it via the reader's `desiredSize`. TCP does it with its receive window.

**Drop** — shed load. Discard the oldest, the newest, or a sampled fraction. Correct for data where freshness beats completeness: telemetry, mouse-move events, video frames, log lines. Explicit shedding at the edge, returning 429 or 503 fast, keeps a service alive under overload where queueing everything does not.

**Reject** — refuse the work and tell the caller, with a rate limit or a bounded queue that returns "full". Honest, and it lets the client retry with backoff.

The frontend versions of this are familiar under different names. Debounce is dropping all but the last event; throttle is rate-limiting the producer; a concurrency-limited fetch pool is a semaphore; virtualising a list is refusing to render work the consumer cannot handle. Cancelling superseded requests with `AbortController` is load shedding.

The rule that generalises: **every queue must be bounded, and every bound must have a defined behaviour when reached**. "It won't fill up" is not a policy. The other rule is that queues trade latency for throughput — a deep queue absorbs bursts but every item in it waits, so if you care about tail latency, keep queues shallow and shed instead.

## Why it matters

Unbounded queues are a top cause of production outages, and the failure is delayed and confusing: everything looks fine, latency climbs, then the process dies. In interviews this is the question hiding behind "what happens if the consumer is slower than the producer?" during a system design round, and the expected answer names the four options and picks one with a reason.

## Key points

- The only four responses to a rate mismatch are buffer, block, drop, and reject — not choosing means buffering until you crash.
- An unbounded queue is a memory leak that presents as a healthy service right up until the process is killed.
- Real backpressure propagates upstream; Node's `pipeline`, Web Streams' `desiredSize`, and TCP's receive window are all the same mechanism.
- Dropping is correct when freshness beats completeness — telemetry, pointer events, and frames should be shed, not queued.
- Fast rejection with 429 or 503 preserves a service under overload better than accepting work you cannot complete.
- Debounce, throttle, and a concurrency-limited fetch pool are frontend backpressure by other names.
- Deep queues raise tail latency even when throughput looks fine, because every queued item waits behind the whole queue.
- Give every queue an explicit bound and an explicit overflow policy; "it will not fill up" is an assumption, not a design.
