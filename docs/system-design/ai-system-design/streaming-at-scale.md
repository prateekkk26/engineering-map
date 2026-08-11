---
title: Streaming at Scale
summary: Long-lived SSE connections through your whole stack — proxies, load balancers, cancellation, resumption, and what breaks at a hundred thousand of them.
level: core
minutes: 20
order: 3
tags: [ai, streaming, realtime]

related:
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - ai/working-with-the-api/streaming-and-server-sent-events
  - system-design/scalability/stateless-services-and-session-state

resources:
  - title: Streaming Messages
    url: https://platform.claude.com/docs/en/build-with-claude/streaming
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Using Server-Sent Events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    source: MDN
    type: docs
    minutes: 20
  - title: NGINX Reverse Proxy — Buffering
    url: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/
    source: NGINX
    type: docs
    minutes: 15
---

## In one line

Model responses take seconds to minutes, so the answer streams — and every layer between the model and the browser has to be told not to buffer, not to time out, and to propagate cancellation.

## What it is

**Server-sent events are the default transport.** One-directional server-to-client, plain HTTP, automatic browser reconnect, no special protocol upgrade. WebSockets are the alternative and are only worth it if the client also sends a continuous stream — for chat, SSE is simpler and enough.

**The things that break, in the order you'll hit them.**

*Buffering.* Reverse proxies buffer responses by default, which turns a stream into one delayed blob. Disable it explicitly (`X-Accel-Buffering: no` or the proxy's config) at every hop, and turn off compression that buffers to fill a block.

*Timeouts.* Load balancers, proxies and gateways all have idle and total-response timeouts measured in seconds. A legitimate response can take minutes. Raise them on the streaming path specifically — not globally, or you lose the protection everywhere else.

*Connections are held open, so concurrency is the capacity metric.* Each in-flight generation holds a connection for its whole duration. Ten thousand concurrent streams is ten thousand open connections through every layer, which means file descriptors, load balancer connection limits and event-loop-friendly servers rather than thread-per-request.

*Deploys.* Rolling out an instance kills its in-flight streams. Connection draining that waits for completion plus a client that can resume is the fix; without either, every deploy truncates somebody's answer mid-sentence.

**Cancellation is a cost issue, not just hygiene.** When the user closes the tab or hits stop, the abort must propagate all the way to the provider request — otherwise generation continues and you pay for tokens nobody will read. Wire the client's `AbortSignal` through your service to the upstream call, and verify it, because this is the one that silently costs money.

**Resumption.** A dropped connection mid-generation loses the partial answer. The robust pattern is to persist tokens server-side as they're produced, keyed by a message ID, so a reconnecting client fetches what it missed and resumes — the same "give me everything after cursor N" mechanism as chat. Without it, a mobile user switching networks loses the response.

**Stateful in the wrong way.** A stream is pinned to the instance serving it. Keep the connection local and everything else shared, exactly as with WebSockets, and don't put anything in that instance's memory that a later request needs.

**Backpressure.** A slow client that doesn't drain will otherwise fill your buffers. Bound the buffer per connection and drop the connection rather than growing memory without limit.

## Why it matters

Every AI product streams, and streaming is where a design that looks fine on the whiteboard meets infrastructure defaults that were built for 200ms request/response. Naming the buffering, timeout, cancellation and deploy problems unprompted signals that you have actually shipped one of these.

## Key points

- SSE over plain HTTP is the right default; WebSockets only earn their place with bidirectional streams.
- Disable proxy buffering at every hop, or the stream arrives as one delayed blob.
- Raise idle and response timeouts on the streaming path only, not globally.
- Concurrent open connections — not requests per second — is the capacity metric for the streaming tier.
- Propagate client cancellation all the way to the provider, or you pay for tokens nobody reads.
- Persist tokens server-side keyed by message ID so a reconnecting client can resume from where it dropped.
- Drain connections on deploy, or every rollout truncates in-flight answers.
- Bound per-connection buffers so a slow client can't grow memory without limit.
