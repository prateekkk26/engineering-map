---
title: Core Web Vitals
summary: LCP, INP and CLS — what each actually measures, the thresholds, and why the field number never matches your laptop.
level: core
minutes: 25
order: 1
tags: [performance, metrics, seo]

related:
  - frontend/performance/lab-vs-field-measurement
  - frontend/performance/inp-and-long-tasks
  - frontend/browser-platform/critical-rendering-path

resources:
  - title: Web Vitals
    url: https://web.dev/articles/vitals
    source: web.dev
    type: article
    minutes: 25
    primary: true
  - title: Largest Contentful Paint (LCP)
    url: https://web.dev/articles/lcp
    source: web.dev
    type: article
    minutes: 20
  - title: Interaction to Next Paint (INP)
    url: https://web.dev/articles/inp
    source: web.dev
    type: article
    minutes: 25
  - title: Cumulative Layout Shift (CLS)
    url: https://web.dev/articles/cls
    source: web.dev
    type: article
    minutes: 20
---

## In one line

Three metrics stand in for three user complaints — it took too long to show up, it did not respond when I tapped, and it moved while I was reading.

## What it is

**LCP** measures when the largest visible element — usually a hero image, a video poster, or a big block of text — finishes rendering. Good is under 2.5 seconds at the 75th percentile. It is a proxy for "the page looks ready". Its causes decompose into four: slow server response, render-blocking resources, slow resource load, and client-side rendering delay. Knowing which of the four dominates is the entire diagnosis, and the LCP breakdown in DevTools gives it to you directly.

**INP** replaced FID in March 2024 and is much harder to pass. FID only measured *input delay* — the wait before the handler started — so a page could score well while every interaction produced a frozen second. INP measures the full duration from interaction to the next painted frame, across all interactions in the session, reporting close to the worst. Good is under 200ms. Causes: long tasks blocking the main thread, expensive event handlers, and heavy re-render work.

**CLS** measures unexpected layout movement, scored as impact fraction times distance fraction, summed over the worst session window. Good is under 0.1. The causes are a short and boringly consistent list: images without dimensions, ads and embeds with no reserved space, web fonts swapping in at a different size, and content injected above what the user is reading.

Two things about the numbers themselves. They are reported at the **75th percentile** of real users, not the median or your machine — so the target is the experience of a slow quarter of your traffic. And they are **field** data from CrUX, collected on real devices and networks, which is why a Lighthouse score of 98 sits happily next to failing vitals.

They also affect search ranking, which is why these particular three come up in conversations far outside engineering.

## Why it matters

This is the shared vocabulary for performance across engineering, product, and marketing, so being fluent means being able to translate "the site feels slow" into a specific metric with a known cause list.

Interviewers ask for the three by name and their thresholds, then follow up on INP specifically, because it is the newest and the one most people have not internalised.

## Key points

- LCP under 2.5s: decompose into server time, render blocking, resource load, and render delay before optimising.
- INP under 200ms measures interaction to next paint, not just input delay — far stricter than the FID it replaced.
- CLS under 0.1, and its causes are almost always missing dimensions, unreserved ad slots, font swaps, or injected content.
- All three are judged at the 75th percentile of real users, not on your machine.
- Field data comes from CrUX; a perfect Lighthouse score does not mean passing vitals.
- These feed search ranking, which is why they get attention beyond the engineering team.
