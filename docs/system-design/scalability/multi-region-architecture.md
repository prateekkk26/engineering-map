---
title: Multi-Region Architecture
summary: Running in more than one region for latency, availability or data residency — and why the database is the part that makes it hard.
level: deep
minutes: 25
order: 7
tags: [scalability, availability, distributed-systems]

related:
  - system-design/distributed-systems/consistency-models
  - system-design/design-fundamentals/latency-numbers-worth-knowing
  - system-design/reliability-and-operations/failure-modes-and-blast-radius

resources:
  - title: Multi-Region Application Architecture
    url: https://aws.amazon.com/solutions/implementations/multi-region-application-architecture/
    source: AWS
    type: docs
    minutes: 25
  - title: Spanner — Google's Globally Distributed Database
    url: https://research.google/pubs/spanner-googles-globally-distributed-database-2/
    source: Google Research
    type: article
    minutes: 45
  - title: Cross-Region Replication and the Cost of Consistency
    url: https://www.cockroachlabs.com/docs/stable/multiregion-overview
    source: Cockroach Labs
    type: docs
    minutes: 30
    primary: true
---

## In one line

Stateless tiers go multi-region easily; the entire difficulty is that a write can only be strongly consistent in one place at a time, and that place is 100ms away from everywhere else.

## What it is

**Know which reason you're doing it**, because they lead to different architectures:

*Latency* — users in Europe shouldn't cross the Atlantic for every request. Often solved by a CDN and regional read replicas rather than a full multi-region deployment.

*Availability* — surviving the loss of a whole region. Genuinely rare, and expensive; be honest about whether your SLO requires it.

*Data residency* — GDPR and similar rules requiring EU user data to stay in the EU. This is a compliance requirement, not an engineering preference, and it's the most common real driver for European-facing products.

**The patterns.**

*Active–passive.* One region serves; the other has replicated data and takes over on failover. Simple and consistent; failover is a manual-ish operation with a real RTO, and the passive region is mostly idle capacity you're paying for.

*Active–active with a single write region.* All regions serve reads locally, writes route to the home region. Reads are fast everywhere, writes pay the cross-region round trip, and replication lag is now visible to users — read-your-own-writes needs explicit handling.

*Active–active with regional ownership.* Each user or tenant has a home region that owns their writes; other regions hold read-only copies. This is the pattern that actually scales for consumer products and maps cleanly onto data residency. The cost is routing (every request must find the user's home region) and cross-region operations (two users in different home regions interacting).

*Multi-master.* Writes accepted anywhere, conflicts resolved after the fact — last-write-wins, CRDTs, or application-level merge. Only correct where conflicts are genuinely resolvable; do not propose it for balances or inventory.

**What gets hard.** Consistency, obviously. But also: schema migrations across regions, cache invalidation crossing regions, cross-region data transfer costs (a real line item), testing failover for a case you hope never happens, and the fact that a region "failing" is usually partial and ambiguous rather than clean.

## Why it matters

It's the standard escalation once a design is otherwise complete — "now make it work for users in Europe" — and it's the question where CAP stops being abstract. For the target companies it's also concrete rather than hypothetical: GDPR residency and European users are a live requirement, and knowing that regional ownership is the pattern which serves both latency and residency is a strong, specific answer.

## Key points

- Name the driver first — latency, availability or residency — because each implies a different architecture.
- Stateless tiers replicate trivially; the database decides the whole design.
- Active–passive is simple and consistent but pays for idle capacity and has real failover time.
- Single-write-region gives fast local reads and cross-region write latency, with visible replication lag.
- Regional ownership per user or tenant is the pattern that satisfies both latency and data residency.
- Multi-master needs a real conflict-resolution story; never propose it for money or inventory.
- Cross-region data transfer costs are a genuine line item, and failover only works if it's rehearsed.
- Often the right answer is a CDN plus regional read replicas, not a multi-region write architecture.
