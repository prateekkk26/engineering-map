---
title: The URL as State
summary: Which state belongs in the address bar, why it is the cheapest persistence you will ever get, and how to keep it from thrashing.
level: core
minutes: 20
order: 3
tags: [state, routing, ux]

related:
  - frontend/state-and-data/state-taxonomy
  - frontend/state-and-data/pagination-and-infinite-lists
  - frontend/nextjs/app-router-mental-model

resources:
  - title: useSearchParams
    url: https://nextjs.org/docs/app/api-reference/functions/use-search-params
    source: Next.js
    type: docs
    minutes: 15
    primary: true
  - title: URLSearchParams
    url: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    source: MDN
    type: docs
    minutes: 15
  - title: nuqs — type-safe search params state manager
    url: https://nuqs.dev/
    source: nuqs
    type: docs
    minutes: 20
---

## In one line

Anything that describes *what the user is looking at* — filters, sort, page, search, the open item — belongs in the URL, where it is shareable, bookmarkable, and survives a refresh with no code.

## What it is

The URL is the only piece of state that is free to persist, free to share, and already integrated with the back button. Put a filter in `useState` and you have to build sharing, restoration, and history yourself. Put it in the query string and you get all three.

The test is whether someone else opening the link should see what you see. A selected date range, a search query, an active tab, an open modal for a specific record: yes. A half-typed input, whether a tooltip is visible, unsaved form values: no — that would make every keystroke a navigation.

Reading is standard: `useSearchParams` in React, `searchParams` as a page prop on the server. Writing is where the decisions are. `push` adds a history entry; `replace` does not. Filter changes generally want `replace`, or the back button becomes a tour of every filter combination the user tried. Navigation between distinct views wants `push`.

A search box typed straight into the URL will thrash — a navigation per keystroke. The usual arrangement is local state for the input, debounced into the URL, with the URL remaining the source of truth for the results. In React, wrapping the URL update in a transition keeps typing responsive while the results re-render at low priority.

Two structural cautions. Query strings are strings, so everything needs parsing and validating on read — a schema at the boundary saves a category of bugs, and libraries like `nuqs` give typed params with sensible defaults. And URLs have practical length limits, so complex nested filter objects serialised into a param are a smell: at that point the state belongs in a saved view with an id.

Finally, do not put anything sensitive in a URL. It lands in browser history, server logs, referer headers, and any analytics you have installed.

## Why it matters

"Share this filtered view" and "the back button should work" are perennial product requirements, and the apps that fail them are the ones that kept the state in React. In a design round, reaching for the URL unprompted for filters and pagination is a recognised senior signal.

## Key points

- If someone opening the link should see the same view, the state belongs in the URL.
- The URL gives sharing, bookmarking, refresh survival, and back-button behaviour with no extra code.
- Use `replace` for filter tweaks and `push` for real navigation, or the back button becomes unusable.
- Debounce text input into the URL and keep the input's own value local, or you navigate per keystroke.
- Parse and validate params on read — they are untrusted strings, and a schema at the boundary pays for itself.
- Never put tokens, emails, or other sensitive values in a URL; they leak into history, logs, and referers.
