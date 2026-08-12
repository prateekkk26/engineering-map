---
title: Capacity Planning & Autoscaling
summary: Knowing how much you can serve before you need to, and the reasons autoscaling doesn't save you from finding out.
level: core
minutes: 20
order: 8
tags: [capacity, operations, scalability]

related:
  - system-design/design-fundamentals/back-of-the-envelope-estimation
  - system-design/scalability/what-scale-actually-costs
  - system-design/reliability-and-operations/graceful-degradation-and-load-shedding

resources:
  - title: Load Testing for Distributed Systems
    url: https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/
    source: AWS Builders' Library
    type: article
    minutes: 25
  - title: Managing Critical State — Capacity Planning
    url: https://sre.google/sre-book/software-engineering-in-sre/
    source: Google SRE Book
    type: docs
    minutes: 30
  - title: The USE Method
    url: https://www.brendangregg.com/usemethod.html
    source: Brendan Gregg
    type: article
    minutes: 20
    primary: true
---

## In one line

Capacity planning is knowing your headroom as a number — measured, not estimated — and autoscaling is a way to spend less money on it, not a substitute for having it.

## What it is

**Find the actual limit by measuring.** Load test until something breaks and note what broke first: CPU, memory, connection pool, database connections, file descriptors, a third-party rate limit. There is always exactly one binding constraint, and it's frequently not the one you'd guess — the database connection pool is a very common answer, because a hundred app instances × ten connections each exceeds what the database will accept.

**Then carry two numbers**: current peak utilisation as a fraction of that limit, and the growth rate. Together they tell you when you run out. Keep headroom for the spike you didn't plan (marketing sends the email), for a lost availability zone (if you run three AZs, you need to survive on two — so 66% is your practical ceiling), and for the deploy itself.

**Autoscaling, and its limits.** Scale on the signal that reflects work, not CPU — requests per instance, queue depth, or concurrent requests. Then the caveats that matter in a design round:

- *It's slow.* Instance boot plus warm-up is minutes; a traffic spike is seconds. Autoscaling handles growth, not bursts. For known bursts, pre-scale on a schedule.
- *Cold instances are slow instances.* JIT warm-up, empty local caches, cold connection pools — a newly-added instance can serve worse than the ones it's helping until it's warmed.
- *Scaling the stateless tier increases pressure downstream.* Twice the app instances means twice the database connections; the tier you scaled wasn't the bottleneck. Connection poolers exist for exactly this.
- *It can amplify a failure.* If errors are fast, throughput looks high and CPU looks low; some policies then scale *down* during an outage.
- *Set a maximum*, or a traffic anomaly (or a bug, or an attack) becomes a very large bill.

**Stateful tiers don't autoscale.** Databases, caches with data in them, stateful stream consumers — these are provisioned deliberately and grown with planning. That asymmetry is worth stating: the easy tier scales itself, the hard tier needs a human and a plan.

**Load shedding is the backstop.** Capacity planning is about not being overloaded; shedding is what happens when you are anyway. Every system needs both.

## Why it matters

"How do you know when you need more capacity?" and "what happens during a spike?" are standard follow-ups, and "we'd autoscale" is the answer that invites all the caveats above. Knowing that autoscaling is minutes-slow, that the stateless tier scaling pushes load onto the tier that can't, and that you need a maximum, is the difference between a slogan and operational experience.

## Key points

- Load test to find the binding constraint; it's often the connection pool, not CPU.
- Track peak utilisation against the limit plus growth rate — that's when you run out.
- Running N availability zones means surviving on N−1, which caps practical utilisation.
- Autoscale on requests, concurrency or queue depth rather than CPU.
- Autoscaling takes minutes and cannot absorb a seconds-long burst — pre-scale for known events.
- New instances are cold and briefly serve worse than the ones they're relieving.
- Scaling the app tier multiplies database connections; the bottleneck often moves rather than clearing.
- Always set a scaling maximum, and keep load shedding as the backstop.
