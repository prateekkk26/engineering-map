---
title: Design a Chat System
summary: Persistent connections at scale — routing a message to whichever server holds the recipient, ordering, delivery receipts, and offline sync.
level: core
minutes: 25
order: 4
tags: [system-design, classic-problem, realtime]

related:
  - system-design/frontend-system-design/design-a-chat-application
  - system-design/scalability/stateless-services-and-session-state
  - system-design/distributed-systems/clocks-and-ordering

resources:
  - title: How Discord Stores Billions of Messages
    url: https://discord.com/blog/how-discord-stores-billions-of-messages
    source: Discord
    type: article
    minutes: 20
    primary: true
  - title: Scaling to 12 Million Concurrent Connections
    url: https://blog.whatsapp.com/1-million-is-so-2011
    source: WhatsApp
    type: article
    minutes: 10 # unverified
  - title: The WebSocket API
    url: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
    source: MDN
    type: docs
    minutes: 20
---

## In one line

Every online user holds a WebSocket to one of many gateway servers, so the core problem is knowing which server holds a given recipient and getting the message there.

## What it is

**Scope.** One-to-one messaging, group chat (bounded size — say 500), online presence, delivery and read receipts, message history, push notifications when offline. Park voice, video and end-to-end encryption unless asked; if E2EE comes up, note that it rules out server-side search and moderation, which is the interesting part.

**Estimate.** 10M DAU, 20 messages each = 200M messages/day ≈ 2,300/s, peaking maybe 3× that. Concurrent connections are the number that actually sizes the system: if a third are online, that's ~3M concurrent WebSockets. A tuned connection server handles order-of-100K connections, so ~30–60 gateway servers. Storage at ~1KB/message is ~200GB/day, which forces a retention decision.

**The architecture.**

*Gateway (connection) servers* hold the WebSockets. Stateful by nature, so keep them thin: connection handling and nothing else.

*A presence/routing registry* — Redis mapping `user_id → gateway_id` (plus device, since users have several), written on connect, removed on disconnect, with a TTL refreshed by heartbeat so crashed servers' entries expire.

*Message service* — validates, persists, then delivers: look up the recipient's gateway, forward the message to it (direct RPC, or a pub/sub channel per gateway), and it pushes down the socket. If the user is offline, persist only and enqueue a push notification.

**Persist before delivering**, not after. The message must survive a gateway crash mid-delivery, and the sender's acknowledgement should mean "durably stored", which is a different thing from "delivered".

**Storage.** Access is always "recent messages in this conversation, paginating backwards" — so partition by conversation and cluster by time, which is exactly the shape a wide-column store is good at (Discord's answer) and also exactly what a Postgres table partitioned by conversation and time does at smaller scale.

**Ordering.** Don't trust client clocks. Assign a per-conversation sequence number server-side; clients sort and render by it, and can detect gaps and request what they missed. Cross-conversation global ordering isn't needed and shouldn't be promised.

**Offline sync.** Each client tracks the last sequence number it has per conversation; on reconnect it asks for everything after that. This single mechanism covers reconnects, multi-device, and app restarts.

**Receipts.** Sent (server has it), delivered (recipient's device has it), read (user opened it) — three separate events, each a small write and a fan-out back to the sender. In a large group this is the volume problem: N participants × M messages of receipt traffic, so batch and debounce them.

**Groups.** Fan-out at delivery time to each member's gateway. Bound group size, or you've recreated the celebrity fan-out problem with worse latency requirements.

## Why it matters

It's the standard test of whether you can design around persistent connections rather than request/response, and the routing question — "user A is connected to server 3, user B to server 17, how does the message get there?" — is the crux the interviewer is waiting for. It also has a direct frontend counterpart in these loops, so both halves are worth holding.

## Key points

- Concurrent connection count, not message rate, sizes the gateway tier.
- Keep gateways thin and stateful only in connections; put logic in stateless services behind them.
- A `user → gateway` registry in Redis with heartbeat TTLs is what makes routing possible.
- Persist the message before delivering it, and acknowledge durability rather than delivery.
- Partition message storage by conversation and cluster by time — that's the only read pattern.
- Server-assigned per-conversation sequence numbers give ordering and gap detection without trusting clocks.
- Clients resync by asking for everything after their last sequence number — covers reconnect and multi-device.
- Sent, delivered and read are three separate events; batch receipts or they dominate traffic in groups.
- Offline recipients get persistence plus a push notification, not a delivery attempt.
