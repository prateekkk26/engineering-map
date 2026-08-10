---
title: Lists & Virtualisation
summary: Why long lists get slow, when windowing is the right answer, and the accessibility and UX costs it brings with it.
level: core
minutes: 25
order: 19
tags: [react, performance, lists]

related:
  - frontend/react/reconciliation-and-keys
  - frontend/state-and-data/pagination-and-infinite-lists
  - system-design/frontend-system-design/design-an-infinite-feed

resources:
  - title: TanStack Virtual
    url: https://tanstack.com/virtual/latest/docs/introduction
    source: TanStack
    type: docs
    minutes: 20
    primary: true
  - title: react-window
    url: https://github.com/bvaughn/react-window
    source: Brian Vaughn
    type: repo
  - title: Virtualize large lists with react-window
    url: https://web.dev/articles/virtualize-long-lists-react-window
    source: web.dev
    type: article
    minutes: 15
---

## In one line

Virtualisation renders only the rows currently in view plus a small overscan, trading a constant DOM size for the work of managing scroll position and item measurement yourself.

## What it is

A list of ten thousand rows is slow for three separate reasons, and it is worth knowing which one you have. The DOM has ten thousand nodes, so layout, style recalculation, and memory all scale with it. React has ten thousand fibers to diff on every render. And the initial mount has to create all of it in one pass, which is a long task.

Cheap fixes come first. Paginate, so the list is never that long. Fix the keys, so reordering does not remount rows. Memoise the row component, so a parent render does not re-render every row. Move state out of rows that do not need it. A list of a few hundred simple rows usually does not need windowing at all.

When the list is genuinely long, virtualisation keeps the DOM at the size of the viewport. A container of the full scroll height holds an absolutely positioned window of visible rows; as the user scrolls, the library computes which indices are in range and translates the window. Overscan renders a few extra rows on each side so fast scrolling does not flash empty space.

Fixed-height rows make this exact. Variable heights need measurement — the library renders a row, measures it, caches the size, and corrects the total. That correction is where the jitter comes from, and why an estimate close to the truth matters.

The costs are real. `Ctrl+F` finds nothing outside the window. Anchor links and scroll restoration need explicit handling. Screen readers need the full set size communicated, since the DOM only contains a slice. Sticky headers, horizontal scroll, and variable-height grids each add complexity. And it does not compose with `position: sticky` inside rows or with CSS that depends on sibling counts.

Two alternatives are often enough. `content-visibility: auto` lets the browser skip rendering off-screen content with far less machinery, and infinite scroll with a page size that keeps the total DOM small avoids the problem instead of managing it.

## Why it matters

"This table with 5,000 rows is unusable" is a common real task and a common interview prompt. The strong answer diagnoses which of the three costs dominates before reaching for a library — and names what virtualisation breaks, because the accessibility and find-in-page regressions are what get flagged in review.

## Key points

- Long lists are slow for three separable reasons: DOM size, reconciliation cost, and one long mounting task.
- Try pagination, correct keys, and a memoised row component before windowing — most lists never need it.
- Windowing renders a viewport-sized slice inside a full-height container, with overscan to cover fast scrolling.
- Variable row heights require measurement and cause scroll-position correction; a good estimate reduces the jitter.
- Find-in-page, anchor links, scroll restoration, and screen-reader item counts all need explicit handling once rows are absent from the DOM.
- `content-visibility: auto` and a smaller page size are lower-cost alternatives worth trying first.
