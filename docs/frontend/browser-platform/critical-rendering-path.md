---
title: The Critical Rendering Path
summary: What the browser does between receiving HTML and painting a pixel, and which steps block each other.
level: core
minutes: 25
order: 1
tags: [browser, rendering, performance]

related:
  - frontend/browser-platform/layout-thrashing-and-forced-reflow
  - frontend/performance/core-web-vitals
  - frontend/performance/loading-strategy

resources:
  - title: Critical rendering path
    url: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: How browsers work
    url: https://web.dev/articles/howbrowserswork
    source: web.dev
    type: article
    minutes: 45
  - title: Render-blocking resources
    url: https://web.dev/articles/critical-rendering-path/render-blocking-css
    source: web.dev
    type: article
    minutes: 15
---

## In one line

HTML becomes the DOM, CSS becomes the CSSOM, the two combine into a render tree that is laid out and painted — and CSS blocks rendering while synchronous scripts block parsing.

## What it is

The sequence is fixed. The parser turns bytes into tokens into nodes into the **DOM**. Stylesheets are parsed into the **CSSOM**. The two merge into a **render tree** containing only visible nodes — `display: none` elements are absent, `visibility: hidden` ones are present but invisible. **Layout** (reflow) computes the geometry of every box. **Paint** produces the pixels, usually onto several layers, and **composite** assembles those layers into the frame you see.

The blocking rules are what make this practical knowledge. **CSS is render-blocking**: the browser will not paint until the CSSOM is complete, because painting first would mean a flash of unstyled content followed by a repaint. A stylesheet in the head is on the critical path, and a slow one delays first paint for the whole page.

**Synchronous scripts are parser-blocking**: `<script src>` without `defer` or `async` stops HTML parsing, fetches, and executes before continuing. Worse, because a script may read computed styles, it also waits for any pending CSSOM. That is the classic head-of-line block — a script in the head behind a slow stylesheet delays everything.

`defer` fetches in parallel and runs after parsing, in order. `async` fetches in parallel and runs as soon as it lands, out of order — fine for independent things like analytics, wrong for anything with dependencies. Modules are deferred by default.

The optimisation levers follow directly: inline the critical CSS needed for the first viewport and load the rest asynchronously; defer scripts; preload resources the parser cannot discover early, such as a font referenced from CSS; and reduce the number of round trips before first paint.

Two details worth having: fonts are discovered only after the CSS that references them is parsed, which is why `preload` matters for them specifically, and why `font-display: swap` prevents invisible text while they load.

## Why it matters

This path is what LCP measures, so every loading-performance conversation is grounded here. "Why is the page blank for two seconds?" has a short list of answers — render-blocking CSS, parser-blocking script, a slow first byte — and identifying which one is the whole diagnosis.

## Key points

- DOM plus CSSOM makes the render tree; only visible nodes are in it, which is why `display: none` costs nothing to lay out.
- CSS is render-blocking by design — the browser will not paint an unstyled frame.
- Synchronous scripts block parsing, and also wait on pending CSS because they might read computed styles.
- `defer` preserves order and runs after parsing; `async` runs on arrival and is only safe for independent scripts.
- Inline critical CSS, defer the rest, and preload resources the parser cannot discover — fonts especially.
- Layout and paint happen per frame after this; the initial path is only about getting the first one on screen.
