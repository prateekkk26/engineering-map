---
title: Choosing a Realtime Transport
summary: Polling, SSE and WebSockets compared on the axes that actually decide it — direction, infrastructure tolerance, and reconnection.
level: core
minutes: 20
order: 1
tags: [realtime, transport, architecture]

related:
  - backend/realtime/server-sent-events-from-a-service
  - backend/realtime/websockets-in-production
  - frontend/state-and-data/realtime-state-sync

resources:
  - title: WebSockets vs Server-Sent Events
    url: https://ably.com/blog/websockets-vs-sse
    source: Ably
    type: article
    minutes: 20
    primary: true
  - title: Server-sent events
    url: https://html.spec.whatwg.org/multipage/server-sent-events.html
    source: WHATWG
    type: docs
    minutes: 25
  - title: The WebSocket Protocol (RFC 6455)
    url: https://www.rfc-editor.org/rfc/rfc6455
    source: IETF
    type: docs
    minutes: 40
---

## In one line

Pick the least stateful transport that carries the direction of data you actually need: polling for occasional updates, SSE for server-to-client streams, WebSockets only when the client must push too.

## What it is

**Polling** is a request on a timer. It is unfashionable and frequently correct: no connection state, works through every proxy, trivially load-balanced, and if updates are minutes apart it wastes almost nothing. Its cost is latency plus a request per client per interval — at ten thousand clients polling every five seconds, that's 2,000 requests/second of mostly-empty responses.

**Server-sent events** is one long-lived HTTP response that the server keeps writing to. Unidirectional, text-only, and standard HTTP — so it passes through proxies, works with your existing auth cookies and middleware, and gets automatic reconnection with `Last-Event-ID` from the browser for free. This is the default for streamed model output, notifications, progress and live dashboards. Two real constraints: the ~6-connection-per-origin limit under HTTP/1.1 (a non-issue over HTTP/2, which multiplexes) and the need for the client to send anything over a separate normal request.

**WebSockets** upgrade to a full-duplex binary-capable connection. You need them when the client sends frequently — collaborative editing, multiplayer cursors, chat with typing indicators, anything with sub-second bidirectional traffic. The price is that you leave HTTP behind: authentication, reconnection with state recovery, heartbeats, message framing and backpressure all become yours to implement, and every stateful connection is a scaling constraint.

**WebTransport** over HTTP/3 is the emerging option, with unreliable datagrams for latency-critical cases. Worth naming, not worth choosing yet for a general product.

The framing that lands well in an interview: **direction and frequency**. Server-to-client only → SSE. Frequent client-to-server → WebSockets. Neither frequent nor urgent → polling. And a fourth, often best answer at low scale: **don't hold a connection at all** — hand it to a managed service (Pusher, Ably, Supabase Realtime) and keep your API stateless, because connection management is a disproportionate amount of the operational work.

## Why it matters

Every AI product streams, and every collaborative feature pushes, so this choice comes up in both the practical round and frontend system design. The senior signal is choosing SSE for a one-way stream instead of reaching for WebSockets by reflex, and being able to say precisely what you'd have to build if you did.

## Key points

- Polling is stateless and infrastructure-friendly; at low update frequency it is genuinely the right answer.
- SSE is plain HTTP, so cookies, auth middleware, proxies and CDNs work unchanged.
- The browser reconnects SSE automatically and replays from `Last-Event-ID` if you emit event IDs.
- HTTP/1.1's per-origin connection cap bites SSE in multi-tab apps; HTTP/2 multiplexing removes it.
- WebSockets are for frequent client-to-server traffic; one-way streams don't justify their operational cost.
- Leaving HTTP means rebuilding auth, reconnection, heartbeats and backpressure yourself.
- A managed realtime service keeps your own services stateless, which is often worth more than the fee.
