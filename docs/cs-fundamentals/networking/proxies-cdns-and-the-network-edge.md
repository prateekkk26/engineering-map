---
title: Proxies, CDNs, and the network edge
summary: Everything sitting between the browser and your origin — and why "the server" in a request is usually four servers.
level: deep
minutes: 20
order: 7
tags: [networking, infrastructure, performance]

related:
  - cs-fundamentals/networking/latency-bandwidth-and-the-speed-of-light
  - cs-fundamentals/networking/dns-and-name-resolution
  - _shared/caching

resources:
  - title: What is a CDN?
    url: https://www.cloudflare.com/learning/cdn/what-is-a-cdn/
    source: Cloudflare
    type: article
    minutes: 20
    primary: true
  - title: Reverse proxy vs forward proxy
    url: https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/
    source: Cloudflare
    type: article
    minutes: 15
  - title: Load balancing algorithms
    url: https://www.nginx.com/resources/glossary/load-balancing/
    source: NGINX
    type: article
    minutes: 15
  - title: Edge functions and the Edge Runtime
    url: https://nextjs.org/docs/app/api-reference/edge
    source: Next.js
    type: docs
    minutes: 15
---

## In one line

A request rarely reaches your application directly — it passes through a CDN edge, a load balancer, and a reverse proxy, each of which can answer, transform, throttle, or drop it before your code ever runs.

## What it is

A **forward proxy** sits in front of clients and acts on their behalf: corporate egress filtering, VPNs, and the TLS-intercepting middleboxes on managed laptops. A **reverse proxy** sits in front of servers and acts on theirs: NGINX, Envoy, a cloud ALB. It terminates TLS, routes by path or host, load balances, compresses, buffers slow clients, enforces rate limits, and adds `X-Forwarded-For` so the origin can still see the client IP. That last detail is a recurring bug — an application reading the socket's remote address behind a proxy logs and rate-limits the proxy, not the user.

A **CDN** is a globally distributed set of reverse proxies. Its two jobs are proximity and caching. Proximity shortens RTT for every phase — DNS, TCP, TLS, and the request itself — which is why a CDN helps even for uncacheable, dynamic responses: the expensive handshake happens at an edge 10ms away and the connection to the origin is already warm. Caching serves static assets outright and can serve HTML too, with `stale-while-revalidate` letting the edge return a slightly old response immediately while refreshing behind it. Purging and cache keys are the operational hard part — a wrong `Vary` header or a cookie in the cache key can drop your hit rate to nothing, and caching a personalised page at the edge is a genuine data-leak incident.

**Load balancers** distribute across origins using round-robin, least-connections, or consistent hashing, and remove unhealthy instances via health checks. Layer 4 balances by IP and port and is fast; layer 7 reads the HTTP request and can route by path, header, or cookie, which is what enables canary releases and A/B splits at the infrastructure layer.

The **edge** now also runs code — Cloudflare Workers, Vercel Edge Functions, Lambda@Edge — in a constrained V8-isolate runtime with no Node APIs, no filesystem, and short CPU limits. It is the right place for auth checks, redirects, geo-routing, header rewriting, and A/B assignment; it is the wrong place for anything that needs a database in a single region, since you have moved the compute away from the data and added a round trip.

## Why it matters

When a system design answer says "the client calls the API", the follow-up is often about what sits between, and naming TLS termination, caching, and rate limiting at the edge shows you have operated something. It is also the debugging frame for a whole class of confusing bugs — a 502 with no application logs, a stale asset after a deploy, a rate limit counting every user as one IP, or a cached page showing another user's name.

## Key points

- A reverse proxy acts for the server and a forward proxy for the client; almost everything in web infrastructure is the former.
- The origin sees the proxy's IP unless it trusts `X-Forwarded-For`, which silently breaks logging, geolocation, and per-IP rate limiting.
- A CDN helps uncacheable traffic too, because it terminates TLS nearby and keeps a warm connection to the origin.
- `stale-while-revalidate` at the edge serves instantly and refreshes in the background, which is the cheapest large win in delivery.
- Cache keys and `Vary` decide hit rate; caching a personalised response at a shared edge is a data-leak incident, not a performance bug.
- Layer 4 balancing is fast and opaque; layer 7 can route by path, header, or cookie, which is what makes canaries and A/B splits possible.
- Health checks and connection draining are what make a deploy invisible to users.
- Edge runtimes are V8 isolates without Node APIs — good for auth, redirects, and rewrites, bad for anything that needs a single-region database.
