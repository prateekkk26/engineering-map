---
title: DNS and name resolution
summary: A distributed, aggressively cached lookup from names to addresses — and the reason "it's DNS" is a recurring incident postmortem punchline.
level: core
minutes: 20
order: 2
tags: [networking, fundamentals, operations]

related:
  - cs-fundamentals/networking/what-happens-when-you-type-a-url
  - cs-fundamentals/networking/proxies-cdns-and-the-network-edge
  - cs-fundamentals/networking/latency-bandwidth-and-the-speed-of-light

resources:
  - title: What is DNS?
    url: https://www.cloudflare.com/learning/dns/what-is-dns/
    source: Cloudflare
    type: article
    minutes: 20
    primary: true
  - title: DNS record types
    url: https://www.cloudflare.com/learning/dns/dns-records/
    source: Cloudflare
    type: article
    minutes: 20
  - title: dns-prefetch and preconnect
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/dns-prefetch
    source: MDN
    type: docs
    minutes: 10
  - title: DNS Queries over HTTPS (RFC 8484)
    url: https://www.rfc-editor.org/rfc/rfc8484.html
    source: IETF
    type: docs
    minutes: 30
---

## In one line

DNS is a hierarchical, heavily cached directory that turns a hostname into an IP address, and its caching is simultaneously what makes it fast and what makes changes to it dangerous.

## What it is

A resolution walks a hierarchy. Your machine asks a **recursive resolver** — your ISP's, or a public one like `1.1.1.1` — which, if it has nothing cached, asks a **root** server for who handles `.com`, asks that **TLD** server who is authoritative for `example.com`, and asks that **authoritative** server for the record. Each answer carries a **TTL**, and every layer caches it: authoritative servers, recursive resolvers, the OS, and the browser each hold their own copy.

The record types worth knowing: **A** and **AAAA** map a name to an IPv4 or IPv6 address. **CNAME** aliases one name to another and cannot coexist with other records at the same name, which is why apex domains historically could not CNAME to a CDN and why providers invented ALIAS/ANAME records. **MX** for mail, **TXT** for verification and SPF/DKIM, **NS** for delegation, **SRV** for service discovery.

DNS is also load balancing and failover infrastructure. Returning multiple A records spreads clients; geo-aware DNS returns the nearest edge; weighted records shift traffic gradually. That is how most CDN and multi-region routing works.

Caching is the trap. A record's TTL is a promise that resolvers may serve the old value for that long, so a migration with a 24-hour TTL means 24 hours of split traffic. The discipline is to **lower the TTL well before the change** — to 60 seconds a day ahead — make the change, then raise it again. Some resolvers and some Java and Node runtimes ignore TTLs and cache longer, so plan for stragglers by keeping the old endpoint alive rather than assuming a clean cutover.

The failure modes are recognisable: an expired domain, a mistyped record, a TTL far too long during a migration, resolver outages that take down everything at once, and propagation delays mistaken for application bugs. Privacy matters too — plain DNS is unencrypted and visible to the network, which is what DoH and DoT address, and SNI in TLS still leaks the hostname unless Encrypted Client Hello is in play.

For frontend performance, `dns-prefetch` resolves a third-party hostname early and `preconnect` goes further by also doing TCP and TLS. Use them sparingly on origins you know you will hit — a font host, an analytics endpoint — since each one costs a connection.

## Why it matters

"It's always DNS" is a joke because it is repeatedly true: long TTLs during cutovers and resolver outages produce incidents that look like application failures. On the performance side, an unresolved third-party origin adds a full lookup to the critical path, which is exactly what `preconnect` on a font or API host removes.

## Key points

- Resolution walks root → TLD → authoritative, and every layer caches the answer for its TTL.
- TTL is a commitment to stale reads — lower it well before a migration and raise it after, never during.
- Some resolvers and runtimes ignore TTLs, so keep the old endpoint serving after a cutover rather than assuming a clean switch.
- CNAME cannot coexist with other records at the same name, which is why apex domains need ALIAS/ANAME or an A record.
- Multiple A records, geo-routing, and weighted answers make DNS a load balancer, which is how CDNs steer users to a nearby edge.
- Plain DNS is unencrypted and observable; DoH and DoT encrypt the query, though TLS SNI still reveals the hostname.
- `dns-prefetch` covers the lookup and `preconnect` also covers TCP and TLS — use them on a small number of known third-party origins.
- DNS failure takes out everything at once, so it deserves the same redundancy thinking as any other single point of failure.
