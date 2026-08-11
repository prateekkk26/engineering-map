---
title: Circuit Breakers & Bulkheads
summary: Two patterns for stopping one broken dependency from consuming your service — fail fast when it's down, and cap what it can consume when it's slow.
level: core
minutes: 20
order: 4
tags: [reliability, resilience, patterns]

related:
  - system-design/reliability-and-operations/timeouts-retries-and-backoff
  - system-design/reliability-and-operations/graceful-degradation-and-load-shedding
  - system-design/distributed-systems/partial-failure-and-failure-detection

resources:
  - title: Circuit Breaker
    url: https://martinfowler.com/bliki/CircuitBreaker.html
    source: Martin Fowler
    type: article
    minutes: 20
    primary: true
  - title: Bulkhead Pattern
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead
    source: Microsoft
    type: docs
    minutes: 15
  - title: Release It! — Stability Patterns
    url: https://pragprog.com/titles/mnee2/release-it-second-edition/
    source: Michael Nygard
    type: book
---

## In one line

A circuit breaker stops calling a dependency that's clearly broken; a bulkhead caps how much of your capacity any one dependency can hold, so its slowness can't consume the whole service.

## What it is

**Circuit breaker.** Track failures for a dependency. Three states:

- *Closed* — normal; calls pass through, failures are counted.
- *Open* — the failure rate crossed a threshold, so calls fail immediately without being attempted. Two benefits: your callers get a fast, predictable error instead of waiting out a timeout, and the struggling dependency gets a break instead of continued load.
- *Half-open* — after a cooldown, let a small number of trial requests through. Success closes the circuit; failure re-opens it.

Trip on a failure *rate* over a window with a minimum request count, not on a raw count — otherwise low-traffic endpoints trip on two unlucky requests. Per-dependency, and often per-endpoint, since a service can be fine for reads and broken for writes.

**The important design question is what you do while it's open.** A breaker converts a slow failure into a fast one; it doesn't produce an answer. Serve stale cache, a default value, a reduced response, or an honest error — decided per call site. "Open the circuit" without saying what the user sees is half an answer.

**Bulkheads.** Named after ship compartments: partition resources so flooding one compartment doesn't sink the vessel. Concretely — a separate connection pool and a bounded concurrency limit per dependency, separate thread pools or worker pools per workload class, separate queues per priority. Without them, one slow dependency gradually occupies every worker in your service, and requests that don't touch it at all start failing. That's the mechanism behind a surprising number of "everything went down but only one thing was broken" incidents.

**They compose.** Bulkhead caps the damage while it's happening, breaker stops the calls once it's clearly broken, timeout bounds each attempt, retry-with-backoff handles the transient case, and a degraded response covers the user experience. In a design round, naming that stack in order for one dependency is a compact way to show you've operated systems.

**Don't hand-roll it.** Use a library or the service mesh; the state machine is easy to get subtly wrong, and the metrics it exposes are half the value.

## Why it matters

These are the standard answers to "what happens when this third-party API goes down", which is asked in nearly every design involving payments, email, or model providers. For AI products it's concrete and current: provider outages and latency spikes are frequent, and a breaker plus a fallback model plus a degraded mode is the expected architecture.

## Key points

- A breaker fails fast when a dependency is broken, sparing your threads and its recovery.
- Closed, open, half-open — half-open probes are what let it recover automatically.
- Trip on failure rate over a window with a minimum sample, not on a raw failure count.
- Always define the fallback: stale cache, default, reduced response, or an explicit error.
- Bulkheads bound the resources one dependency can hold, so its slowness stays contained.
- Separate pools and queues per dependency and per workload class are the practical implementation.
- Timeout, bulkhead, breaker, backoff, fallback is the full stack for one risky dependency.
- Use an existing implementation — the metrics matter as much as the state machine.
