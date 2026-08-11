---
title: Frontend Caching and Offline Architecture
summary: The four caches a browser app actually has, how they interact, and what it takes to keep working without a network.
level: core
minutes: 30
order: 13
tags: [frontend-system-design, caching, offline]

related:
  - frontend/browser-platform/http-caching
  - frontend/browser-platform/service-workers-and-offline
  - frontend/state-and-data/offline-and-local-first
  - _shared/caching

resources:
  - title: The Offline Cookbook
    url: https://web.dev/articles/offline-cookbook
    source: web.dev
    type: article
    minutes: 30
    primary: true
  - title: Prevent unnecessary network requests with the HTTP Cache
    url: https://web.dev/articles/http-cache
    source: web.dev
    type: article
    minutes: 20
  - title: Workbox
    url: https://developer.chrome.com/docs/workbox
    source: Chrome for Developers
    type: docs
    minutes: 25
  - title: IndexedDB API
    url: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
    source: MDN
    type: docs
    minutes: 20
---

## In one line

There are four caches in front of your data — HTTP, service worker, in-memory client cache, and persistent storage — and a design answer names which one owns what.

## What it is

**The layers, from the network inward.**

*CDN and HTTP cache.* Immutable, content-hashed static assets get `Cache-Control: max-age=31536000, immutable`. HTML gets `no-cache` — revalidate every time, because it references the hashed assets and is how you ship a new version. API responses get short `max-age` with `stale-while-revalidate` when staleness is tolerable, and `ETag`/`If-None-Match` when it isn't. This layer is free and most candidates skip straight past it to application code.

*Service worker.* Programmable caching and the only path to genuine offline. Match strategy to resource: **cache-first** for hashed assets, **stale-while-revalidate** for things that should be instant but fresh-ish (avatars, config), **network-first with a cache fallback** for API reads, and never cache mutations. Precache the app shell so a cold offline load still renders something. The hard part is **updates** — a service worker's default lifecycle leaves users on old code indefinitely; decide between `skipWaiting` (fast, risks a version mismatch mid-session) and prompting "a new version is available, reload". A stale service worker serving stale JS against a new API is one of the nastiest production failure modes there is, and naming it is a senior signal.

*In-memory client cache.* Where a query library lives. This is where staleness policy per query, deduplication of concurrent requests, background refetch on focus and reconnect, and normalisation belong. Say your invalidation strategy explicitly: invalidate by key after a mutation, or write the mutation response into the cache directly.

*Persistent storage.* `localStorage` for tiny synchronous preferences only — it's synchronous and blocks the main thread. **IndexedDB** for anything real: cached entities, queued mutations, drafts, uploaded-file manifests. The Cache API for responses. Nothing sensitive in any of them; anything persisted is readable by any script that gets execution on your origin.

**Offline is a spectrum, and pick a point on it.** Read-only offline (see what you already loaded) is cheap and covers most products. Queued writes — mutations recorded in IndexedDB and flushed on reconnect, each with an idempotency key so retries are safe — is the middle. Full local-first with conflict resolution is a CRDT problem and a much larger commitment. Say which one the requirements justify.

**Invalidation is where all of this goes wrong.** Every layer must be invalidatable independently. Version your cache names so a deploy can drop stale entries. Never cache authenticated responses in a shared layer, and clear all client caches on logout — a cached response surviving a user switch is a real data-leak bug.

**What the user sees.** Show connection state, mark stale data as stale rather than pretending, disable or queue actions that need a network, and reconcile visibly on reconnect. Silent staleness destroys trust faster than an honest offline banner.

## Why it matters

Caching is the Optimisations answer that applies to almost every prompt in this section, so it's worth having as a structured checklist rather than an ad-hoc mention. The service worker update problem and the logout-must-clear-caches rule are two things you only know from having been burned, and both land well in a round.

## Key points

- Name all four layers — HTTP, service worker, in-memory client cache, persistent storage — and assign ownership rather than blurring them.
- Content-hash assets with a one-year immutable max-age and keep HTML on `no-cache`; that pairing is how a deploy propagates.
- `stale-while-revalidate` gives instant responses with background freshness and is underused on both HTTP and the service worker.
- Match the service worker strategy per resource type, and never cache mutations.
- Service worker updates are the trap: choose `skipWaiting` or an explicit reload prompt, and say why.
- Use IndexedDB for anything of size; `localStorage` is synchronous and blocks the main thread.
- Pick an offline tier deliberately — read-only, queued writes with idempotency keys, or full local-first.
- Version cache names so a deploy can invalidate an entire layer at once.
- Clear every client-side cache on logout; a response surviving a user switch is a data leak.
- Surface staleness and connection state honestly rather than showing old data as if it were live.
