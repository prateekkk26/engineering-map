---
title: Vertical vs Horizontal Scaling
summary: Why the boring answer — buy a bigger machine — is right far longer than interviews imply, and what actually forces the switch.
level: core
minutes: 15
order: 1
tags: [scalability, architecture, cost]

related:
  - system-design/scalability/stateless-services-and-session-state
  - system-design/scalability/what-scale-actually-costs
  - system-design/architecture-decisions/designing-under-constraints

resources:
  - title: Scalability Lessons
    url: https://github.com/donnemartin/system-design-primer#scalability
    source: System Design Primer
    type: repo
    minutes: 15
  - title: Scalability! But at What COST?
    url: https://www.frankmcsherry.org/assets/COST.pdf
    source: Frank McSherry et al.
    type: article
    minutes: 25
    primary: true
  - title: The Cloud Is Not a Silver Bullet — Big Machines Are Cheap Now
    url: https://motherduck.com/blog/big-data-is-dead/
    source: MotherDuck
    type: article
    minutes: 20
---

## In one line

Vertical scaling buys you time with no architectural change; horizontal scaling buys unlimited headroom in exchange for every distributed-systems problem in this section.

## What it is

**Vertical** — a bigger instance. More cores, more RAM, faster disk. Nothing about the application changes. The ceiling is real but much higher than most engineers assume: a single cloud machine can have hundreds of cores and multiple terabytes of RAM, which is enough to hold an entire product's working set in memory. The genuine limits are that there *is* a top end, it gets superlinearly expensive near it, and one machine is one failure domain — which is usually what forces the move before capacity does.

**Horizontal** — more instances behind a load balancer. Effectively unlimited, cheaper per unit, and gives you redundancy as a side effect. The price is everything else in this subsection: state has to leave the process, requests can land anywhere, deploys become rolling, caches fragment, and the database becomes the shared bottleneck you didn't remove.

**Stateless tiers scale horizontally almost for free.** Web and API servers are the easy case, and the right default. **Stateful tiers are the hard case** — the database is where "just add servers" stops working, and read replicas, partitioning and caching exist precisely because horizontal scaling of writes is difficult.

**The order of moves that actually happens.** Add caching. Add read replicas. Buy a bigger primary. Move heavy work to background jobs. Only then partition. Sharding is the last resort, not the third slide, because it constrains every query you'll ever write afterwards.

**The number worth having.** A single modern Postgres instance handles order-of-10,000 simple queries per second and datasets of a few terabytes without heroics. Most products never leave that envelope. Being able to say "we're at 3,000 QPS and 400GB, so one primary with two replicas is genuinely fine" is a stronger design-round answer than any sharding scheme.

## Why it matters

The reflex to shard everything is the most reliable over-engineering tell in a design round, and interviewers watch for it. Meanwhile the real-world skill is the opposite: knowing how much headroom a single machine has, so you spend engineering effort on the product instead of on a distributed architecture the traffic didn't justify. Where it genuinely matters is availability — one box means downtime during upgrades and a bad day when it fails — and saying *that* is the sophisticated reason to go horizontal early.

## Key points

- Vertical scaling requires no architectural change and reaches much further than most designs assume.
- The usual reason to go horizontal first is redundancy, not capacity — one machine is one failure domain.
- Stateless tiers scale horizontally almost for free; the database is where it gets hard.
- The realistic order is cache, replicas, bigger primary, background work, and only then partitioning.
- Horizontal scaling imports the whole distributed-systems problem set — treat it as a cost, not a default.
- One Postgres primary at order-of-10,000 QPS and a few terabytes covers most products entirely.
- Cost per unit of capacity rises steeply at the top of the vertical range; that's the practical ceiling.
