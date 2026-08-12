---
title: Failure Modes & Blast Radius
summary: Asking "what breaks when this breaks?" for every box in the design, and containing the answer before it becomes an outage.
level: core
minutes: 20
order: 2
tags: [reliability, failure, architecture]

related:
  - system-design/distributed-systems/partial-failure-and-failure-detection
  - system-design/reliability-and-operations/circuit-breakers-and-bulkheads
  - system-design/reliability-and-operations/graceful-degradation-and-load-shedding

resources:
  - title: Static Stability Using Availability Zones
    url: https://aws.amazon.com/builders-library/static-stability-using-availability-zones/
    source: AWS Builders' Library
    type: article
    minutes: 30
    primary: true
  - title: How Complex Systems Fail
    url: https://how.complexsystems.fail/
    source: Richard Cook
    type: article
    minutes: 20
  - title: Reducing the Scope of Impact with Cell-Based Architecture
    url: https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/reducing-scope-of-impact-with-cell-based-architecture.html
    source: AWS
    type: docs
    minutes: 30 # unverified
---

## In one line

Blast radius is how much of the system, and how many users, one failure can take with it — and most reliability work is making that number smaller rather than making failures less likely.

## What it is

**Walk the diagram and ask, per box: what happens when this is gone, and what happens when it's slow?** Slow is the harder and more common case — a dead dependency fails fast and you move on, a slow one holds your threads, fills your queues and drags the caller down with it. A design that only considers crashes has considered the easy half.

**Single points of failure** are the obvious pass: one database, one load balancer, one region, one cache the system can't run without, one credentials store, one deployment pipeline. Also the non-obvious ones — a shared config service, a certificate that expires, a DNS zone, one team that has to approve every change.

**Correlated failure is what actually causes outages.** Redundancy only helps when the copies fail independently. Three instances in one availability zone, all pulling the same config, all deployed from the same bad commit, all restarting at once and stampeding the database — that's one failure domain wearing three hats. Spread across zones, stagger deploys, jitter retries and restarts.

**Contain by partitioning the users, not just the machines.** *Cell-based architecture*: run several independent copies of the whole stack, each serving a subset of tenants. A bad deploy or a poison-pill request takes out one cell — a defined fraction of users — instead of everyone. *Shuffle sharding* takes it further by giving each tenant a random combination of workers, so any two tenants rarely share the full set and one abusive tenant can't take everyone down. Both are strong, specific things to propose when asked how to limit impact.

**Static stability.** A system is statically stable if it keeps working in its current configuration when its control plane is unavailable — instances keep serving even if the autoscaler, the config service or the service registry is down. The failure to avoid is a dependency that's only needed to *change* things becoming a dependency for *running*.

**Cascading failure** is the amplifier: one component slows, callers retry, retries multiply the load, more components slow. Retries with backoff and jitter, circuit breakers, load shedding and bounded queues are the specific brakes.

## Why it matters

Raising failure modes unprompted is one of the clearest senior signals in a design round, and the specific vocabulary — correlated failure, blast radius, static stability, cells — is what makes it sound like experience rather than a checklist. In real work, this is the thinking that turns "the database had a bad minute" into a blip instead of an incident review.

## Key points

- For every component ask both "what if it's gone" and "what if it's slow" — slow is worse and more common.
- Redundancy only helps if failures are independent; shared zone, config or deploy makes copies one domain.
- Cell-based architecture caps the fraction of users any single failure can reach.
- Shuffle sharding stops one bad tenant from taking down every worker.
- Static stability means the data plane keeps serving when the control plane is unavailable.
- Cascading failure comes from retries amplifying load — backoff, jitter, breakers and shedding are the brakes.
- Look for non-machine single points of failure: certificates, DNS, config services, one approving team.
