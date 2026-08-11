---
title: Flexbox & Grid Layout Models
summary: One-dimensional versus two-dimensional layout, the sizing algorithm behind each, and choosing between them without guessing.
level: core
minutes: 25
order: 2
tags: [css, layout, flexbox, grid]

related:
  - frontend/css/containing-blocks-stacking-and-formatting-contexts
  - frontend/css/responsive-strategy-and-container-queries
  - frontend/browser-platform/layout-thrashing-and-forced-reflow

resources:
  - title: CSS grid layout
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout
    source: MDN
    type: docs
    minutes: 35
    primary: true
  - title: A Complete Guide to Flexbox
    url: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
    source: CSS-Tricks
    type: article
    minutes: 30
  - title: Learn CSS — Layout
    url: https://web.dev/learn/css/layout
    source: web.dev
    type: article
    minutes: 30
---

## In one line

Flexbox distributes space along one axis and lets content size itself; Grid defines a two-dimensional structure the content fits into — content-out versus layout-in.

## What it is

**Flexbox** is one-dimensional. Items are laid along the main axis, and the interesting behaviour is the sizing algorithm: `flex-grow` distributes leftover space, `flex-shrink` removes overflow proportionally, and `flex-basis` sets the starting size before either applies. The shorthand people memorise — `flex: 1` — expands to `1 1 0%`, which makes items equal regardless of content, whereas `flex: auto` (`1 1 auto`) sizes them relative to their content first. That difference is behind most "why are my flex items uneven?" questions.

The other flex trap is that a flex item's `min-width` defaults to `auto`, meaning it will not shrink below its content — which is why a long unbroken string blows out a layout, and why `min-width: 0` is the standard fix.

**Grid** is two-dimensional and declares structure. `grid-template-columns`, `fr` units for fractional space, `repeat()`, `minmax()`, and named lines and areas describe the layout independently of the markup order. Two idioms cover most responsive cases without a media query: `repeat(auto-fit, minmax(200px, 1fr))` for a wrapping card grid, and named areas for page-level layout.

**Choosing** is usually straightforward once framed correctly. Content flowing in a line with unknown item sizes — toolbars, tag lists, button rows — is Flexbox. A defined structure where items align in both directions — page layouts, dashboards, forms with aligned labels — is Grid. Nesting them is normal, not a compromise.

Two things apply to both. **Alignment properties are shared**: `justify-content`, `align-items`, `place-items` and `gap` behave consistently across both models, and `gap` has replaced margin hacks entirely. And **logical properties** — `margin-inline`, `padding-block`, `inset` — make layouts work in right-to-left languages without a mirrored stylesheet, which matters for any European or multilingual product.

`subgrid` closes the last real gap: it lets a nested grid align to its parent's tracks, which is what makes card contents line up across a row.

## Why it matters

Layout is the daily surface of CSS, and knowing the sizing algorithms rather than pattern-matching from Stack Overflow is what makes the awkward cases tractable.

Interviewers ask "flexbox or grid?" expecting the one-versus-two-dimensional distinction plus the content-out versus layout-in framing, not a preference.

## Key points

- Flexbox is one-dimensional and content-driven; Grid is two-dimensional and structure-driven.
- `flex: 1` is `1 1 0%` (equal items); `flex: auto` is `1 1 auto` (content-proportional).
- A flex item's `min-width: auto` prevents shrinking below content — `min-width: 0` is the standard fix.
- `repeat(auto-fit, minmax(...))` gives a responsive grid with no media queries; named areas handle page layout.
- Alignment properties and `gap` are shared between both models.
- Use logical properties so layouts survive RTL without a mirrored stylesheet.
- `subgrid` aligns nested content to the parent's tracks.
