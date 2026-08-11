---
title: Responsive Strategy & Container Queries
summary: Moving from viewport breakpoints to component-relative sizing, and the intrinsic techniques that remove media queries entirely.
level: core
minutes: 25
order: 4
tags: [css, responsive, layout]

related:
  - frontend/css/flexbox-and-grid-layout-models
  - frontend/architecture/design-systems
  - frontend/accessibility/visual-accessibility

resources:
  - title: CSS container queries
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Intrinsic layouts
    url: https://web.dev/articles/new-responsive
    source: web.dev
    type: article
    minutes: 25
  - title: clamp()
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
    source: MDN
    type: docs
    minutes: 15
---

## In one line

Media queries ask how wide the window is, container queries ask how wide the component's parent is — and in a component-based codebase the second question is nearly always the one you meant.

## What it is

The breakpoint model assumed pages. A component does not know whether it is in a full-width hero, a two-thirds column, or a 300px sidebar, and viewport width tells it nothing about the space it actually has. That mismatch is why design systems accumulate `variant="compact"` props: a manual, error-prone way of passing down information the component could measure itself.

**Container queries** fix it directly. Mark an ancestor with `container-type: inline-size`, then write `@container (min-width: 400px) { ... }`. The same card component lays out as a row in a wide slot and a column in a narrow one, with no prop and no knowledge of the page. Container query units — `cqi`, `cqw`, `cqb` — size relative to the container rather than the viewport. Named containers (`container-name`) let a component query a specific ancestor when several are nested.

**Intrinsic techniques remove queries altogether**, and they are usually the better first move. `clamp(min, preferred, max)` gives fluid typography and spacing in one declaration. `min()` and `max()` express "whichever is smaller" without a breakpoint. `repeat(auto-fit, minmax(200px, 1fr))` wraps a grid by available space. `flex-wrap` handles a row that becomes several. Each of these describes intent rather than enumerating widths, which means it keeps working at sizes nobody tested.

Media queries retain a real role — just a narrower one. They are right for genuinely page-level decisions and, importantly, for **user preference queries**: `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, and `prefers-reduced-transparency` are media queries, and respecting them is an accessibility requirement rather than a nicety.

Two practical cautions. `container-type: inline-size` applies size containment on the inline axis, so the container no longer sizes to its contents in that direction — an element that collapses after adding it is showing you that, not a bug. And a container cannot query itself; the query applies to descendants, so the component needs a wrapper.

## Why it matters

Component libraries are the dominant way UI is built, and container queries are the first mechanism that makes a component genuinely self-contained — it is a real architectural shift, not a syntax addition.

Interviewers ask about it as a currency check, and the strong answer includes the intrinsic techniques that avoid queries entirely.

## Key points

- Viewport width does not describe the space a component occupies; container queries do.
- `container-type: inline-size` plus `@container` lets one component adapt to any slot without props.
- `cqi`/`cqw` units size relative to the container; named containers disambiguate nesting.
- Prefer intrinsic techniques first — `clamp()`, `min()`, `max()`, `auto-fit` grids, `flex-wrap`.
- Media queries remain correct for page-level decisions and for user preference queries.
- Always honour `prefers-reduced-motion` and `prefers-color-scheme`.
- `container-type` applies size containment, and a container cannot query itself — wrap it.
