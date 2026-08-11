---
title: Design an Analytics SDK
summary: A third-party script on someone else's page — batching, `sendBeacon` on unload, a tiny bundle, and never breaking the host site.
level: core
minutes: 25
order: 12
tags: [frontend-system-design, design-problem, sdk, privacy]

related:
  - frontend/architecture/analytics-and-event-taxonomy
  - frontend/tooling/publishing-a-frontend-package
  - frontend/security/third-party-scripts-and-tag-managers
  - frontend/security/privacy-consent-and-gdpr
  - system-design/classic-problems/design-a-metrics-pipeline

resources:
  - title: Beacon API — navigator.sendBeacon
    url: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
    source: MDN
    type: docs
    minutes: 10
    primary: true
  - title: Page Lifecycle API
    url: https://developer.chrome.com/docs/web-platform/page-lifecycle-api
    source: Chrome for Developers
    type: article
    minutes: 20
  - title: web-vitals library
    url: https://github.com/GoogleChrome/web-vitals
    source: Google Chrome
    type: repo
    minutes: 20
---

## In one line

You're a guest on a page you don't control, so the design constraints are "never break the host", "never block the host", and "don't lose the last event before they leave".

## What it is

**Requirements.** What's tracked — page views, clicks, custom events, errors, Web Vitals? Do events need identity across sessions and devices? What's the delivery guarantee? Consent regime? And how is it installed: a script tag, an npm package, or both? A script tag on arbitrary sites is the harder version and usually the intended one.

**Public API.** Small and stable: `init(writeKey, options)`, `track(event, properties)`, `identify(userId, traits)`, `page()`, `flush()`. Queue calls made before `init` completes — the classic stub pattern (`window.analytics = []` with a shim that replays) so a slow-loading SDK never drops early events or forces the host to order their script tags.

**Delivery is the core of the design.** Don't send one request per event. Buffer in memory and flush on whichever comes first: batch size (~20), time (~5–10s), or a lifecycle event. Use `navigator.sendBeacon` for the final flush — it survives unload, where `fetch` and XHR are cancelled. Trigger on `visibilitychange → hidden` rather than `unload` or `beforeunload`, because those don't fire reliably on mobile and break the bfcache. `fetch(..., { keepalive: true })` is the alternative with a 64KB cap.

**Reliability.** Persist the queue to `localStorage` so events survive a crash or an offline period, flushing on reconnect with a cap so it can't grow unbounded. Give every event a client-generated UUID plus a timestamp so the server can dedupe retries — delivery is at-least-once, dedupe makes it effectively once. Send the client timestamp *and* a clock-skew correction from the server's response, because device clocks are wrong often enough to ruin funnels.

**Never break the host.** Wrap every public method in try/catch — an exception inside your SDK must not surface in their error tracking or halt their code. Load `async`/`defer`, do work in `requestIdleCallback`, and consider a Web Worker for serialisation. Namespace everything, touch no globals or prototypes, and use a `data-` attribute or a scoped element if you need DOM. Keep the bundle in single-digit KB gzipped and enforce it in CI — this is a hard product requirement, not an aspiration, and saying you'd budget it is a strong signal.

**Privacy is a design constraint, not a footnote.** Gate on consent before any network call and buffer meanwhile; support opt-out and Do Not Track; strip PII from URLs and referrers (query strings routinely carry emails and tokens); redact form values by default with explicit allowlisting. Cookieless first-party identity where you can. GDPR and CCPA make this a correctness requirement in the EU/US markets these companies sell into.

**Failure modes.** Server 5xx → backoff and keep the batch. 4xx → drop it, since retrying a malformed batch forever is worse. Ad blockers will block you; degrade silently and never retry-loop against a blocked endpoint.

## Why it matters

It's the prompt that tests library design rather than UI design — versioning, bundle size, backwards compatibility, and behaving well in an environment you don't own. `sendBeacon` on `visibilitychange` is the specific detail interviewers listen for, because everyone who has actually shipped analytics has lost data to `unload` at least once.

## Key points

- Buffer events and flush on size, time, or `visibilitychange → hidden` — one request per event doesn't survive contact with production.
- Use `navigator.sendBeacon` for the final flush; `fetch` and XHR are cancelled on unload.
- Never bind to `unload`/`beforeunload` — unreliable on mobile and it disqualifies the page from bfcache.
- Ship a stub queue so calls made before initialisation are replayed rather than dropped.
- Persist the queue to storage with a cap so events survive crashes and offline periods.
- Give every event a UUID and timestamp so at-least-once delivery can be deduped server-side.
- Wrap every entry point in try/catch — an SDK exception must never reach the host page's error handler.
- Enforce a bundle-size budget in CI; on a third-party script it's a product requirement.
- Gate all transmission on consent, and strip PII from URLs and referrers by default.
- Back off on 5xx, drop on 4xx, and fail silently when blocked rather than retry-looping.
