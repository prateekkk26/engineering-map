---
title: Navigation, History & bfcache
summary: The History API, what makes a page ineligible for the back/forward cache, and why instant back navigation is worth protecting.
level: core
minutes: 20
order: 7
tags: [browser, navigation, performance]

related:
  - frontend/browser-platform/view-transitions-and-soft-navigation
  - frontend/state-and-data/url-as-state
  - frontend/performance/perceived-performance

resources:
  - title: Back/forward cache
    url: https://web.dev/articles/bfcache
    source: web.dev
    type: article
    minutes: 25
    primary: true
  - title: History API
    url: https://developer.mozilla.org/en-US/docs/Web/API/History_API
    source: MDN
    type: docs
    minutes: 20
  - title: Navigation API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
    source: MDN
    type: docs
    minutes: 25
---

## In one line

The bfcache keeps a whole page — DOM, JavaScript heap and all — frozen in memory so back and forward are instant, and a handful of common mistakes disqualify your page from it entirely.

## What it is

`pushState` and `replaceState` change the URL without a navigation, which is what makes client-side routing possible. `popstate` fires when the user moves through history. The newer **Navigation API** replaces this awkward surface with something coherent — intercepting navigations, a real entry list, and events for transitions — and is where routing is heading, though support is still uneven.

The **bfcache** is the more consequential thing to understand. When you navigate away, browsers may freeze the entire page rather than destroying it: the DOM stays, JavaScript state stays, even scroll position and in-progress form input. Going back restores it instantly, with no network and no re-execution. On mobile, where back navigation is a large share of all navigations, this is one of the biggest perceived-performance wins available — and you get it by default unless you break it.

The disqualifiers are specific and worth memorising. An `unload` event listener is the classic one — it is the single most common cause, and it is why `unload` is deprecated in favour of `pagehide`. A `Cache-Control: no-store` header on the document. An open IndexedDB transaction or an in-flight fetch at navigation time. Some uses of `beforeunload`. Chrome DevTools' Application panel has a bfcache tester that tells you the exact reason.

The lifecycle events that replace the old ones: `pagehide` fires when leaving, with a `persisted` flag saying whether the page is being frozen; `pageshow` fires on arrival, with the same flag telling you whether this is a restore. That flag matters — a restored page has stale data and no fresh render, so anything time-sensitive needs refreshing in `pageshow` when `persisted` is true.

Two frequent bugs come from this. Analytics that count only fresh loads under-count restored pages. And a page showing a "logged in" state restored after the user logged out in another tab — which is a real correctness issue, not just a stale view.

## Why it matters

Free instant back navigation is rare, and losing it to a stray `unload` listener from a third-party script is a common and invisible regression. Auditing for it is a quick win in a performance review.

It also explains a class of "the page shows old data after going back" bug reports that make no sense until you know the page was never re-executed.

## Key points

- `pushState`/`replaceState` power client routing; the Navigation API is the coherent replacement, with partial support.
- The bfcache freezes the whole page in memory, so back and forward are instant with no network or re-execution.
- `unload` listeners are the top disqualifier — use `pagehide` instead, and note `unload` is deprecated.
- `no-store` on the document, open IndexedDB transactions, and in-flight fetches also block eligibility.
- `pageshow` with `persisted: true` means a restore — refresh time-sensitive data and re-check auth state there.
- Chrome's Application panel reports the specific reason a page is ineligible.
