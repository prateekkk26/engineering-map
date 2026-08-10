---
title: View Transitions & Soft Navigation
summary: The platform API for animating between states and pages, and why it changes what SPA-style transitions cost.
level: deep
minutes: 20
order: 8
tags: [browser, animation, navigation]

related:
  - frontend/browser-platform/navigation-history-and-bfcache
  - frontend/browser-platform/compositing-and-gpu-layers
  - frontend/performance/perceived-performance

resources:
  - title: View Transition API
    url: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
    source: MDN
    type: docs
    minutes: 30
    primary: true
  - title: Smooth transitions with the View Transition API
    url: https://developer.chrome.com/docs/web-platform/view-transitions
    source: Chrome
    type: article
    minutes: 30
  - title: prefers-reduced-motion
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
    source: MDN
    type: docs
    minutes: 10
---

## In one line

`document.startViewTransition()` snapshots the page, lets you change the DOM, then cross-fades or morphs between the old and new states using the compositor — animation between states that were never on screen together.

## What it is

Animating between two UI states has always been awkward because both states must exist simultaneously to tween between them, which means keeping the old DOM alive while the new one mounts. Every animation library for route transitions is machinery for that problem.

The View Transition API inverts it. You call `document.startViewTransition(() => updateTheDOM())`. The browser takes a snapshot of the current rendering, runs your callback, snapshots the new state, and animates between the two images — as compositor work, off the main thread. The default is a cross-fade, customisable with the `::view-transition-*` pseudo-elements.

The compelling part is **shared element transitions**. Give an element `view-transition-name: hero` in both the old and new state and the browser morphs it between its two positions and sizes: a thumbnail in a grid expanding into a detail page header, native-app style, without measuring anything yourself. Names must be unique per snapshot, which is the constraint that shapes the implementation.

It works for same-document changes today, and cross-document transitions between real page navigations are supported in Chromium via `@view-transition { navigation: auto; }` — which is notable because it gives multi-page apps a capability that previously required being an SPA.

Practical notes. It is progressive enhancement: feature-detect and fall back to an instant update, since the API is not universally supported. Snapshots are of the rendered result, so very large or complex pages cost more to capture. And **respect `prefers-reduced-motion`** — a morphing transition is exactly the kind of motion that triggers vestibular discomfort, so wrap it in the media query rather than shipping it unconditionally.

React 19.2 also exposes a `<ViewTransition>` component for updates inside transitions, which is how this integrates with concurrent rendering rather than fighting it.

## Why it matters

Route transitions are a persistent product ask, and doing them by hand is a meaningful amount of fragile code. Knowing there is a platform API that does it on the compositor is both a practical shortcut and a currency signal.

The reduced-motion point is also an accessibility marker interviewers listen for — offering polish and knowing when to withhold it.

## Key points

- The API snapshots before and after your DOM change and animates between the two on the compositor.
- `view-transition-name` on matching elements produces shared-element morphs with no manual measurement.
- Names must be unique within a snapshot, which constrains how you tag repeated items.
- Cross-document transitions bring app-like navigation to multi-page sites in supporting browsers.
- Feature-detect and fall back to an instant update — this is enhancement, not a dependency.
- Always gate transitions behind `prefers-reduced-motion`.
