---
title: Designing Under Constraints
summary: The real inputs to an architecture — team size, deadline, budget, existing systems, compliance — and why naming them is the senior signal.
level: deep
minutes: 20
order: 7
tags: [architecture, judgement, tradeoffs]

related:
  - system-design/design-fundamentals/arguing-a-tradeoff
  - system-design/architecture-decisions/build-vs-buy
  - system-design/architecture-decisions/monolith-vs-microservices

resources:
  - title: Choose Boring Technology
    url: https://mcfunley.com/choose-boring-technology
    source: Dan McKinley
    type: article
    minutes: 20
  - title: Sacrificial Architecture
    url: https://martinfowler.com/bliki/SacrificialArchitecture.html
    source: Martin Fowler
    type: article
    minutes: 10
    primary: true
  - title: Conway's Law
    url: https://martinfowler.com/bliki/ConwaysLaw.html
    source: Martin Fowler
    type: article
    minutes: 10
---

## In one line

There is no best architecture, only the best architecture for a specific team, deadline, budget and set of existing systems — and saying which constraint decided it is what separates a senior answer from a textbook one.

## What it is

**The constraints that actually decide things.**

*Team size and experience.* Three engineers cannot operate twelve services. If nobody has run Kafka, choosing Kafka means also budgeting the learning and the first outage. Architecture is bounded by who will be on call for it.

*Time.* A six-week deadline and a six-month one produce legitimately different designs. Sometimes the right answer is deliberately sacrificial — build the thing you know you'll replace, ship, learn, replace it. That's a decision, not a failure, as long as it's explicit.

*Money.* Managed services versus self-hosted, provisioned versus autoscaled, how much redundancy. A startup optimises for engineering time; a company at scale optimises the infrastructure bill. Both are correct in context.

*What already exists.* Greenfield is rare. The existing database, the existing auth, the team's language, five years of accumulated behaviour — an architecture that ignores all of it is a rewrite proposal wearing a design's clothes.

*Compliance and regulation.* GDPR data residency, SOC 2, HIPAA, retention rules. These aren't preferences, and they can single-handedly determine the deployment model — which is why they belong in scoping rather than as a late discovery.

*Organisational structure.* Conway's law: your architecture will mirror your communication patterns whether you plan it or not. Boundaries that cut across teams generate permanent coordination overhead.

**Ask about the constraints in the interview.** "How big is the team?", "is this a six-week MVP or a two-year platform?", "what are we already running?" — these are excellent questions, they make the problem tractable, and they signal that you know architecture is contextual. Interviewers usually have answers ready, because it's the conversation they wanted.

**Then commit and justify.** "Given three engineers and a two-month deadline, I'd build a modular monolith on Postgres and Vercel, with the ingestion pipeline as the one separate service because it has a completely different scaling profile. At twenty engineers I'd revisit the boundaries." That sentence is what a senior design answer sounds like.

**Say what you'd sacrifice.** Every design gives something up. Naming it — "this trades multi-region availability for a much simpler operational story, which is right until we have European customers" — is the strongest available form of self-awareness, and it pre-empts the interviewer's next question.

## Why it matters

The gap between mid and senior is mostly here. A mid-level answer describes a good architecture; a senior answer describes the right architecture *for this situation* and can name the situation that would change it. It's also the thing hiring managers probe hardest, because it predicts how you'll behave on a real team with a real deadline.

## Key points

- Team size and experience bound the architecture — nobody can operate what they can't run.
- Deadline changes the correct answer; a deliberately sacrificial design is a legitimate choice.
- Cost priorities differ by company stage, and both optimisations are correct in their context.
- Existing systems are a constraint, not an inconvenience; ignoring them is a rewrite proposal.
- Compliance and data residency can determine the deployment model outright — surface them in scoping.
- Conway's law applies whether or not you plan for it; boundaries should match team structure.
- Asking about constraints in the round is a strong move, not a stalling tactic.
- Commit to a design, name the constraint that decided it, and name what would change it.
- State explicitly what the design sacrifices — that self-awareness is the senior signal.
