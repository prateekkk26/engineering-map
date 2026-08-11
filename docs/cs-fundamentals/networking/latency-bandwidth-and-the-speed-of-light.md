---
title: Latency, bandwidth, and the speed of light
summary: Bandwidth keeps improving and round-trip time does not, which is why most web performance work is about removing round trips rather than bytes.
level: core
minutes: 20
order: 6
tags: [networking, performance, fundamentals]

related:
  - cs-fundamentals/networking/proxies-cdns-and-the-network-edge
  - cs-fundamentals/complexity/when-complexity-lies
  - frontend/performance/network-and-delivery

resources:
  - title: Primer on Latency and Bandwidth
    url: https://hpbn.co/primer-on-latency-and-bandwidth/
    source: High Performance Browser Networking
    type: book
    primary: true
  - title: Latency — the new web performance bottleneck
    url: https://www.igvita.com/2012/07/19/latency-the-new-web-performance-bottleneck/
    source: Ilya Grigorik
    type: article
    minutes: 20
  - title: Bandwidth-delay product
    url: https://en.wikipedia.org/wiki/Bandwidth-delay_product
    source: Wikipedia
    type: docs
    minutes: 10
  - title: Network throttling in DevTools
    url: https://developer.chrome.com/docs/devtools/network/reference
    source: Chrome DevTools
    type: docs
    minutes: 15
---

## In one line

Latency is how long one round trip takes and bandwidth is how much fits per second — and since latency is bounded by physics while bandwidth is bounded by engineering, latency is the one that stays expensive.

## What it is

Light in fibre travels at roughly two-thirds of `c`, so London to New York is about 28ms one way in the best possible case, ~56ms round trip, before any router, queue, or processing. Real-world RTT on that path is 70–90ms. You cannot optimise this. Doubling someone's bandwidth from 5 to 10 Mbps barely changes page load time; halving their RTT changes it dramatically, and that result is well established.

Latency is composed of propagation delay (distance ÷ speed), transmission delay (bytes ÷ bandwidth), queuing delay in routers and buffers, and processing delay. Only the second one gets better with a fatter pipe. And the numbers that matter for design span orders of magnitude: an L1 cache reference is ~1ns, main memory ~100ns, an SSD read ~100µs, a same-datacentre round trip ~0.5ms, and a cross-continent round trip ~100ms+. Mobile adds its own tax — a radio in idle state needs to be woken, which can add 100ms or more before a request even begins.

The design consequence is that **round trips are the unit of cost**. A page that makes six sequential dependent requests on a 100ms RTT link spends 600ms doing nothing but waiting, regardless of payload size. That is why the fixes look the way they do: parallelise instead of chaining, batch multiple resources into one request, move the origin closer with a CDN, reuse warm connections, and prefetch or preconnect to pay the setup cost before it's on the critical path. It is also the strongest argument for server-side rendering and for RSC-style data fetching — collapsing a waterfall of client-initiated requests into one server round trip where the hops are datacentre-local.

Bandwidth still matters for large payloads — video, images, big JavaScript bundles — and for congested or metered mobile connections. But the crossover is real: below a few hundred kilobytes, an extra round trip usually costs more than an extra hundred kilobytes.

Test accordingly. Development on localhost has ~0ms latency, which hides every waterfall you have. Throttle to a realistic profile before believing a number.

## Why it matters

"Why is our app slow for users in Australia" has one answer, and it is not the bundle size. Recognising a request waterfall — sequential dependent fetches — and knowing that each link costs a full RTT is the diagnosis behind a large share of real performance work, and it is the reasoning that justifies a CDN, a batched endpoint, or moving fetching to the server.

## Key points

- Propagation delay is bounded by the speed of light in fibre, so distance sets a floor no engineering removes.
- Increasing bandwidth has sharply diminishing returns on page load; reducing round-trip time does not.
- Round trips, not bytes, are the unit of cost for anything under a few hundred kilobytes.
- A chain of dependent requests costs one RTT per link — parallelise, batch, or move the fetching server-side.
- A CDN's primary benefit is shortening physical distance, which reduces RTT for every phase including TLS setup.
- Mobile radios add a wake-up penalty before the first byte, so request count hurts more on cellular than the numbers suggest.
- Localhost development hides latency entirely; throttle the network before trusting any measurement.
- Know the orders of magnitude — nanoseconds for cache, microseconds for SSD, milliseconds for the network — and design to avoid crossing a boundary unnecessarily.
