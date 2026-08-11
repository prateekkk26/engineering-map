---
title: Design an Infinite Feed
summary: Cursor pagination, a normalised cache, virtualisation, and keeping scroll position stable when items shift underneath the user.
level: core
minutes: 30
order: 5
tags: [frontend-system-design, design-problem, lists]

related:
  - frontend/state-and-data/pagination-and-infinite-lists
  - frontend/state-and-data/cache-normalisation-and-entity-shape
  - frontend/react/lists-and-virtualisation
  - system-design/classic-problems/design-a-news-feed

resources:
  - title: Infinite Scroll Without Layout Shift
    url: https://web.dev/articles/cls
    source: web.dev
    type: article
    minutes: 20
    primary: true
  - title: Intersection Observer API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    source: MDN
    type: docs
    minutes: 15
  - title: TanStack Virtual
    url: https://tanstack.com/virtual/latest
    source: TanStack
    type: docs
    minutes: 20
  - title: Relay Cursor Connections Specification
    url: https://relay.dev/graphql/connections.htm
    source: Relay
    type: docs
    minutes: 15
---

## In one line

An unbounded list of heterogeneous, mutable items — the design is a cursor, a normalised cache, and a plan for the DOM and memory not growing forever.

## What it is

**Requirements.** Ask: are items uniform height or arbitrary (that decides whether virtualisation is easy)? Can items be created, edited or deleted while you scroll? Do you need deep-linking to a position? Does the back button have to restore where you were? Is there media?

**Fetching.** Cursor pagination, not offset — new posts arriving at the head shift every offset and you get duplicates and gaps. Request the next page when a sentinel element near the bottom intersects the viewport, via `IntersectionObserver` with a `rootMargin` of a screen or two so the fetch starts before the user hits the end. Guard against firing twice: one in-flight request at a time, keyed by cursor. Handle the trailing states — loading more, end of feed, error while loading more (retry in place, don't destroy the list).

**Cache.** Store items **normalised** by ID with the pages as ordered lists of IDs. Two reasons, and both are worth saying: the same post can appear in several feeds and must not diverge, and a like or delete then updates one entity rather than hunting through page arrays. Dedupe on append — servers do return overlaps.

**Rendering.** The DOM is the constraint. At a few thousand nodes with images, scrolling degrades and memory climbs. **Virtualise** — render a window plus overscan — and if heights vary, measure and cache them, or use `content-visibility: auto` with `contain-intrinsic-size` for a cheaper approximation that keeps items in the DOM for find-in-page. Say the tradeoff: virtualisation breaks Ctrl+F, anchor links and some screen-reader navigation unless handled.

**Scroll stability is the hard part.** Reserve space for images with explicit dimensions or aspect ratio, or CLS ruins the experience. If content can be inserted above (new posts, an expanded item), either don't insert silently — show a "new posts" pill the user taps — or use `overflow-anchor` / manual scroll compensation. Restoring position on back navigation means persisting the loaded cursor set and the scroll offset, then restoring after items have measurable height, not before.

**Optimisations.** Lazy-load images with `loading="lazy"` and decode off the main thread; unmount heavy media outside the window; pause video and timers for offscreen items; prefetch the next page on idle. For accessibility, `aria-busy` while loading and a live region announcing "20 more posts loaded" — infinite scroll is otherwise hostile to screen readers, and offering a "Load more" button as the accessible path is a legitimate answer.

**Also worth saying out loud:** infinite scroll makes footers unreachable and is a poor fit for goal-directed browsing. Naming when *not* to use the pattern is a senior signal.

## Why it matters

It's the frontend prompt that touches every layer at once — network contract, cache shape, rendering budget, layout stability, accessibility — which is exactly why it's asked. The scroll-stability and normalisation parts are what separate candidates who have shipped a feed from those who have read about one.

## Key points

- Cursor pagination is mandatory; offsets duplicate and skip rows whenever the head of the list changes.
- Trigger the next page from an `IntersectionObserver` sentinel with a screen or two of `rootMargin`, and allow only one in-flight fetch.
- Normalise items by ID with pages as ID lists, so an edit or a like updates one entity everywhere.
- Dedupe on append — overlapping pages from the server are normal.
- Virtualise long lists, and state the cost: find-in-page, anchors, and screen-reader traversal all suffer.
- Reserve image dimensions up front; layout shift is the defining UX failure of a feed.
- Never insert items above the viewport silently — use a "new posts" affordance or compensate the scroll offset.
- Restoring scroll on back navigation requires persisting both the cursor set and the offset, and restoring after measurement.
- Announce loaded batches in a live region and offer a "Load more" button as the accessible path.
