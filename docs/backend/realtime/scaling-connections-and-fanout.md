---
title: Scaling Connections & Fanout
summary: Why stateful connections break horizontal scaling, and the three ways a message reaches a client attached to a different instance.
level: deep
minutes: 25
order: 5
tags: [realtime, scaling, pubsub]

related:
  - backend/realtime/websockets-in-production
  - system-design/ai-system-design/streaming-at-scale
  - system-design/scalability/stateless-services-and-session-state

resources:
  - title: Scaling WebSockets
    url: https://ably.com/topic/the-challenge-of-scaling-websockets
    source: Ably
    type: article
    minutes: 20
    primary: true
  - title: Redis Pub/Sub
    url: https://redis.io/docs/latest/develop/interact/pubsub/
    source: Redis
    type: docs
    minutes: 15
  - title: Durable Objects
    url: https://developers.cloudflare.com/durable-objects/
    source: Cloudflare
    type: docs
    minutes: 25
---

## In one line

Once connections live on specific instances, publishing an event means finding the instance holding the recipient — and the three answers are broadcast to all of them, route by lookup, or put the state somewhere addressable.

## What it is

A stateless HTTP service scales by adding replicas because no request cares which one it hits. A connection-holding service breaks that: user A is attached to instance 2, and the event that concerns them was produced on instance 5. Three approaches.

**Broadcast via pub/sub.** Every instance subscribes to a Redis (or NATS) channel; a publisher sends once, every instance receives it and forwards to whichever of its own connections care. Simple, and the default for good reason — but every instance processes every message, so cost is O(instances × messages) and it stops being free at high fan-in. Channel-per-room or per-tenant reduces the waste substantially.

**Routing by lookup.** Keep a registry of connection → instance in Redis and deliver directly to the owning instance. Efficient at large scale; the registry becomes a consistency problem of its own, since it goes stale on every crash and deploy.

**Addressable state.** Cloudflare Durable Objects (and actor-model systems generally) give each room or document a single addressable instance that owns its state and its connections. It removes the routing problem by construction and is the cleanest model for collaborative surfaces — at the cost of committing to a platform.

Beyond routing, the constraints that shape capacity: **each connection costs memory** (tens of KB, so a hundred thousand connections is real memory before any application state), file descriptors and ephemeral ports have OS limits you must raise, and **load balancers need long idle timeouts** or they'll cut healthy but quiet connections. Sticky sessions help a reconnecting client return to its instance but weaken load distribution and don't survive a deploy.

Two failure modes worth naming. **Fan-out amplification**: one write to a room of ten thousand becomes ten thousand sends; batch and coalesce updates (send at most N per second per client) rather than forwarding every change. And **the reconnect storm** after a deploy or a network blip, where every client reconnects simultaneously — jittered backoff on the client, and connection-rate limiting on the server, are what keep the recovery from being worse than the incident.

The honest senior take: at low-to-mid scale, a managed realtime provider is usually the right call, because this is a lot of infrastructure to own for a feature that isn't your product.

## Why it matters

"It works with one instance — now scale it to twenty" is the standard second half of any realtime design question, and pub/sub versus routing versus addressable state is the axis it turns on. The capacity arithmetic matters too: reasoning in connections rather than requests per second is what makes an answer sound like it came from running the thing.

## Key points

- Connections pin state to an instance, which is what breaks the stateless scaling model.
- Redis pub/sub is the simple default; every instance sees every message, so use narrow channels.
- A connection registry routes efficiently but must be reconciled after crashes and deploys.
- Actor-style addressable state (Durable Objects) removes routing entirely at the cost of platform lock-in.
- Each connection costs memory and a file descriptor — capacity is counted in connections, not requests.
- Load balancer idle timeouts kill quiet connections; heartbeats and longer timeouts are both needed.
- Coalesce and batch fan-out updates, or one busy room saturates your egress.
- Reconnect storms after deploys need client jitter plus server-side connection-rate limits.
