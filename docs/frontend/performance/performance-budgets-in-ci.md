---
title: Performance Budgets in CI
summary: Turning performance from a periodic cleanup into a build constraint that fails a pull request.
level: core
minutes: 20
order: 15
tags: [performance, ci, process]

related:
  - frontend/performance/javascript-bundle-budgets
  - frontend/tooling/ci-cd-for-frontend
  - frontend/performance/lab-vs-field-measurement

resources:
  - title: Performance budgets 101
    url: https://web.dev/articles/performance-budgets-101
    source: web.dev
    type: article
    minutes: 20
    primary: true
  - title: Lighthouse CI
    url: https://github.com/GoogleChrome/lighthouse-ci
    source: Google Chrome
    type: repo
  - title: size-limit
    url: https://github.com/ai/size-limit
    source: Andrey Sitnik
    type: repo
---

## In one line

Performance regresses one pull request at a time, so the only durable fix is a threshold enforced by CI rather than a quarterly optimisation push.

## What it is

The failure pattern is consistent. A team spends two weeks making the app fast, then over the next six months each individual change adds twenty kilobytes and thirty milliseconds — each defensible in isolation — until the app is slower than before the optimisation. Nobody made a bad decision; there was simply no forcing function.

A budget is that forcing function. Three kinds are worth having, in increasing order of setup cost.

**Bundle size**, per route or per entry point, checked with `size-limit` or bundlesize. Cheapest, most deterministic, and catches the most common regression. Enforce uncompressed size, since that drives parse and execute cost.

**Lighthouse CI**, running against a preview deployment with assertions on metrics and category scores. Broader coverage than bundle size, but synthetic scores are noisy — run multiple times and assert on medians, or you will spend your time re-running flaky builds.

**Field data alerting**, from RUM, watching the 75th percentile per route after release. This is the only one measuring reality, but it is a lagging indicator: it tells you a regression shipped, not that one is about to.

The process design matters as much as the tooling. Make the failure message actionable — "main bundle 245KB, budget 220KB, +18KB from `date-fns`" is useful; "budget exceeded" starts an argument. Have a documented path to raise a budget deliberately, because a threshold that cannot be changed gets bypassed. And report the delta on every PR even when it passes, so the trend is visible before it becomes a violation.

Set the initial numbers slightly below current values rather than at some aspirational target — a budget that fails on day one gets disabled on day two.

## Why it matters

Performance is a ratchet that only turns one way without enforcement, and every team that has done a big optimisation project has watched it erode.

It also signals seniority in interviews: proposing a budget in CI is a process answer to a technical problem, which is the kind of thinking senior roles are hired for.

## Key points

- Regressions arrive one reasonable pull request at a time; only automated enforcement stops the drift.
- Bundle-size budgets per route are the cheapest and most deterministic check — assert on uncompressed size.
- Lighthouse CI covers more but is noisy; assert on medians of repeated runs against a preview deploy.
- RUM alerting on the p75 is the only measure of reality, but it is lagging.
- Failure messages must name the metric, the budget, and the likely cause to be actionable.
- Provide a deliberate path to raise a budget, or teams will route around it.
- Start budgets just below current values so the first build passes.
