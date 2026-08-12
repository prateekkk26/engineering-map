---
title: Server-Sent Events from a Service
summary: The wire format, the headers that stop proxies buffering you, and the resumability you get by emitting event IDs.
level: core
minutes: 20
order: 2
tags: [realtime, sse, http, streaming]

related:
  - backend/realtime/proxying-an-llm-stream
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - backend/node-runtime/streams-and-backpressure

resources:
  - title: Using server-sent events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: EventSource
    url: https://developer.mozilla.org/en-US/docs/Web/API/EventSource
    source: MDN
    type: docs
    minutes: 15
  - title: nginx — proxy_buffering
    url: https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering
    source: nginx
    type: docs
    minutes: 10
---

## In one line

SSE is a `text/event-stream` response you never finish writing, framed as `field: value` lines with a blank line ending each event.

## What it is

The format is small enough to memorise. Each event is one or more lines — `data:`, optionally `event:`, `id:`, `retry:` — terminated by a **blank line**, which is what flushes it to the client. Multi-line data means repeating `data:`. Miss the double newline and the client sits waiting for an event you already sent, which is the most common first bug.

Three headers matter: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, and `Connection: keep-alive`. Then the part that catches everyone in production: **intermediaries buffer**. nginx will hold your stream until the response completes unless `proxy_buffering off` (or `X-Accel-Buffering: no`), and some CDNs and platform proxies do the same. The symptom is a stream that works perfectly on localhost and arrives all at once in production.

**Resumability** is SSE's underrated feature. Emit `id:` on each event and the browser's `EventSource` sends `Last-Event-ID` on reconnect, letting you replay what was missed — provided you kept a short buffer of recent events keyed by stream. Without that buffer, reconnection silently drops data. `retry:` sets the client's reconnect delay.

**Keep the connection alive.** Send a comment line (`: ping`) every 15–30 seconds; without traffic, load balancers and mobile networks close idle connections, and the client can't tell a healthy idle stream from a dead one. Correspondingly, set the server's response timeout to something long or the platform will cut you off mid-stream — a common surprise on serverless runtimes with a fixed maximum duration.

Two Node-specific notes. In a route handler, return a `ReadableStream` (Web Streams) or write to the response and call `flushHeaders()`; and **listen for client disconnect** (`request.signal`'s abort, or the response `'close'` event) to stop producing — otherwise a closed tab leaves you generating events, and in an AI app, spending money, for nobody.

`EventSource` itself can't send custom headers, so browser SSE authenticates with cookies; if you need a bearer token, use `fetch` with a streaming body reader instead, which is what most AI SDKs do.

## Why it matters

This is the transport behind every streaming AI feature, and implementing one in a take-home is now common. The details that separate a working demo from a working product — buffering proxies, heartbeats, disconnect handling, event IDs — are exactly the ones interviewers ask about after the happy path works.

## Key points

- An event ends at a blank line; forgetting the second newline is the classic silent failure.
- `text/event-stream`, `no-cache`, and disabled proxy buffering are all required in production.
- nginx and platform proxies will buffer a stream into one response unless explicitly told not to.
- Emitting `id:` gives you resumable streams via `Last-Event-ID`, but only if you keep a replay buffer.
- Heartbeat comments every 15–30 seconds stop idle connections being reaped by intermediaries.
- Detect client disconnect and stop producing — otherwise abandoned streams keep consuming resources and tokens.
- `EventSource` can't set headers, so browser SSE uses cookie auth; token auth needs streaming `fetch`.
