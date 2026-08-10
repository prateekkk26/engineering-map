---
title: State Taxonomy
summary: The five kinds of state in a frontend app, and why treating server data like client state is the root of most state-management pain.
level: core
minutes: 20
order: 1
tags: [state, architecture]

related:
  - frontend/state-and-data/server-state-and-cache-semantics
  - frontend/state-and-data/colocation-and-lifting-state
  - frontend/react/context-and-its-limits

resources:
  - title: Application State Management with React
    url: https://kentcdodds.com/blog/application-state-management-with-react
    source: Kent C. Dodds
    type: article
    minutes: 15
    primary: true
  - title: React Query as a State Manager
    url: https://tkdodo.eu/blog/react-query-as-a-state-manager
    source: TkDodo
    type: article
    minutes: 20
  - title: Managing state
    url: https://react.dev/learn/managing-state
    source: react.dev
    type: docs
    minutes: 30
---

## In one line

"State management" is five different problems wearing one name, and picking the right tool starts with saying which one you have.

## What it is

**Server state** is data you do not own: it lives in a database, you have a copy, and your copy is stale the moment you take it. It needs caching, deduplication, revalidation, and a story for what happens when two tabs disagree. This is the biggest category in most apps and the one that gets misfiled.

**Client state** is data you do own and nobody else has: the current tab, a selected row, whether the sidebar is collapsed, an in-progress draft. It is not shared, not fetched, and does not need synchronising with anything.

**URL state** is client state that belongs in the address bar: filters, search terms, pagination, the open item. Putting it there makes the view shareable, bookmarkable, and survivable across a refresh — for free.

**Form state** is its own thing: values, touched fields, validation errors, submission status. It changes on every keystroke, which is why libraries treat it separately rather than putting it in a global store.

**Ephemeral UI state** is the smallest and most common: is this dropdown open, is this tooltip showing. It belongs in the component and nowhere else.

The historic mistake is putting all five in one global store. Redux got a reputation for boilerplate largely because teams used it to cache API responses — reimplementing loading flags, retries, and invalidation by hand, per endpoint. Move server state to a query library and the global store usually shrinks to almost nothing, which is exactly what happened across the ecosystem.

The diagnostic question for any piece of state is: *who owns the truth?* If a server does, it is server state and you have a cache, not a value. If the URL should, put it there. If one component does, keep it there. Only what genuinely needs sharing between distant components belongs in a store.

## Why it matters

Nearly every "our state management is a mess" situation is this taxonomy collapsed into one bucket. Being able to separate the five, and say which tool serves which, is the difference between a design answer and a tooling opinion.

It is also the opening move in a frontend system design round: before the boxes, say what data exists and who owns it.

## Key points

- Server state is a cache of someone else's truth and needs revalidation; it is not application state.
- Client state is owned locally and needs no synchronisation — most of it belongs in the component that uses it.
- Filters, search, and pagination belong in the URL, which makes the view shareable and refresh-proof for free.
- Form state changes per keystroke and is its own problem, which is why form libraries exist separately.
- Most global-store bloat is server state in disguise; moving it to a query library shrinks the store dramatically.
- Ask "who owns the truth?" for each value — the answer picks the tool.
