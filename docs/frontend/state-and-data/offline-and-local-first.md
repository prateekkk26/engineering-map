---
title: Offline & Local-First
summary: What it takes for an app to work without a network, and why conflict resolution is the part that decides whether it is feasible.
level: deep
minutes: 25
order: 14
tags: [offline, state, architecture]

related:
  - frontend/browser-platform/service-workers-and-offline
  - frontend/browser-platform/browser-storage
  - frontend/state-and-data/realtime-state-sync

resources:
  - title: Local-first software
    url: https://www.inkandswitch.com/local-first/
    source: Ink & Switch
    type: article
    minutes: 60
    primary: true
  - title: Offline cookbook
    url: https://web.dev/articles/offline-cookbook
    source: web.dev
    type: article
    minutes: 30
  - title: Yjs
    url: https://docs.yjs.dev/
    source: Yjs
    type: docs
    minutes: 30
---

## In one line

Offline support is a spectrum from "read the last page you saw" to "a local database that syncs" — and the cost is dominated not by storage but by deciding what happens when two devices edited the same thing.

## What it is

Be honest about which level you need. **Level one**: cached shell and last-seen content, so the app opens and shows something. A service worker with a cache-first strategy for assets and stale-while-revalidate for data gets you here, and it covers most products.

**Level two**: queued mutations. The user can act offline, actions are persisted to IndexedDB, and a background sync flushes them on reconnect. Now you need idempotency keys so a retried request does not double-charge, ordering so dependent actions replay correctly, and a UI that shows pending state honestly rather than claiming success.

**Level three**: local-first. The local store is the primary copy, writes are instant, and sync happens in the background — the network is an enhancement, not a precondition. This is where conflict resolution stops being avoidable.

Conflicts are the whole problem. Last-write-wins is simple and silently discards someone's work. Server-wins is predictable and frustrating. **CRDTs** — Yjs, Automerge — merge concurrent edits deterministically without a central arbiter, which is what makes collaborative text editing work, at the cost of metadata growth and a data model you cannot design freely. **Operational transformation** solves the same problem with server-side coordination and is harder to implement correctly.

The pragmatic middle ground most products land on: field-level merging for structured records (two people editing different fields both succeed), explicit conflict UI for the rare genuine collision, and CRDTs reserved for the text-editing surfaces where they are actually necessary.

Storage is the easy part but has sharp edges: IndexedDB is the only realistic option at size, browsers evict under storage pressure unless you request persistence, and Safari clears storage for sites unvisited for a while — so local data must never be the only copy of something the user cannot lose.

## Why it matters

"Make it work offline" arrives as a one-line requirement and is a multi-week project once conflicts are in scope, so being able to scope it into levels is the valuable skill.

In design rounds — collaborative editor, notes app — the interviewer is specifically checking whether you raise conflict resolution unprompted.

## Key points

- Offline is a spectrum: cached shell, queued mutations, then a local-primary store — scope which level is actually required.
- Queued mutations need idempotency keys, ordering, and honest pending UI, or retries duplicate and dependent actions fail.
- Conflict resolution is the real cost: last-write-wins loses data, server-wins frustrates, CRDTs merge at the price of metadata and model constraints.
- Field-level merging plus an explicit conflict UI covers most structured data; reserve CRDTs for genuinely collaborative text.
- IndexedDB is the only practical store at size; request persistence and expect eviction.
- Never let local storage be the only copy of something the user would be upset to lose.
