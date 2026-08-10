---
title: Realtime State Sync
summary: Keeping the UI current when the server pushes — transport choice, reconciliation with the cache, and what happens on reconnect.
level: deep
minutes: 25
order: 13
tags: [realtime, state, websockets]

related:
  - frontend/browser-platform/realtime-transports
  - frontend/state-and-data/optimistic-updates-and-rollback
  - system-design/frontend-system-design/design-a-chat-application

resources:
  - title: WebSockets
    url: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Server-sent events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    source: MDN
    type: docs
    minutes: 20
  - title: WebSockets in TanStack Query
    url: https://tkdodo.eu/blog/using-web-sockets-with-react-query
    source: TkDodo
    type: article
    minutes: 20
---

## In one line

Realtime is not a transport problem, it is a reconciliation problem: the hard part is deciding what a pushed message does to a cache that also has optimistic writes and in-flight requests in it.

## What it is

Pick the transport by direction. **SSE** is server-to-client only, runs over plain HTTP, reconnects automatically with `Last-Event-ID`, and is the right default for notifications, live counters, and token streams. **WebSockets** are bidirectional and the answer when the client also sends — chat, presence, collaborative editing — at the cost of owning reconnection, heartbeats, and authentication yourself. **Polling** remains legitimate: a five-second interval is often the correct engineering answer for something that changes rarely, and it costs nothing to operate.

The reconciliation decision comes next, and there are two shapes. Push **events** ("invalidate order 42") and let the client refetch: simple, always consistent with the server, more requests. Or push **payloads** (the new order object) and write them into the cache: fewer requests, but now the message shape is a second API contract that can drift from the fetch endpoint, and a partial payload can overwrite fields the client already had.

Then the cases that actually break implementations. A push arriving for a record with an optimistic write in flight — decide whether the server or the local write wins, and be consistent. Out-of-order delivery, which needs a version or timestamp per record so an older message cannot overwrite a newer one. And the reconnect gap: while the socket was down, updates happened. Either the server replays from a cursor, or the client refetches the affected queries on reconnect. Without one of those, the UI is quietly wrong until the next unrelated refresh.

Volume is the other practical constraint. A high-frequency stream that sets state per message will re-render the app hundreds of times a second; batch messages into animation frames or fixed windows and apply them together.

Finally, treat the socket as untrusted input. Authenticate on connect, authorise per subscription, and validate payloads — a socket that lets a client subscribe to any room by id is a common and serious hole.

## Why it matters

Chat, presence, live dashboards, and streaming AI output are core to the products these companies build, so this comes up in both design rounds and take-homes.

The distinguishing answer is not naming WebSockets — it is reconnect handling and cache reconciliation, which is where real implementations fail.

## Key points

- SSE for server-to-client over HTTP with built-in reconnection; WebSockets when the client also sends; polling when the data changes rarely.
- Pushing invalidation events is simpler and always consistent; pushing payloads is faster and creates a second contract to keep in sync.
- Decide explicitly whether a server push or an in-flight optimistic write wins, and apply the rule consistently.
- Version or timestamp records so late-arriving messages cannot overwrite newer state.
- Handle the reconnect gap with server replay from a cursor or a client-side refetch, or the UI stays silently stale.
- Batch high-frequency messages per frame instead of setting state per message.
- Authenticate on connect and authorise every subscription — socket payloads are untrusted input.
