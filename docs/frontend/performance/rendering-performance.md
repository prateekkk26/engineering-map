---
title: Rendering Performance
summary: Holding 60fps — the frame budget, what runs inside it, and which work you can move off the critical path.
level: core
minutes: 20
order: 8
tags: [performance, rendering, animation]

related:
  - frontend/browser-platform/compositing-and-gpu-layers
  - frontend/browser-platform/layout-thrashing-and-forced-reflow
  - frontend/css/animation-and-compositor-performance

resources:
  - title: Rendering performance
    url: https://web.dev/articles/rendering-performance
    source: web.dev
    type: article
    minutes: 25
    primary: true
  - title: Optimize CSS background image sprites
    url: https://developer.chrome.com/docs/devtools/rendering
    source: Chrome DevTools
    type: docs
    minutes: 20
  - title: content-visibility
    url: https://web.dev/articles/content-visibility
    source: web.dev
    type: article
    minutes: 25
---

## In one line

At 60Hz you have about 16ms per frame and the browser needs part of it, so roughly 10ms of your own work per frame is the budget everything else is measured against.

## What it is

Each frame runs the same pipeline: JavaScript, style recalculation, layout, paint, composite. Skip work and you skip steps — changing only `transform` jumps straight to composite. Change a geometric property and you run all five, for every affected element, every frame.

The frame budget is unforgiving. On a 120Hz display it is 8ms. Overrun it and a frame is dropped, which the user perceives as stutter — and dropped frames during scroll or drag are far more noticeable than a slow load, because the feedback loop is immediate.

The main sources of overrun, in the order they usually appear. A scroll or `mousemove` handler doing real work on every event — throttle to `requestAnimationFrame`, so at most one run per frame. Animating layout-triggering properties instead of `transform` and `opacity`. Forced synchronous layout from interleaved reads and writes. Style recalculation across a huge tree, which descendant-heavy selectors and deep DOM make worse. And large paint areas, particularly with shadows, filters, and blurs, which are expensive per pixel.

Containment is the strongest structural tool. `contain: layout paint` tells the browser a subtree cannot affect anything outside it, so layout and paint work stays scoped. `content-visibility: auto` goes further and skips rendering entirely for off-screen content, with `contain-intrinsic-size` supplying a placeholder height so the scrollbar behaves — for long pages this can be a larger win than any amount of JavaScript tuning.

Diagnose with the Rendering panel: paint flashing shows what is repainting (a green flash over the whole viewport during a small update is the signal), layer borders show promotion, and the FPS meter shows dropped frames live.

One honest note: not everything needs 60fps. A one-off transition that takes 20ms too long is invisible; a scroll handler that misses by 2ms is obvious. Spend the effort on continuous interactions.

## Why it matters

Janky scrolling and stuttering drag are among the most-reported "the app feels cheap" complaints, and they are almost always one of the five causes above.

The frame budget is also a good interview anchor: quoting 16ms and describing the pipeline shows you think in terms of what the browser actually does per frame.

## Key points

- 16ms per frame at 60Hz, 8ms at 120Hz, and the browser needs part of it — budget around 10ms of your own work.
- The pipeline is JavaScript, style, layout, paint, composite; `transform` and `opacity` skip to the last step.
- Throttle high-frequency handlers to `requestAnimationFrame` so they run at most once per frame.
- Interleaved reads and writes force synchronous layout inside the frame.
- `contain` scopes layout and paint to a subtree; `content-visibility: auto` skips off-screen rendering entirely.
- Paint flashing, layer borders, and the FPS meter in the Rendering panel show the problem directly.
- Prioritise continuous interactions — scroll and drag — over one-off transitions.
