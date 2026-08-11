---
title: TCP, UDP, and QUIC
summary: Reliable ordered bytes, unreliable datagrams, and the newer transport that keeps reliability without inheriting TCP's head-of-line blocking.
level: core
minutes: 25
order: 3
tags: [networking, fundamentals, transport]

related:
  - cs-fundamentals/networking/what-happens-when-you-type-a-url
  - cs-fundamentals/networking/latency-bandwidth-and-the-speed-of-light
  - frontend/browser-platform/http-versions-and-transport

resources:
  - title: Building blocks of TCP
    url: https://hpbn.co/building-blocks-of-tcp/
    source: High Performance Browser Networking
    type: book
    primary: true
  - title: What is QUIC?
    url: https://www.cloudflare.com/learning/performance/what-is-http3/
    source: Cloudflare
    type: article
    minutes: 20
  - title: User Datagram Protocol
    url: https://en.wikipedia.org/wiki/User_Datagram_Protocol
    source: Wikipedia
    type: docs
    minutes: 10
  - title: TCP congestion control
    url: https://en.wikipedia.org/wiki/TCP_congestion_control
    source: Wikipedia
    type: docs
    minutes: 25
---

## In one line

TCP gives you a reliable, ordered byte stream at the cost of setup latency and head-of-line blocking; UDP gives you unreliable datagrams and leaves everything else to you; QUIC builds TCP's guarantees on top of UDP, per-stream.

## What it is

**TCP** is connection-oriented. A three-way handshake establishes state on both ends, then the protocol guarantees that every byte arrives, exactly once, in order — via sequence numbers, acknowledgements, and retransmission. It also manages flow (the receive window stops a fast sender overwhelming a slow receiver) and congestion (slow start ramps the sending rate up and backs off on loss). Slow start is why a brand-new connection is slower than a warm one for the first few round trips, and why connection reuse matters for performance.

Its cost is **head-of-line blocking**. Because TCP presents a single ordered stream, one lost packet stalls delivery of everything behind it — even bytes that already arrived. HTTP/2 multiplexes many logical streams over one TCP connection, so a single lost packet stalls all of them. HTTP/2 solved application-layer HOL blocking and could not solve the transport-layer version.

**UDP** sends independent datagrams with no handshake, no ordering, no retransmission, no congestion control. It is not "worse" — it is the right base when late data is useless. Live video and voice would rather drop a frame than pause for it, and DNS queries are a single small request/response where a connection setup would double the cost. If you need reliability on UDP you build it yourself, which is exactly what QUIC does.

**QUIC** runs over UDP and provides reliability, ordering, and congestion control *per stream*, so a lost packet stalls only its own stream. It integrates TLS 1.3 into the handshake, cutting connection setup to one round trip and zero on resumption. Connections are identified by a connection ID rather than the IP/port four-tuple, so switching from Wi-Fi to cellular survives without reconnecting. That is HTTP/3, and the practical wins are largest exactly where networks are worst — mobile, lossy, high-latency.

Because QUIC lives in user space rather than the kernel, it can evolve without OS updates — but it also faces middleboxes that block or throttle UDP, which is why clients keep a TCP fallback.

## Why it matters

This is the layer under every "why is HTTP/3 faster" and "why do we still see slow first loads" question, and it explains real behaviour you can observe: why the first request on a cold connection is slow, why one dropped packet degrades an entire HTTP/2 page, and why a video call survives conditions that would stall a download. It also grounds the frontend advice to reuse connections and reduce origins.

## Key points

- TCP guarantees reliable in-order delivery through sequence numbers, acknowledgements, and retransmission, at the cost of a handshake and connection state.
- Slow start means a new TCP connection ramps up over several round trips, so reused warm connections are meaningfully faster.
- Head-of-line blocking is a transport-level property: one lost packet stalls every HTTP/2 stream sharing that connection.
- UDP is the right choice when stale data is worthless — voice, video, game state, DNS — because retransmission would arrive too late to matter.
- QUIC provides per-stream reliability over UDP, so loss affects only the stream that lost a packet.
- QUIC folds TLS 1.3 into the transport handshake, giving 1-RTT connection setup and 0-RTT on resumption.
- QUIC connection IDs survive an IP change, so a network switch does not drop the connection.
- QUIC is user-space and evolvable, but UDP-blocking middleboxes mean a TCP fallback is still required.
