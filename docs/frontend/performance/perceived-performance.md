---
title: Perceived Performance
summary: Making an app feel fast without making it faster — feedback, optimism, skeletons and the psychology of waiting.
level: core
minutes: 20
order: 14
tags: [performance, ux, psychology]

related:
  - frontend/state-and-data/optimistic-updates-and-rollback
  - frontend/nextjs/streaming-and-loading-ui
  - frontend/performance/core-web-vitals

resources:
  - title: Perceived performance
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Perceived_performance
    source: MDN
    type: docs
    minutes: 20
    primary: true
  - title: Response Times — The 3 Important Limits
    url: https://www.nngroup.com/articles/response-times-3-important-limits/
    source: Nielsen Norman Group
    type: article
    minutes: 15
  - title: Skeleton screens
    url: https://www.nngroup.com/articles/skeleton-screens/
    source: Nielsen Norman Group
    type: article
    minutes: 15
---

## In one line

Users judge speed by feedback and progress, not by elapsed time — so acknowledging an action in 100ms matters more than finishing it in 800.

## What it is

The three thresholds are worth memorising because they define the design targets. **100ms** feels instantaneous — under this, an interaction seems to have direct physical causation. **1 second** keeps the user's flow of thought intact, but they notice the delay. **10 seconds** is the limit of attention; past it, people switch tasks and need re-orienting when they return.

The techniques all work by placing feedback inside those windows rather than reducing the underlying work.

**Immediate acknowledgement.** Any interaction should visibly respond within 100ms even if the result takes longer — the button depresses, the row highlights, the checkbox ticks. This is also why optimistic updates feel dramatically faster despite identical network time.

**Skeletons over spinners.** A skeleton matching the eventual layout communicates what is coming and prevents the shift when it arrives; a centred spinner communicates only "wait". The caveat is that a skeleton whose shape does not match the content is worse than nothing, because it promises the wrong thing.

**Progressive display.** Streaming content in as it becomes available beats an all-or-nothing wait of the same total duration, because progress is visible throughout.

**Prefetching** hides latency completely: fetch on hover or on viewport entry, and the click resolves against a warm cache.

**Honest progress** for long operations. A determinate bar for something with known steps, and for genuinely unknown durations, a message that changes — "uploading", "processing", "almost done" — because a frozen indicator reads as broken regardless of what it is doing.

Two counter-notes. Do not fake progress; users notice a bar that hits 90% and sits there, and it costs trust. And avoid loading states that flash — content arriving in 50ms behind a skeleton that appears for 30ms is worse than no skeleton, so delay showing one by ~200ms.

## Why it matters

This is where frontend work most directly meets product judgement, and it is often the cheapest improvement available: a spinner replaced with a skeleton and an optimistic update can transform how an app feels with no backend change.

Design rounds probe it explicitly — "the API takes 800ms, what do you do?" — and the expected answer is about feedback, not caching.

## Key points

- 100ms feels instant, 1s preserves flow, 10s loses attention — design feedback to land inside those windows.
- Acknowledge every interaction visibly within 100ms even when the result takes longer.
- Skeletons that match the final layout beat spinners and prevent layout shift; mismatched ones mislead.
- Streaming partial content beats an all-or-nothing wait of the same duration.
- Prefetch on hover or viewport entry so the click resolves against a warm cache.
- Use determinate progress where you can and changing status text where you cannot — never fake it.
- Delay loading indicators by ~200ms so fast responses do not flash.
