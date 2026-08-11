---
title: Reverse Proxies & API Gateways
summary: The layer that owns TLS, auth, rate limiting and routing, so that every service behind it doesn't have to.
level: core
minutes: 20
order: 2
tags: [infrastructure, api, security]

related:
  - system-design/building-blocks/dns-and-load-balancing
  - system-design/scalability/rate-limiting-and-backpressure
  - system-design/ai-system-design/designing-an-llm-gateway

resources:
  - title: What Is an API Gateway?
    url: https://www.nginx.com/learn/api-gateway/
    source: NGINX
    type: article
    minutes: 15
  - title: API Gateway Pattern
    url: https://microservices.io/patterns/apigateway.html
    source: Chris Richardson
    type: article
    minutes: 15
    primary: true
  - title: Backends for Frontends
    url: https://samnewman.io/patterns/architectural/bff/
    source: Sam Newman
    type: article
    minutes: 15
---

## In one line

A reverse proxy is one hop that terminates TLS and forwards requests; an API gateway is the same hop given responsibility for auth, rate limiting, routing and request shaping across many services.

## What it is

**Reverse proxy.** Sits in front of your servers and forwards to them. What it earns its place with: TLS termination in one place, compression, static-asset serving, request buffering so slow clients don't tie up application threads, connection pooling to backends, and access logs. NGINX, Envoy, HAProxy, Caddy.

**API gateway.** A reverse proxy that also owns cross-cutting concerns:

- **Authentication and authorization** — validate the token once at the edge, pass a verified identity inward. Services stop each implementing JWT parsing.
- **Rate limiting and quotas**, per API key or per tenant.
- **Routing and versioning** — `/api/v2/orders` to the orders service; header- or percentage-based routing for canaries.
- **Request/response transformation**, aggregation of several backend calls, protocol translation (REST in, gRPC out).
- **Observability** — one place where every request is counted, timed and traced.

**Backend for Frontend (BFF).** A gateway per client type rather than one shared one. The web BFF returns exactly what the web app renders; the mobile BFF returns a smaller payload over fewer round trips. It avoids the failure where one generic API is over-fetching for mobile and under-serving for web, and it lets the frontend team own the shape of their own API. The cost is another deployable per client.

**The two things that go wrong.** First, the gateway becomes a distributed monolith — business logic creeps into it, and every team's release is now blocked on the gateway team. Keep it to cross-cutting concerns; if a rule needs domain knowledge, it belongs in the service. Second, it becomes a single point of failure on the request path for everything, so it needs to be the most boring, best-monitored, most redundantly-deployed component you have.

## Why it matters

The moment a design has more than one service, the interviewer will ask where authentication happens and how a client knows which service to call — and "at the gateway" plus a clear statement of what the gateway must *not* own is the senior answer. In AI products this is a concrete, recurring design: the LLM gateway is exactly this pattern applied to model providers.

## Key points

- Terminating TLS, buffering slow clients and pooling backend connections are proxy jobs, not application jobs.
- Validate auth once at the edge and pass a verified identity inward rather than re-parsing tokens per service.
- Rate limiting belongs at the gateway because it needs a view across all of a caller's traffic.
- A BFF per client type beats one generic API when web and mobile want genuinely different payloads.
- Business logic in the gateway turns it into a distributed monolith and a release bottleneck.
- The gateway is on the path of every request, so it needs redundancy and the best monitoring you have.
- An LLM gateway is this pattern with providers as backends — same auth, quota and routing concerns.
