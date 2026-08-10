---
title: Loading Strategy
summary: Deciding what loads first, what loads later, and what never loads at all — the ordering problem behind every fast page.
level: core
minutes: 25
order: 4
tags: [performance, loading, network]

related:
  - frontend/browser-platform/critical-rendering-path
  - frontend/performance/javascript-bundle-budgets
  - frontend/tooling/code-splitting-strategy

resources:
  - title: Preload critical assets
    url: https://web.dev/articles/preload-critical-assets
    source: web.dev
    type: article
    minutes: 20
    primary: true
  - title: Optimize resource loading
    url: https://web.dev/learn/performance/optimize-resource-loading
    source: web.dev
    type: article
    minutes: 30
  - title: Fetch Priority
    url: https://web.dev/articles/fetch-priority
    source: web.dev
    type: article
    minutes: 20
---

## In one line

Every resource competes for the same bandwidth, so performance work is mostly deciding an order — and making sure the browser can discover the important things early.

## What it is

Three questions, in order. **What is needed for the first paint?** The HTML, the critical CSS, the fonts and hero image in the initial viewport. **What is needed for interactivity?** The JavaScript for what is on screen. **What can wait?** Everything else — below-the-fold images, analytics, chat widgets, routes not yet visited.

The **preload scanner** is the mechanism to design around. While the parser is blocked, a secondary scanner runs ahead looking for resources to start fetching. It only sees things in the markup: an image referenced from CSS, a font in a stylesheet, or a script imported dynamically is invisible to it and starts late. `<link rel="preload">` exists to make those discoverable early, and fonts are the canonical case.

The hint vocabulary, used sparingly: `preconnect` warms DNS, TCP, and TLS for a third-party origin you will definitely use — expensive, so two or three at most. `dns-prefetch` is the cheap version. `preload` says "fetch this now at high priority" for something needed in this navigation. `prefetch` is low-priority speculation for the *next* navigation. `fetchpriority="high"` promotes the LCP image without a separate preload. Over-using preload is a real anti-pattern: preload everything and you have prioritised nothing, and you have delayed what actually mattered.

Then the deferral levers: `defer` on scripts, `loading="lazy"` on below-fold images, route-level code splitting, and dynamic imports for heavy optional components. Third-party scripts deserve their own pass, since a tag manager or chat widget can outweigh your whole application.

The cheapest win is usually deletion. An unused polyfill bundle, a date library imported for one call, a font weight nobody uses, a carousel above the fold — removing bytes beats reordering them.

Finally, order by what the user sees. A page that paints its shell instantly and fills in content beats one that waits for everything, which is why streaming and skeletons belong in this conversation as much as compression does.

## Why it matters

LCP and INP both trace back to loading order, and it is where the largest wins usually live — often larger than anything achievable inside the app code.

It is also a standard interview scenario: "the page takes 6 seconds on mobile, walk me through what you check", where a structured answer beats a list of tricks.

## Key points

- Sort resources into first paint, interactivity, and can-wait before touching anything.
- The preload scanner only sees markup — CSS-referenced fonts and images and dynamic imports are late-discovered.
- `preconnect` for definite third-party origins, `preload` for late-discovered critical resources, `prefetch` for the next navigation.
- Preloading everything prioritises nothing and actively delays the critical path.
- Defer scripts, lazy-load below-fold images, split by route, and dynamically import heavy optional UI.
- Audit third parties separately — they frequently outweigh your own code.
- Deleting a resource beats reordering it.
