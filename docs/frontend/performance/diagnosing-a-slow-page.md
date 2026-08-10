---
title: Diagnosing a Slow Page
summary: A repeatable order of investigation for "it feels slow", from measurement to the specific line of code.
level: core
minutes: 25
order: 16
tags: [performance, debugging, process]

related:
  - frontend/performance/profiling-with-devtools
  - frontend/performance/core-web-vitals
  - frontend/tooling/systematic-frontend-debugging

resources:
  - title: Optimize Largest Contentful Paint
    url: https://web.dev/articles/optimize-lcp
    source: web.dev
    type: article
    minutes: 30
    primary: true
  - title: Performance panel insights
    url: https://developer.chrome.com/docs/devtools/performance/reference
    source: Chrome DevTools
    type: docs
    minutes: 30
  - title: How to think about speed tools
    url: https://web.dev/articles/how-to-measure-speed
    source: web.dev
    type: article
    minutes: 20
---

## In one line

Ask which metric is bad before asking what to fix, because "slow" means at least three unrelated problems with three unrelated causes.

## What it is

**Step one: define slow.** Slow to appear is LCP. Slow to respond is INP. Moves around while loading is CLS. Slow after loading, during use, is a runtime rendering problem. These have almost nothing in common, and starting work before answering this is how weeks get spent on the wrong thing.

**Step two: reproduce with the right instrument.** Get field data if it exists — which pages, which devices, which countries. Then reproduce in the lab with CPU and network throttling on a production build in incognito. If you cannot reproduce it, the difference between your setup and theirs is the actual finding.

**Step three: narrow to a phase.** For LCP, use the phase breakdown: TTFB, resource load delay, resource load duration, render delay. Each points somewhere different — a slow server, a late-discovered image, a large file, or client-side rendering. For INP, split into input delay, processing, and presentation. This step converts a vague problem into a bounded one.

**Step four: find the cause in a trace.** Record the specific interaction or load, find the long task or the blocking resource, and read down the call stack to the widest frame. The Insights panel will often name it — render-blocking request, forced reflow, duplicated JavaScript.

**Step five: change one thing and re-measure.** Multiple simultaneous changes make attribution impossible, and half of them are usually neutral.

The usual suspects, worth checking early because they are common and cheap to rule out: a render-blocking third-party script, an unoptimised hero image, a missing `fetchpriority`, no compression on a text response, a request waterfall, an over-large client bundle from a misplaced `'use client'`, and a `useEffect` fetch that could have been server-rendered.

Finally, confirm the fix in the field. A lab improvement that does not move the p75 for real users did not fix the problem you were asked about.

## Why it matters

This is the exercise itself in many interviews — a slow page and a screen share — and it is graded on method rather than on knowing a particular trick.

In real work, the ordered approach is what prevents the common failure of optimising something measurable but irrelevant.

## Key points

- Establish which metric is bad first: appear, respond, shift, or run — they have different causes entirely.
- Use field data to find who and where, then reproduce in the lab with throttling and a production build.
- Break LCP into its four phases and INP into its three parts before looking for a fix.
- Read the trace to the widest frame in the longest task; the Insights panel often names the cause outright.
- Change one thing at a time and re-measure, or you cannot attribute the improvement.
- Rule out the cheap common causes early: blocking third parties, unoptimised hero image, missing compression, request waterfalls.
- Verify against field p75 — a lab-only win is not a fix.
