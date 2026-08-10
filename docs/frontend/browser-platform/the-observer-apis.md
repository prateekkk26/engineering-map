---
title: The Observer APIs
summary: Intersection, Resize, Mutation and Performance observers — the callback-based replacements for polling the layout.
level: core
minutes: 20
order: 6
tags: [browser, apis, performance]

related:
  - frontend/browser-platform/layout-thrashing-and-forced-reflow
  - frontend/state-and-data/pagination-and-infinite-lists
  - frontend/performance/lab-vs-field-measurement

resources:
  - title: Intersection Observer API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: ResizeObserver
    url: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
    source: MDN
    type: docs
    minutes: 20
  - title: PerformanceObserver
    url: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver
    source: MDN
    type: docs
    minutes: 20
  - title: MutationObserver
    url: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    source: MDN
    type: docs
    minutes: 15
---

## In one line

Each observer replaces a pattern that used to mean listening to scroll or resize and measuring on every event — the browser tells you when something actually changed, off the main thread's critical path.

## What it is

**IntersectionObserver** reports when an element enters or leaves a viewport or ancestor. It replaces the scroll-handler-plus-`getBoundingClientRect` pattern that forced layout on every scroll event. Use it for lazy loading, infinite scroll sentinels, "seen" analytics, and sticky-header triggers. `rootMargin` lets you fire early — loading the next page 200px before the user reaches the bottom — and `threshold` controls how much visibility counts.

**ResizeObserver** reports element size changes, which `window.resize` never did: an element can change size because a sibling grew, without the window moving at all. It is the correct tool for a chart that must re-render at its container's size, and it works with container queries as the JavaScript equivalent. Watch for the "ResizeObserver loop completed with undelivered notifications" error — that means your callback resized the observed element, creating a cycle.

**MutationObserver** reports DOM changes. It is niche in an app you control, since you know when you changed the DOM, but it is the right tool for reacting to a third-party script or widget mutating your page.

**PerformanceObserver** subscribes to performance entries — LCP, CLS, INP, long tasks, resource timings — as they occur. This is how real-user monitoring is implemented, and how `web-vitals` collects field data. Some metrics only exist as entries, so this is not an alternative to reading them, it is the only way.

Two rules apply to all of them. Callbacks are batched and asynchronous, so they will not fire per pixel and will not block rendering. And every observer must be disconnected when the component unmounts — an observer holding a reference to a removed element is a leak, and this is the most common leak in a React codebase after event listeners.

## Why it matters

Lazy loading, infinite scroll, container-aware components, and RUM all sit on these four, so they show up in practical rounds constantly.

The scroll-handler alternative is also a good demonstration of the performance thinking behind them: knowing *why* IntersectionObserver exists is more valuable than knowing its options.

## Key points

- IntersectionObserver replaces scroll handlers that measured geometry, removing forced layout from every scroll event.
- `rootMargin` triggers early — essential for prefetching the next page before the user reaches the bottom.
- ResizeObserver catches element resizes that `window.resize` never reports, which is what charts and container-aware components need.
- A ResizeObserver callback that resizes its own target produces the undelivered-notifications loop error.
- MutationObserver is for DOM you do not control, such as third-party widgets.
- PerformanceObserver is the only way to collect several Core Web Vitals, and is the basis of RUM.
- Always disconnect on unmount; a live observer holding a detached node is a memory leak.
