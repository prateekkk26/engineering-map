---
title: WebSockets in Production
summary: Everything HTTP was doing for you that you now have to write — auth, heartbeats, reconnection with state recovery, and per-connection limits.
level: core
minutes: 25
order: 3
tags: [realtime, websockets, reliability]

related:
  - backend/realtime/scaling-connections-and-fanout
  - backend/realtime/choosing-a-realtime-transport
  - frontend/state-and-data/realtime-state-sync

resources:
  - title: Writing WebSocket servers
    url: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
    source: MDN
    type: docs
    minutes: 25
  - title: ws — Node.js WebSocket library
    url: https://github.com/websockets/ws
    source: ws
    type: repo
    minutes: 20
    primary: true
  - title: Everything you need to know about WebSocket authentication
    url: https://ably.com/blog/websocket-authentication
    source: Ably
    type: article
    minutes: 15
---

## In one line

A WebSocket is a long-lived stateful connection, and every hard part of running one comes from that state surviving longer than your deploys, your tokens, and the user's network.

## What it is

**Authentication happens once, at the handshake, and then never again.** That is the first trap: a connection opened with a valid token stays open after the token expires, after the user logs out, and after their permissions are revoked. The fix is to re-check authorisation periodically or on sensitive messages, and to close connections when a session is invalidated. The handshake itself is a normal HTTP request, so cookies work — the browser `WebSocket` API can't set headers, so bearer tokens go in a short-lived ticket obtained over HTTP, not in the query string, where they land in logs.

**Heartbeats are mandatory.** TCP will not tell you the client vanished; a laptop that closed its lid leaves a connection that looks perfectly healthy. Use protocol-level ping/pong with a timeout, mark connections dead on missed pongs, and terminate them — otherwise you leak connections and broadcast to sockets nobody is reading.

**Reconnection is a client-and-server contract**, not just a client retry loop. The client backs off exponentially with jitter; the server must let it resume — a sequence number per stream, so on reconnect the client says "I have up to 412" and you send the rest, or tell it to resync from scratch. Without this, a reconnect silently loses messages, which is the bug users report as "it stops updating sometimes".

**Backpressure applies here too.** A slow client's send buffer grows in your process; check `bufferedAmount` (or the server-side equivalent) and disconnect or drop for clients that can't keep up, or one bad connection becomes a memory leak.

**Deploys are the recurring operational pain.** Every deploy drops every connection, and thousands of clients reconnecting at once is a self-inflicted thundering herd — jittered client backoff and staged rollouts are the mitigation. Related: long-lived connections don't work on serverless functions at all, which forces either a long-running service or a managed realtime provider.

Design the message layer deliberately: a typed envelope (`{ type, id, payload }`), a version field, and validation on every inbound message. It is an API surface with no status codes, and it needs the same rigour.

## Why it matters

Collaborative and chat features are common take-home briefs, and interviewers ask what happens on reconnect, on deploy, and to auth — the three places naive implementations break. Being able to say "a WebSocket is stateful, so I need heartbeats, resumable sequence numbers, and a plan for deploys" covers the whole follow-up chain in one answer.

## Key points

- Auth is checked at the handshake only; expiry and revocation need explicit re-checks or forced closes.
- Browser WebSockets can't set headers — use cookies or a short-lived ticket, never a token in the URL.
- Application-level ping/pong is the only reliable way to detect a client that has silently gone away.
- Reconnection needs server-side resumability (sequence numbers), or clients quietly miss messages.
- A slow consumer's outbound buffer grows in your process; drop or disconnect on backpressure.
- Every deploy disconnects everyone, so client backoff must be jittered and rollouts staged.
- Serverless runtimes can't hold connections — this choice constrains your hosting model.
- Treat messages as an API: typed envelope, version, and validation on every inbound frame.
