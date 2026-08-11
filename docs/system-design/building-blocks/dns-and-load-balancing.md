---
title: DNS & Load Balancing
summary: How a request finds a server — DNS resolution, L4 versus L7 balancing, health checks, and the algorithms worth naming.
level: core
minutes: 20
order: 1
tags: [networking, infrastructure, scalability]

related:
  - cs-fundamentals/networking/dns-and-name-resolution
  - system-design/scalability/stateless-services-and-session-state
  - system-design/building-blocks/reverse-proxies-and-api-gateways

resources:
  - title: What is Load Balancing?
    url: https://www.nginx.com/resources/glossary/load-balancing/
    source: NGINX
    type: article
    minutes: 10
  - title: Introduction to Modern Network Load Balancing and Proxying
    url: https://blog.envoyproxy.io/introduction-to-modern-network-load-balancing-and-proxying-a57f6ff80236
    source: Matt Klein / Envoy
    type: article
    minutes: 35
    primary: true
  - title: Using Load Shedding to Avoid Overload
    url: https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/
    source: AWS Builders' Library
    type: article
    minutes: 25
---

## In one line

DNS gets a client to an address; a load balancer decides which of your servers behind that address actually handles the request, and takes unhealthy ones out of rotation.

## What it is

**DNS as the first routing layer.** A domain resolves to an IP, and that resolution can itself be a load-balancing decision: round-robin across several A records, or geo/latency-based routing that returns the nearest region's address. DNS is coarse — TTLs mean changes propagate over minutes and clients cache aggressively, so it is fine for steering traffic between regions and useless for reacting to a server dying thirty seconds ago.

**L4 versus L7.** A layer-4 balancer routes on IP and port without reading the payload. It's fast, protocol-agnostic, and can't do anything clever. A layer-7 balancer terminates the connection, parses HTTP, and can route on path, header or cookie, retry idempotent requests, terminate TLS, and split traffic by percentage for canaries. Most designs want L7 at the edge; L4 shows up where throughput matters more than routing intelligence.

**Algorithms.** Round-robin is the default and is wrong whenever requests vary in cost. **Least connections** or **least outstanding requests** handles uneven work much better and is the sensible default for real services. **Consistent hashing** routes the same key to the same backend, which is what you want in front of a cache tier so that adding a node moves 1/N of the keys instead of all of them. Sticky sessions exist, and wanting them usually means your service should have been stateless.

**Health checks are the actual value.** Passive checks notice failures from real traffic; active checks poll an endpoint. The endpoint should reflect whether the instance can serve — including its dependencies — but not so deeply that one slow database marks the entire fleet unhealthy and takes the service fully down. That failure mode is common enough to be worth saying out loud.

**The balancer is a single point of failure** unless it isn't: real deployments run several, fronted by DNS or an anycast address, and cloud load balancers are managed services precisely so you don't have to solve this.

## Why it matters

It's the first box after the client in nearly every design, and interviewers use it to check whether "horizontally scaled" is a phrase you've read or a thing you understand. The specific questions that recur: how does a new instance start receiving traffic, what happens to in-flight requests when one is removed, and why sticky sessions are a smell.

## Key points

- DNS routes at region granularity and reacts in minutes; it can't handle a server failing now.
- L4 routes on address and port; L7 reads HTTP and can route on path, header or cookie, and retry.
- Round-robin ignores request cost — least-outstanding-requests is the better default.
- Consistent hashing keeps cache affinity so scaling the tier moves 1/N of keys, not all of them.
- Health checks that follow every dependency can mark a whole fleet unhealthy over one slow database.
- Removing an instance needs connection draining, or in-flight requests are dropped.
- Sticky sessions are a workaround for state that should have lived in Redis or a token.
