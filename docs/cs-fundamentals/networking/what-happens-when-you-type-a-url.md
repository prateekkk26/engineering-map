---
title: What happens when you type a URL
summary: The end-to-end walkthrough that every layer of the stack hangs off, told once so the rest of networking has somewhere to attach.
level: core
minutes: 30
order: 1
tags: [networking, fundamentals, interview]

related:
  - cs-fundamentals/networking/dns-and-name-resolution
  - cs-fundamentals/networking/tls-and-certificates
  - frontend/browser-platform/critical-rendering-path

resources:
  - title: What happens when you type a URL into your browser
    url: https://github.com/alex/what-happens-when
    source: Alex Gaynor
    type: repo
    minutes: 60
    primary: true
  - title: How Browsers Work
    url: https://web.dev/articles/howbrowserswork
    source: web.dev
    type: article
    minutes: 60
  - title: Populating the page — how browsers work
    url: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work
    source: MDN
    type: docs
    minutes: 25
  - title: Navigation Timing
    url: https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Navigation_timing
    source: MDN
    type: docs
    minutes: 15
---

## In one line

Name resolution, then a transport connection, then a TLS handshake, then an HTTP request, then a response the browser parses into a render — and every performance problem you will ever debug lives in one of those steps.

## What it is

**Parse and pre-request.** The browser first decides whether the input is a URL or a search query, normalises it, and checks the HSTS preload list — which is why `http://` can become `https://` before any packet leaves. A service worker may intercept and answer from cache. The HTTP cache may answer outright, or produce a conditional request with `If-None-Match`.

**Resolve the name.** The stack checks the browser's own DNS cache, then the OS cache and `hosts` file, then asks a resolver, which may recurse through root, TLD, and authoritative servers. Result: one or more IP addresses, held for the record's TTL. This step is invisible until it isn't — a cold DNS lookup can cost 20–120ms before anything else starts.

**Connect.** A TCP three-way handshake (SYN, SYN-ACK, ACK) costs one round trip; QUIC over UDP folds transport and crypto setup together and can complete in one, or zero on resumption. Then TLS negotiates version, cipher, and certificate — one round trip in TLS 1.3, two in 1.2. So a fresh HTTPS connection is roughly 2–3 RTTs before a single byte of your request is sent, which is why connection reuse, keep-alive, and `preconnect` are real optimisations and why fewer origins beat more.

**Request and respond.** The browser sends the method, path, and headers including cookies; proxies, load balancers, and CDNs may answer along the way. The origin returns a status, headers, and a body. Caching headers on that response decide whether the next visit repeats any of this.

**Render.** HTML is parsed incrementally into the DOM, CSS into the CSSOM. Stylesheets block rendering, and synchronous scripts block parsing. Subresources are discovered — some by the preload scanner ahead of the parser — and each new origin repeats DNS, TCP, and TLS. Then style, layout, paint, and composite produce pixels, and hydration or client-side JavaScript takes over.

## Why it matters

This question is asked constantly, and not for the recitation — the interviewer picks a step and drills. Answering it well also gives you a debugging framework: when a page is slow, the waterfall in DevTools maps directly onto these phases, and knowing that TTFB is dominated by DNS + connect + TLS + server time tells you which of four very different fixes to reach for.

## Key points

- HSTS and service workers can short-circuit the request before any network activity happens at all.
- DNS resolution is a separate, cacheable round trip that precedes every connection to a new origin.
- A fresh HTTPS connection costs roughly 2–3 round trips before the request is sent — one for TCP, one or two for TLS.
- QUIC folds transport and crypto setup into one round trip, and zero on resumption, which is HTTP/3's main win.
- Every additional origin repeats DNS, TCP, and TLS, which is why domain sharding is now an anti-pattern.
- Stylesheets block rendering and synchronous scripts block parsing, which is where most render-blocking regressions come from.
- Latency, not bandwidth, dominates page load, because setup is round-trip-bound rather than throughput-bound.
- The DevTools network waterfall is this list drawn to scale — read it as DNS, connect, TLS, wait, download, and fix the widest band.
