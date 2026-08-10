---
title: Network & Delivery
summary: Compression, connection setup, and edge delivery — the wins that live between your build output and the user's device.
level: core
minutes: 20
order: 11
tags: [performance, network, cdn]

related:
  - frontend/browser-platform/http-versions-and-transport
  - frontend/tooling/cdn-and-edge-delivery
  - frontend/performance/asset-caching-strategy

resources:
  - title: Content encoding
    url: https://web.dev/articles/codelab-text-compression-brotli
    source: web.dev
    type: article
    minutes: 20
    primary: true
  - title: Content delivery networks
    url: https://web.dev/articles/content-delivery-networks
    source: web.dev
    type: article
    minutes: 30
  - title: Time to First Byte (TTFB)
    url: https://web.dev/articles/ttfb
    source: web.dev
    type: article
    minutes: 20
---

## In one line

Before optimising your code, check the transport: compression, TLS setup, and physical distance to the user routinely cost more than anything in the bundle.

## What it is

**Compression** is the cheapest win and is still missed. Brotli beats gzip by roughly 15–20% on text and is universally supported; static assets should be pre-compressed at build time at maximum level, since compression time does not matter for something compressed once. Dynamic responses use a lower level to balance CPU. Do not compress already-compressed formats — images, video, WOFF2 — you spend CPU to add bytes.

**TTFB** decomposes into DNS, TCP, TLS, and server processing. If it is high, look at which part before touching application code: a distant origin costs a full round trip for each of those phases, which is why an edge CDN with TLS termination close to the user often halves it without any application change. `103 Early Hints` lets the server send resource hints while it is still working on the response.

**CDN** delivery is the structural lever. Static assets served from the edge, cached with hashed filenames and long lifetimes, mean most requests never reach your origin. Beyond static files, an edge cache for HTML with short TTLs and stale-while-revalidate gives most of the benefit of static hosting to dynamic pages.

Connection setup deserves attention on mobile, where latency dominates bandwidth. Each new origin costs DNS, TCP, and TLS — several round trips before a byte of content. That is the real argument against a page that pulls from eight third-party origins, and the reason `preconnect` matters for the ones you genuinely need.

Two measurement notes. Test from where your users are, not from your office — a CDN's benefit is invisible on a fast connection near the origin. And check that compression is actually applied in production: `content-encoding` on the response, verified in the network panel, because a misconfigured proxy silently disabling it is a common and expensive mistake.

## Why it matters

These wins are large, cheap, and outside the application code, so they are frequently the fastest improvement available — and equally frequently overlooked because frontend attention defaults to the bundle.

TTFB and delivery also come up in system design discussions, where knowing what a CDN does for a dynamic page is more useful than knowing it caches images.

## Key points

- Brotli at maximum level for pre-compressed static assets, a lower level for dynamic responses, none for images and video.
- Decompose TTFB into DNS, TCP, TLS, and server time before blaming the application.
- An edge CDN with TLS termination near the user removes round trips that no code change can.
- Short-TTL edge caching with stale-while-revalidate extends CDN benefits to dynamic HTML.
- Every additional origin costs a full connection setup — a real cost on high-latency mobile networks.
- Verify `content-encoding` in production; silently disabled compression is a common misconfiguration.
