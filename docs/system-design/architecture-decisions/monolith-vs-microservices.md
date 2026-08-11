---
title: Monolith vs Microservices
summary: The argument, honestly — what services actually buy you, what they cost, and why the modular monolith is usually the right first answer.
level: core
minutes: 25
order: 1
tags: [architecture, tradeoffs, organisation]

related:
  - system-design/architecture-decisions/drawing-service-boundaries
  - system-design/distributed-systems/distributed-transactions-and-sagas
  - system-design/architecture-decisions/designing-under-constraints

resources:
  - title: MonolithFirst
    url: https://martinfowler.com/bliki/MonolithFirst.html
    source: Martin Fowler
    type: article
    minutes: 10
    primary: true
  - title: Microservices — a definition of this new architectural term
    url: https://martinfowler.com/articles/microservices.html
    source: Fowler & Lewis
    type: article
    minutes: 40
  - title: The Majestic Monolith
    url: https://signalvnoise.com/svn3/the-majestic-monolith/
    source: DHH
    type: article
    minutes: 15
---

## In one line

Microservices buy independent deployment and independent scaling, and they cost you every distributed-systems problem — so the question is whether your organisation is large enough for that trade to pay.

## What it is

**What services actually buy.** *Independent deployment* — a team ships without coordinating with five others. That's the real one, and it's an organisational benefit before it's a technical one. *Independent scaling* — scale the video encoder without scaling the login page. *Fault isolation*, if you build for it: a failing recommendation service degrades a section rather than the site. *Technology heterogeneity*, which matters far less often than it's cited.

**What they cost.** Every in-process call becomes a network call that can time out, arrive twice, or return stale data. Transactions across services become sagas with compensating actions. Debugging needs distributed tracing. Local development needs half the estate running or mocked. Deployment, monitoring and on-call multiply. Data gets duplicated and drifts. Any change spanning two services now needs two deploys in the right order.

**The observation that matters:** most of that cost is paid immediately, and most of the benefit only arrives at organisational scale. Two teams don't need service boundaries to ship independently; twenty do.

**The default answer is a modular monolith.** One deployable, with hard internal module boundaries — clear interfaces between modules, no reaching into another module's tables, a package structure that makes violations obvious. You get in-process calls, real transactions, one deploy and one debugger, while keeping the seams that let you extract a service later if a specific module genuinely needs its own scaling or its own release cadence. Saying this — and naming what would change your mind — is the senior answer in a design round.

**When services genuinely earn it.** Enough teams that deploy coordination is a measurable tax. One component with a wildly different scaling profile (video processing, ML inference, a crawler). A different reliability requirement (payments must stay up when the rest degrades). A regulatory or data-residency boundary. A vendor integration you want to isolate. Notice that most of these are about *one* component, which argues for extracting that one rather than decomposing everything.

**Conway's law is not optional.** Your architecture will end up mirroring your communication structure. Services that don't match team boundaries produce constant cross-team coordination — the exact cost you split them to avoid.

**The failure mode to name:** the distributed monolith. Services that must be deployed together, share a database, and call each other synchronously in long chains. All the cost, none of the benefit, and it's what most bad microservice migrations produce.

## Why it matters

This is the most common architecture question in a deep-dive or hiring-manager conversation, and it's a judgement test rather than a knowledge test. Reflexively proposing microservices for a small team is a well-known negative signal; arguing for a modular monolith and naming the specific trigger for extraction demonstrates that you've paid the cost at least once.

## Key points

- The primary benefit is independent deployment, which is an organisational benefit before a technical one.
- The costs are paid on day one; the benefits arrive at organisational scale.
- A modular monolith gives you boundaries without distribution, and keeps extraction possible.
- Extract one component when it has a distinct scaling, reliability, or regulatory requirement.
- Architecture ends up mirroring team structure — draw boundaries that match how teams work.
- Cross-service transactions become sagas, and cross-service changes become ordered multi-deploys.
- The distributed monolith — services deployed together, sharing a database — is the common bad outcome.
- Name the specific trigger that would make you split; that's the part being graded.
