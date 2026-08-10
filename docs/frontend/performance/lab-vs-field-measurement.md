---
title: Lab vs Field Measurement
summary: Why your synthetic score and your real-user data disagree, and which one to trust for which decision.
level: core
minutes: 20
order: 2
tags: [performance, monitoring, metrics]

related:
  - frontend/performance/core-web-vitals
  - frontend/performance/performance-budgets-in-ci
  - frontend/architecture/frontend-observability

resources:
  - title: Lab and field data
    url: https://web.dev/articles/lab-and-field-data-differences
    source: web.dev
    type: article
    minutes: 20
    primary: true
  - title: web-vitals
    url: https://github.com/GoogleChrome/web-vitals
    source: Google Chrome
    type: repo
  - title: Chrome UX Report
    url: https://developer.chrome.com/docs/crux
    source: Chrome
    type: docs
    minutes: 25
---

## In one line

Lab data is a controlled, repeatable simulation good for catching regressions; field data is what your users actually experienced and is the only thing that tells you whether you have a problem.

## What it is

**Lab** measurement — Lighthouse, WebPageTest, a CI performance job — runs the page on a fixed device profile and a throttled network. Because conditions are fixed, the number is comparable between runs, which is what makes it useful for regression detection. It can also measure things field data cannot, like a cold cache on a specific device.

But it is a simulation of one user: usually a mid-tier phone on simulated 4G, with no extensions, no third-party cookie state, an empty cache, and a single geography. Real users are on hundreds of device classes, on real networks with real packet loss, often with a warm cache, sometimes with an ad blocker, and distributed globally.

**Field** measurement — RUM — instruments real sessions with the `web-vitals` library and reports back. It captures the actual distribution, which is why the 75th percentile is the number that matters: your median user may be fine while a quarter of your traffic is having a bad time, and the average hides both. **CrUX** is Google's public field dataset for Chrome users, available in PageSpeed Insights and BigQuery, which is also how you can see a competitor's real numbers.

The practical division of labour: field data tells you *whether* there is a problem, where, and for whom — by page, device class, country, and connection type. Lab data tells you *why*, because it gives a reproducible trace to profile.

Two common traps. Optimising a lab score that field data does not reflect — the classic being chasing Lighthouse to 100 while INP stays terrible, because synthetic runs barely interact with the page. And under-sampling: RUM on 1% of traffic gives noisy percentiles, so measure enough to be confident before acting.

Segment before concluding. A single global p75 hides that your Android traffic in one region is failing while desktop is fine.

## Why it matters

Teams routinely spend weeks on a lab number that changes nothing for users. Knowing which instrument answers which question is what makes performance work land.

"How do you know your app is fast?" is a standard question, and the strong answer is field data segmented by device and geography, with lab traces for diagnosis.

## Key points

- Lab is repeatable and good for catching regressions; field is real and good for knowing whether a problem exists.
- Lab simulates one device on one connection with a cold cache — none of which describes most of your users.
- Report the 75th percentile from field data; averages hide the users having the worst time.
- CrUX is public Chrome field data, usable for your own site and for competitors.
- Field tells you whether and for whom; lab tells you why, with a reproducible trace.
- Segment by device, country, and connection before drawing conclusions from a single number.
- A perfect Lighthouse score alongside failing INP is the classic sign of optimising the wrong instrument.
