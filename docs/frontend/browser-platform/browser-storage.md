---
title: Browser Storage
summary: localStorage, sessionStorage, IndexedDB, cookies and the Cache API — what each is for, and what gets evicted.
level: core
minutes: 25
order: 10
tags: [browser, storage, security]

related:
  - frontend/browser-platform/service-workers-and-offline
  - frontend/security/auth-token-storage
  - frontend/state-and-data/offline-and-local-first

resources:
  - title: Storage for the web
    url: https://web.dev/articles/storage-for-the-web
    source: web.dev
    type: article
    minutes: 25
    primary: true
  - title: IndexedDB API
    url: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
    source: MDN
    type: docs
    minutes: 30
  - title: Using HTTP cookies
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies
    source: MDN
    type: docs
    minutes: 25
---

## In one line

Five stores with different sizes, lifetimes and threat models: pick by whether the server needs it, whether it must survive, how big it is, and whether losing it matters.

## What it is

**localStorage** is synchronous string key-value, roughly 5–10MB, persisting until cleared. Its fatal property for anything sensitive is that JavaScript can read it, so any XSS drains it — which is the argument against storing tokens there. Being synchronous, it also blocks the main thread, so a large read on startup is a measurable delay.

**sessionStorage** is the same API scoped to a tab and cleared when the tab closes. Genuinely useful for per-tab state — a wizard's progress, a scroll position — and often overlooked.

**Cookies** are the only store sent automatically with requests, which is exactly why they carry sessions. The flags are the whole security story: `HttpOnly` puts them out of JavaScript's reach, `Secure` restricts them to HTTPS, and `SameSite` controls cross-site sending, which is the CSRF lever. They are small (~4KB) and cost bandwidth on every request, so they are for identifiers, not data.

**IndexedDB** is the real database: asynchronous, transactional, stores structured objects and blobs, and scales to hundreds of megabytes or more. The native API is famously unpleasant, so most people use `idb` or Dexie. This is the store for offline data, cached datasets, and anything large.

**The Cache API** stores `Request`/`Response` pairs and is what service workers use for offline assets. It is not a general key-value store; it is an HTTP-shaped one.

The rules that matter across all of them. Everything is **origin-scoped**, so `https` and `http` on the same host are separate stores. Browsers **evict** under storage pressure — `navigator.storage.persist()` requests exemption, and Safari clears data for sites unvisited for seven days. So local data must never be the only copy of anything a user would miss.

And none of it is secure. It is all readable by any script on the origin, and by anyone with the device. Store an id and keep the sensitive part server-side.

## Why it matters

"Where do you store the auth token?" is one of the most reliably asked frontend security questions, and the correct answer — an `HttpOnly` cookie, not `localStorage` — requires knowing this table.

Offline and performance work both start with picking the right store, and picking `localStorage` for something large is a common startup-latency bug.

## Key points

- `localStorage` is synchronous, script-readable, and small — bad for tokens and bad for large payloads on startup.
- `sessionStorage` is per-tab and cleared on close, which suits wizard state and scroll restoration.
- Cookies are the only store sent with requests; `HttpOnly`, `Secure`, and `SameSite` are the security-relevant flags.
- IndexedDB is the only realistic option at size — asynchronous, transactional, structured, and worth a wrapper library.
- The Cache API stores request/response pairs for service workers, not arbitrary values.
- Everything is origin-scoped and evictable; request persistence and never treat local data as the only copy.
- No client storage is secure — keep secrets server-side and store identifiers.
