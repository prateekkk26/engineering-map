---
title: Design a Data Grid Dashboard
summary: Server-side sorting and filtering, URL-encoded view state, windowed rendering, and charts that don't block the main thread.
level: core
minutes: 30
order: 6
tags: [frontend-system-design, design-problem, tables]

related:
  - frontend/state-and-data/url-as-state
  - frontend/state-and-data/derived-state-and-selectors
  - frontend/performance/inp-and-long-tasks
  - frontend/accessibility/keyboard-navigation-and-focus-management

resources:
  - title: WAI-ARIA Authoring Practices — Grid Pattern
    url: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
    source: W3C
    type: docs
    minutes: 25
    primary: true
  - title: TanStack Table — Overview
    url: https://tanstack.com/table/latest/docs/overview
    source: TanStack
    type: docs
    minutes: 30
  - title: Optimize Long Tasks
    url: https://web.dev/articles/optimize-long-tasks
    source: web.dev
    type: article
    minutes: 15
---

## In one line

A table of a hundred thousand rows plus filters and charts — the design is deciding what the server does, what the URL holds, and how few DOM nodes you can get away with.

## What it is

**Requirements.** Row count, and whether it's bounded. Which operations: sort, filter, search, group, paginate, edit inline, export? Multi-user — does data change while you look at it? Column configuration per user? Is this an analyst tool (dense, keyboard-driven, desktop) or a summary screen (responsive, mobile-first)? Those are different products.

**The central decision: client-side or server-side operations.** Under a few thousand rows, fetch once and sort/filter in memory — instant interaction, no network per keystroke. Above that, sorting and filtering move to the server and every interaction becomes a request. Say the threshold and the reasoning. Hybrid is common and worth naming: server does the heavy filter, client does the fast in-page sort of the fetched window.

**View state belongs in the URL.** Sort column and direction, active filters, page or cursor, and search term. This makes the view shareable, bookmarkable, and back-button-correct — and it's a decision interviewers reliably reward because most candidates put it in component state. Keep the encoding short and versioned; column layout and widths are per-user preferences and belong in local storage or the user profile, not the URL.

**Fetching.** Debounce filter input; cancel superseded requests; keep the previous page visible while the next loads and mark it stale rather than blanking the table. Cache by the full query key so going back to a previous sort is instant. For live data, poll on an interval with backoff when the tab is hidden, or subscribe — and merge updates without stealing the user's scroll or selection.

**Rendering.** Row virtualisation plus, for very wide tables, column virtualisation. Sticky header and frozen first column via `position: sticky`, not scroll listeners. Memoise cell renderers and keep row identity stable by ID so re-sorting doesn't remount everything. Formatting numbers and dates per locale is real work — build the `Intl` formatters once, outside the render, not per cell; that's a genuine long-task source at ten thousand cells.

**Charts.** Aggregate on the server and send the series, not the raw rows. Render with SVG for a few hundred points, Canvas beyond that. Push heavy aggregation to a worker so the grid stays interactive.

**Accessibility.** A real `<table>` with `<th scope>` if you can; `role="grid"` with roving tabindex and arrow-key navigation if you're virtualising. Sortable headers expose `aria-sort`. Announce "142 results" in a live region after filtering. Provide a keyboard path to every action in a row menu.

## Why it matters

Every internal tool and B2B product is this screen, so it's asked constantly, and it's the prompt where "just fetch everything and use `Array.sort`" collapses in the follow-up. The URL-as-state answer and the client/server threshold argument are two cheap places to sound like someone who has maintained one of these.

## Key points

- Decide client-side vs server-side sorting and filtering explicitly by row count, and name your threshold.
- Sort, filter, search and page belong in the URL; column widths and layout belong in user preferences.
- Keep stale data visible while refetching — blanking the table on every filter change is the common UX mistake.
- Cache by full query key so revisiting a previous sort or filter is instantaneous.
- Virtualise rows, and columns too once the table is wide; keep row keys stable by ID across sorts.
- Construct `Intl` formatters once, not per cell — per-cell formatting is a real long-task source.
- Aggregate chart data server-side and send series; use Canvas past a few hundred points and a worker for heavy math.
- Use a real table element where possible; if you virtualise into `role="grid"`, you owe roving tabindex and arrow-key navigation.
- Expose `aria-sort` on sortable headers and announce result counts in a live region.
