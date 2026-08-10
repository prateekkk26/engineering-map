---
title: Realtime Transports
summary: WebSockets, SSE, long polling and WebTransport — choosing by direction, infrastructure and failure behaviour.
level: core
minutes: 20
order: 14
tags: [realtime, network, websockets]

related:
  - frontend/state-and-data/realtime-state-sync
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - system-design/frontend-system-design/design-a-chat-application

resources:
  - title: The WebSocket API
    url: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Using server-sent events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    source: MDN
    type: docs
    minutes: 20
  - title: WebTransport
    url: https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API
    source: MDN
    type: docs
    minutes: 20
---

## In one line

Choose by direction first: server-to-client only is SSE, bidirectional is WebSockets, and anything that changes rarely is still best served by polling.

## What it is

**Polling** asks on an interval. It is unfashionable and frequently correct: no persistent connections, no reconnect logic, works through every proxy, and scales with ordinary HTTP infrastructure. For data that changes every few minutes, a poll is the right engineering answer. Long polling — holding the request open until there is news — reduces latency at the cost of tying up a connection per client.

**Server-sent events** are a one-way stream over ordinary HTTP. The browser's `EventSource` reconnects automatically and resumes with `Last-Event-ID`, which is a substantial amount of reliability you would otherwise write yourself. Text only, and historically limited to six connections per origin under HTTP/1.1 — a real trap with multiple tabs, though multiplexing removes it over HTTP/2. Ideal for notifications, live counters, progress, and token streams.

**WebSockets** upgrade the connection to a full-duplex channel. Necessary when the client sends frequently — chat, presence, collaborative cursors, multiplayer. The cost is that you own everything: reconnection with backoff, heartbeats to detect dead connections, message ordering, authentication on connect, and reauthorisation on reconnect. Libraries like Socket.IO exist because that list is long, though they add their own protocol.

**WebTransport** over HTTP/3 is the newer option, offering multiple streams and unreliable datagrams — useful for games and media where dropping a late packet beats delivering it. Support is still limited.

Two considerations that decide real deployments. **Infrastructure**: WebSockets need sticky sessions or a shared pub/sub layer behind a load balancer, and some corporate proxies still break them; SSE and polling ride normal HTTP everywhere. **Fallback**: whatever you pick, the connection will drop, so the reconnect and gap-filling story is part of the design, not an afterthought.

For LLM streaming specifically, the common shape is a route handler returning a `ReadableStream` over plain HTTP — effectively SSE — because the direction is one-way and the client's only other action is cancelling.

## Why it matters

Chat, live dashboards, and streaming model output are core to these products, so the transport question comes up in most design rounds — and the expected answer includes reconnection and infrastructure, not just the protocol name.

Reaching for WebSockets when SSE would do is a common over-engineering tell.

## Key points

- Direction decides first: SSE for server-to-client, WebSockets when the client sends too, polling when changes are infrequent.
- `EventSource` gives automatic reconnection and `Last-Event-ID` resumption for free — a real reliability advantage.
- SSE is text-only and was connection-limited per origin under HTTP/1.1; HTTP/2 multiplexing removes that.
- WebSockets require you to own reconnection, heartbeats, ordering, and auth on every reconnect.
- WebSockets need sticky sessions or shared pub/sub behind a load balancer; SSE and polling use ordinary HTTP paths.
- WebTransport adds unreliable datagrams over HTTP/3 for latency-sensitive cases, with limited support.
- LLM token streaming is one-way, so a streamed HTTP response is usually the right shape.
