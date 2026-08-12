---
title: Profiling with DevTools
summary: Reading a performance trace — main thread, long tasks, layout and paint — and finding the cause rather than guessing.
level: core
minutes: 25
order: 3
tags: [performance, tooling, debugging]

related:
  - frontend/react/profiling-react-performance
  - frontend/performance/diagnosing-a-slow-page
  - frontend/browser-platform/layout-thrashing-and-forced-reflow
  - frontend/javascript/engine-internals-and-optimisation

resources:
  - title: Analyze runtime performance
    url: https://developer.chrome.com/docs/devtools/performance
    source: Chrome DevTools
    type: docs
    minutes: 30
    primary: true
  - title: Performance panel insights
    url: https://developer.chrome.com/docs/devtools/performance/reference
    source: Chrome DevTools
    type: docs
    minutes: 30
  - title: Network panel
    url: https://developer.chrome.com/docs/devtools/network
    source: Chrome DevTools
    type: docs
    minutes: 25
---

## In one line

Record the interaction that is actually slow, find the long task, read down its call stack to the widest frame — and throttle first, because your laptop hides everything.

## What it is

Start by making the machine honest. Enable 4x or 6x CPU throttling and network throttling before recording, or you will profile a device no user owns. Use an incognito window so extensions do not appear in the trace, and profile a production build — development builds and Strict Mode double-rendering distort everything.

The **Performance panel** trace has a few bands worth reading in order. The *timings* track marks LCP, DCL, and load. The *main thread* flame chart shows what ran and for how long; wide blocks are the story, and anything over 50ms is a **long task**, flagged with a red triangle. Reading down the stack from a wide block to its widest child is the whole technique — the leaf is where the time went.

Colour tells you the category: yellow is scripting, purple is style and layout, green is paint and composite. A purple block with a warning is a forced synchronous layout, and the trace names the line that caused it.

The **Insights** sidebar in modern Chrome does a lot of this reading for you now, calling out render-blocking requests, LCP breakdown by phase, forced reflows, and duplicated JavaScript. It is the fastest starting point.

The **Network panel** answers a different set of questions: waterfall shape, whether requests are serialised, time to first byte, and what is blocking the start of a download. A staircase there is a request waterfall; a long green bar is server time, not frontend time.

Two more tools worth knowing. The **Rendering** panel's paint flashing and layer borders show what is repainting during an interaction. And the **Memory** panel's heap snapshot comparison is how you confirm a leak — take a snapshot, exercise the feature, snapshot again, and look at detached DOM nodes.

The discipline that makes all of this work: form a hypothesis, change one thing, re-record, compare. Profiling without a hypothesis produces a lot of screenshots and no fix.

## Why it matters

"Here is a slow page, find out why" is a common live exercise, and it is testing method — throttle, record, read the stack — far more than tool trivia.

In real work it is the difference between a targeted fix and a week of speculative optimisation.

## Key points

- Throttle CPU and network and use a production build in incognito, or the trace describes a machine nobody has.
- Long tasks over 50ms are the unit of investigation; read down the flame chart to the widest leaf.
- Yellow is script, purple is layout, green is paint — a purple warning block is a forced reflow with the cause named.
- The Insights sidebar automates most first-pass analysis, including LCP phase breakdown.
- Use the Network waterfall for serialisation and TTFB questions; a long green bar is backend time.
- Paint flashing and layer borders diagnose repaint problems; heap snapshot diffs confirm leaks via detached nodes.
- Always profile against a hypothesis and re-record after each change.
