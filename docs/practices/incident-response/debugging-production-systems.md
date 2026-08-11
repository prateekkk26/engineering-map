---
title: Debugging production systems
summary: Form a hypothesis, find the change, bisect the request path with logs, metrics and traces, and never trust a story you haven't confirmed with data.
level: core
minutes: 22
order: 4
tags: [debugging, observability, operations]

related:
  - practices/incident-response/mitigate-before-you-diagnose
  - frontend/tooling/systematic-frontend-debugging
  - frontend/architecture/frontend-observability

resources:
  - title: Google SRE Book — Effective Troubleshooting
    url: https://sre.google/sre-book/effective-troubleshooting/
    source: Google SRE
    type: docs
    minutes: 30
    primary: true
  - title: Observability Engineering — What Is Observability?
    url: https://www.honeycomb.io/what-is-observability
    source: Honeycomb
    type: article
    minutes: 20
  - title: Debugging — The Nine Indispensable Rules
    url: https://debuggingrules.com/
    source: David Agans
    type: book
---

## In one line

Production debugging is binary search over a system: narrow where the failure is before asking why, and let telemetry answer the questions instead of your intuition.

## What it is

Start by **pinning the facts**: what exactly is failing (endpoint, user segment, region, device), when it started, and whether the change is a step or a ramp. A step change almost always means something *changed* — a deploy, a flag, a config push, a dependency's incident, an expiring certificate, a cron. A ramp means something is *growing* — a leak, a queue backing up, a table outgrowing an index, traffic. That single distinction eliminates half the search space in a minute.

Then **bisect the path**. Follow the request: client, CDN, load balancer, service, downstream services, database, third parties. At each hop, is the failure visible here? Traces do this for you when you have them — a distributed trace of a failing request shows the hop where latency or errors appear, which is the thing you'd otherwise spend twenty minutes inferring from logs. Metrics tell you *that* something is wrong and for whom; logs and traces tell you *why*; the useful discipline is asking which of the three answers your current question.

**High-cardinality data is what makes hard bugs findable.** "p99 latency is up" is nearly useless; "p99 latency is up only for users in one tenant, on one API version, hitting one endpoint" is nearly solved. If you can't slice by user, tenant, version, or region, that's the observability gap to name in the postmortem.

**Hypothesis discipline** keeps you honest: state what you believe, state what you'd expect to see if it were true, then look. Confirm each assumption rather than inheriting it — the classic wasted hour is debugging the wrong service because someone said "it's definitely the database". Change one variable at a time. Question the *chain*: it's not usually one thing, it's a retry storm amplifying a slow dependency, or a cache stampede after an eviction.

Know the recurring shapes so you can pattern-match: thread or connection pool exhaustion, retry amplification, thundering herd on cache expiry, unbounded queue growth, slow queries after a plan change, memory leaks, clock and timezone bugs, and something upstream that is silently rate-limiting you.

## Why it matters

"Walk me through the hardest bug you've debugged" is a top-three deep-dive question, and it's scored on method rather than outcome — whether you narrowed systematically or guessed until it went away. It's also where you get asked what telemetry you wished you had, which is the real senior signal.

## Key points

- Establish exactly what's failing and for whom before theorising about causes.
- A step change points at a change event; a gradual ramp points at growth or a leak.
- Bisect the request path hop by hop rather than reasoning about the system as a whole.
- Metrics say what and for whom; traces say where; logs say why — pick the tool that answers your current question.
- High-cardinality dimensions (user, tenant, version, region) are what make rare failures findable.
- State a hypothesis and its expected evidence before looking, and change one variable at a time.
- Verify inherited assumptions; most long debugging sessions start by trusting one.
- Learn the standard failure shapes — pool exhaustion, retry storms, cache stampedes, unbounded queues.
