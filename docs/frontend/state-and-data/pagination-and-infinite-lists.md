---
title: Pagination & Infinite Lists
summary: Offset versus cursor, why the classic paged list drops rows, and what infinite scroll costs you beyond the code.
level: core
minutes: 25
order: 12
tags: [data-fetching, lists, ux]

related:
  - frontend/react/lists-and-virtualisation
  - frontend/state-and-data/url-as-state
  - system-design/frontend-system-design/design-an-infinite-feed

resources:
  - title: Infinite Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries
    source: TanStack
    type: docs
    minutes: 25
    primary: true
  - title: Pagination — GraphQL
    url: https://graphql.org/learn/pagination/
    source: GraphQL
    type: docs
    minutes: 20
  - title: IntersectionObserver
    url: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    source: MDN
    type: docs
    minutes: 20
---

## In one line

Offset pagination is simple and silently loses rows on a changing list; cursor pagination is stable because it says "after this item" instead of "skip this many".

## What it is

`LIMIT 20 OFFSET 40` asks for rows 41–60 of a result set computed fresh each time. If someone inserts a row while the user is reading page two, everything shifts down by one: the first row of page three is a row they already saw, and one row is skipped entirely. On a feed sorted by recency — where inserts happen constantly at the top — this is not an edge case, it is the normal case. Offsets also get slower as they grow, because the database must walk and discard the skipped rows.

Cursor pagination asks for "the 20 items after this opaque marker", where the marker encodes the sort key of the last item seen. Inserts elsewhere do not move your position, and the query uses an index seek rather than a scan. The trade is that you cannot jump to page 7 — cursors give you next and previous, not random access. That is fine for a feed and wrong for an admin table where users expect page numbers.

So the rule: **cursor for feeds and infinite scroll, offset for stable, sortable, jumpable tables** — ideally with the page in the URL so the view is shareable.

Infinite scroll itself has costs beyond fetching. The footer becomes unreachable, which is why commerce sites often prefer a "load more" button. Back-navigation must restore both the loaded pages and the scroll position or the user loses their place — the single most common complaint about these UIs. The accumulated DOM grows without bound and eventually needs virtualisation. And each page load should be announced for screen readers rather than silently appearing.

Implementation-wise, `IntersectionObserver` on a sentinel element near the end of the list is the standard trigger, with the root margin tuned so the next page starts loading before the user reaches the bottom. Keep the loaded pages in one cache entry keyed by the query so returning to the list does not restart from page one.

## Why it matters

"Design an infinite feed" is one of the standard frontend system design prompts, and the offset-versus-cursor distinction with the duplicate-row explanation is exactly the depth interviewers are checking for.

In product work it is also a correctness issue: a paginated list that quietly skips records is a data bug that users report as "I know it was there".

## Key points

- Offset pagination recomputes the result set per request, so inserts and deletes cause duplicated and skipped rows.
- Offsets degrade with depth because the database walks and discards everything it skips.
- Cursors encode a position in the sort order, giving stability and index seeks — at the cost of jumping to an arbitrary page.
- Use cursors for feeds, offsets for tables where users expect page numbers, and keep the page in the URL.
- Infinite scroll must restore scroll position and loaded pages on back-navigation, or it loses the user's place.
- An unreachable footer, unbounded DOM growth, and unannounced new content are the standard infinite-scroll regressions.
