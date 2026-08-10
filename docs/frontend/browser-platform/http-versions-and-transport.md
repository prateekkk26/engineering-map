---
title: HTTP Versions & Transport
summary: What HTTP/2 and HTTP/3 changed, which old optimisations they made harmful, and where head-of-line blocking actually lives.
level: core
minutes: 20
order: 13
tags: [http, network, performance]

related:
  - frontend/browser-platform/http-caching
  - frontend/performance/network-and-delivery
  - frontend/tooling/cdn-and-edge-delivery

resources:
  - title: Evolution of HTTP
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: HTTP/3 explained
    url: https://http3-explained.haxx.se/en
    source: Daniel Stenberg
    type: book
  - title: Preload, prefetch and other tags
    url: https://web.dev/articles/preload-critical-assets
    source: web.dev
    type: article
    minutes: 20
---

## In one line

HTTP/2 multiplexes many requests over one TCP connection, HTTP/3 moves that to QUIC over UDP to remove TCP's head-of-line blocking, and both make the old "bundle everything into one file" advice partly obsolete.

## What it is

**HTTP/1.1** allowed one request at a time per connection, so browsers opened about six per origin and everything queued behind them. That constraint produced a decade of workarounds: concatenating scripts, sprite sheets, inlining images as data URIs, and sharding assets across subdomains to buy more connections.

**HTTP/2** introduced multiplexing: many concurrent streams over a single connection, with binary framing and header compression (HPACK). The workarounds became counterproductive. Sharding across domains now costs extra connections and TLS handshakes for no benefit. One giant bundle means a one-line change invalidates the whole file, where several medium chunks would have kept most of the cache — so finer-grained splitting became viable and often better.

What HTTP/2 did *not* fix is TCP-level head-of-line blocking. Streams are independent at the HTTP layer, but they share one TCP connection, and TCP guarantees in-order delivery — so one lost packet stalls every stream until it is retransmitted. On a lossy mobile connection this is worse than several HTTP/1.1 connections would have been.

**HTTP/3** fixes exactly that by replacing TCP with QUIC over UDP. Streams are independent at the transport layer, so a lost packet stalls only its own stream. QUIC also folds the TLS handshake into the connection setup — one round trip instead of two or three, and zero for resumption — which is a real win on high-latency mobile networks. Connection migration means switching from Wi-Fi to cellular does not drop the connection.

Practically, you get most of this by hosting behind a modern CDN. What remains under your control is the resource hints: `preconnect` for third-party origins you will definitely use, `preload` for late-discovered critical resources such as fonts, `dns-prefetch` as a cheaper hint, and `prefetch` for next-navigation resources. Server push is gone — removed from Chrome and effectively dead, replaced by `103 Early Hints`.

## Why it matters

A lot of received frontend wisdom about bundling and domain sharding dates from HTTP/1.1 and is now actively wrong, so knowing the transport is what lets you evaluate build advice.

It is also the substance behind "how would you improve loading over a slow mobile connection?", where the honest answers are fewer bytes, fewer connections, and HTTP/3.

## Key points

- HTTP/1.1's one-request-per-connection limit produced concatenation, sprites, and domain sharding — all now counterproductive.
- HTTP/2 multiplexes streams over one connection with header compression, making finer-grained chunking cache-friendlier.
- HTTP/2 still suffers TCP head-of-line blocking: one lost packet stalls every stream on the connection.
- HTTP/3 over QUIC makes streams independent at the transport layer and cuts handshake round trips.
- Connection migration keeps a QUIC session alive across a network change, which matters on mobile.
- Use `preconnect` and `preload` deliberately; server push is dead and `103 Early Hints` replaced it.
