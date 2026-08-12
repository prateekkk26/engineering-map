---
title: Latency Numbers Worth Knowing
summary: What each hop in a request actually costs, so you can tell which part of a design is slow before you build it.
level: core
minutes: 15
order: 4
tags: [system-design, latency, performance]

related:
  - system-design/design-fundamentals/back-of-the-envelope-estimation
  - system-design/scalability/multi-region-architecture
  - cs-fundamentals/networking/latency-bandwidth-and-the-speed-of-light

resources:
  - title: Latency Numbers Every Programmer Should Know
    url: https://gist.github.com/jboner/2841832
    source: Jeff Dean / Peter Norvig
    type: article
    minutes: 5
    primary: true
  - title: Latency Numbers Every Programmer Should Know — interactive
    url: https://colin-scott.github.io/personal_website/research/interactive_latency.html
    source: Colin Scott
    type: article
    minutes: 10
  - title: Latency Is Everywhere and It Costs You Sales
    url: https://highscalability.com/latency-is-everywhere-and-it-costs-you-sales-how-to-crush-it/
    source: High Scalability
    type: article
    minutes: 20
---

## In one line

Memory is nanoseconds, disk and local network are microseconds to milliseconds, and crossing an ocean is over a hundred milliseconds — and no amount of engineering changes the last one.

## What it is

The orders of magnitude, which is all you need:

| Operation | Rough cost |
|---|---|
| L1 / main memory reference | ~1ns / ~100ns |
| Compress 1KB | ~1–3µs |
| SSD random read | ~100µs |
| Read 1MB sequentially from memory | ~100µs |
| Round trip within a datacentre | ~0.5ms |
| Read 1MB from SSD | ~1ms |
| Disk seek (spinning) | ~10ms |
| Round trip US East ↔ US West | ~60ms |
| Round trip US ↔ Europe | ~80–150ms |

Three consequences do all the work in a design round.

**Network round trips dominate everything else.** A request that makes six sequential service calls inside a datacentre has spent 3ms on network before any work happens; the same six calls across regions is nearly a second. This is why chatty designs are bad and why fan-out is done in parallel.

**The speed of light is a hard floor.** Light in fibre travels roughly 200,000 km/s, and real routes are not straight. London to Virginia is ~5,800km, so ~30ms one way at best, ~60–80ms round trip in practice. You cannot cache, optimise or scale your way past it — you can only move the data closer, which is the entire argument for CDNs and regional replicas.

**Disk versus memory is roughly 1,000×, and sequential versus random is roughly 100×.** That gap is why caches exist, why databases work so hard to make access sequential, and why "it fits in RAM" is a legitimate architectural answer.

**Percentiles, not averages.** p50 tells you nothing about the experience of a system with fan-out: if one request calls ten services in parallel and each has a 1% chance of being slow, roughly 10% of requests hit a slow path. Tail latency is the number that gets designed against.

## Why it matters

These numbers are how you argue rather than assert. "That'll be slow" is an opinion; "that's six sequential cross-region calls, so about half a second before we do any work" is an argument the interviewer can't wave away. They also stop you from optimising the wrong layer — shaving 2ms of CPU off a handler that makes a 120ms transatlantic call is wasted effort, and noticing that out loud is a senior signal.

## Key points

- Memory ~100ns, SSD read ~100µs, same-datacentre round trip ~0.5ms, transatlantic ~100ms — four orders of magnitude apart.
- Sequential network round trips are the usual latency budget killer; parallelise fan-out or batch the calls.
- Cross-region latency is bounded by physics, so the only fix is moving data or compute closer to the user.
- Memory beats disk by roughly 1,000×, and sequential access beats random by roughly 100×.
- Fan-out amplifies tail latency: p99 of the slowest dependency becomes p90 of your request.
- Design against p99, not the average — averages hide exactly the requests users complain about.
