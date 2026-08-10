---
title: INP & Long Tasks
summary: Why interactions feel slow, how the main thread blocks a response, and the techniques that break work into frames.
level: core
minutes: 25
order: 7
tags: [performance, inp, responsiveness]

related:
  - frontend/performance/core-web-vitals
  - frontend/react/concurrent-rendering
  - frontend/browser-platform/web-workers-and-off-main-thread

resources:
  - title: Optimize Interaction to Next Paint
    url: https://web.dev/articles/optimize-inp
    source: web.dev
    type: article
    minutes: 30
    primary: true
  - title: Optimize long tasks
    url: https://web.dev/articles/optimize-long-tasks
    source: web.dev
    type: article
    minutes: 25
  - title: Scheduler.yield()
    url: https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield
    source: MDN
    type: docs
    minutes: 15
---

## In one line

INP measures the whole path from tap to painted response, so it fails when the main thread is busy — before the handler runs, while it runs, or while the resulting render blocks the next frame.

## What it is

Split every interaction into three parts, because the fix differs for each. **Input delay** is the wait before your handler can start, caused by something else already occupying the main thread — a third-party script, a hydration pass, a timer. **Processing time** is your handler itself. **Presentation delay** is the time from the handler finishing to the browser actually painting the update, which is where a large re-render or a forced layout shows up.

Most teams optimise the middle one and are surprised when nothing improves, because the cost was in the other two.

The main lever is **long tasks**: anything occupying the thread for over 50ms. During one, nothing can respond. Breaking them up is the core technique — `scheduler.yield()` is the modern API, which yields to the browser and then continues with priority over other pending work (unlike `setTimeout(0)`, which sends you to the back of the queue). `isInputPending()` lets a loop check whether a user is waiting.

Then the framework-level moves. Mark expensive updates as transitions so typing stays responsive while results re-render at low priority. Defer non-urgent values. Virtualise long lists so an interaction re-renders twenty rows rather than two thousand. Move genuinely CPU-bound work to a worker, which is the only fix that actually removes the work from the thread.

Two habits that matter as much as any API. **Paint first, work second**: update the visible state immediately, then do the heavy part — a checkbox should tick instantly even if the request takes 300ms. And avoid doing work in high-frequency handlers; a `scroll` or `mousemove` handler that measures or sets state on every event will fail INP by itself.

Third parties deserve a specific pass. Tag managers, chat widgets, and session recorders all run on your main thread, and they are frequently the source of input delay you cannot see in your own code.

## Why it matters

INP is the vital most sites fail, and it is the one that maps most directly to "this app feels bad". The threshold — 200ms — is strict enough that it requires deliberate work rather than incidental optimisation.

It is also a common debugging exercise, where the three-part breakdown is what turns a vague complaint into a specific fix.

## Key points

- Split every interaction into input delay, processing, and presentation — the fix depends on which dominates.
- Long tasks over 50ms block all response; breaking them up is the primary technique.
- `scheduler.yield()` yields and resumes with priority, unlike `setTimeout(0)`, which loses its place in the queue.
- Transitions, deferred values, and virtualisation reduce presentation delay by shrinking the render.
- Only a worker actually removes CPU-bound work from the main thread.
- Update the visible state before doing the heavy work, so the UI acknowledges the interaction immediately.
- Third-party scripts are a common invisible source of input delay.
