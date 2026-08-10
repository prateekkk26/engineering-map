---
title: Service Workers & Offline
summary: A programmable proxy between the page and the network — the lifecycle that confuses everyone, and the strategies worth knowing.
level: deep
minutes: 25
order: 15
tags: [browser, offline, pwa, caching]

related:
  - frontend/state-and-data/offline-and-local-first
  - frontend/browser-platform/browser-storage
  - frontend/browser-platform/http-caching

resources:
  - title: Service worker overview
    url: https://developer.chrome.com/docs/workbox/service-worker-overview
    source: Chrome
    type: article
    minutes: 25
    primary: true
  - title: Service Worker API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
    source: MDN
    type: docs
    minutes: 30
  - title: Workbox
    url: https://developer.chrome.com/docs/workbox
    source: Chrome
    type: docs
    minutes: 25
---

## In one line

A service worker is a script that sits between your page and the network, able to answer requests from a cache — which makes offline possible and makes a stale deployment possible too.

## What it is

It runs on a separate thread with no DOM access, and its central power is the `fetch` event: intercept a request and decide whether to serve from cache, go to the network, or combine both. Everything else — offline, push notifications, background sync — builds on that.

The **lifecycle** is where people get stuck, and it exists to keep multiple tabs consistent. A new worker is *installed*, then waits in `installed` until every tab controlled by the old one is closed. Only then does it *activate*. So a refresh does not pick up a new worker — the old tab is still controlling. `skipWaiting()` plus `clients.claim()` forces the handover, at the risk of a page suddenly being served assets from a different version than the one it loaded with. The safer pattern is to detect the waiting worker and prompt the user to reload.

The **strategies** are a short menu. *Cache-first* for hashed static assets — fastest, and safe because the URL changes when the content does. *Network-first* for HTML and API calls, falling back to cache when offline. *Stale-while-revalidate* for content that can be slightly old, serving the cached copy and refreshing behind it. *Network-only* for anything that must not be stale, such as authenticated mutations. Workbox packages all of these and is worth using rather than hand-writing the routing.

The failure mode that gives service workers a bad reputation is **the stuck deployment**: a worker caching HTML aggressively, so users keep getting an old app long after you shipped a new one, with no way for you to reach them. Always have an update path, keep HTML out of long-lived caches, and know how to unregister remotely.

Two constraints: HTTPS only (localhost excepted), and the scope is the directory the script is served from, so a worker at `/js/sw.js` cannot control `/`.

## Why it matters

PWAs, offline support, and push notifications all require this, and it is the mechanism behind "install to home screen" products.

It is also a good judgement question: the right answer to "should we add a service worker?" is often no, because the cost is a whole deployment failure mode in exchange for benefits a good cache policy already provides.

## Key points

- The `fetch` event makes the worker a programmable proxy; every other capability builds on it.
- A new worker waits until all old tabs close — this is deliberate, and why a refresh does not update it.
- `skipWaiting` plus `clients.claim` forces an update at the risk of mixed-version assets in a live page.
- Cache-first for hashed assets, network-first for HTML and APIs, stale-while-revalidate for tolerant content, network-only for mutations.
- Aggressively caching HTML is how apps get stuck on an old version with no remote fix.
- HTTPS only, and scope is limited by the script's directory.
- Use Workbox rather than hand-rolling routing and versioning.
