---
title: Requirements & Scoping
summary: Turning a one-line prompt into a short list of functional requirements and the four non-functional numbers that decide the architecture.
level: core
minutes: 20
order: 2
tags: [system-design, interview, requirements]

related:
  - system-design/design-fundamentals/running-a-system-design-interview
  - system-design/design-fundamentals/back-of-the-envelope-estimation
  - system-design/reliability-and-operations/availability-slos-and-error-budgets

resources:
  - title: Non-Functional Requirements
    url: https://www.hellointerview.com/learn/system-design/in-a-hurry/key-technologies
    source: Hello Interview
    type: article
    minutes: 15 # unverified
  - title: Designing Data-Intensive Applications — Chapter 1, Reliable, Scalable, Maintainable
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
  - title: Working Backwards from the Customer
    url: https://aws.amazon.com/blogs/enterprise-strategy/working-backwards-a-new-version-of-an-old-idea/
    source: AWS
    type: article
    minutes: 10 # unverified
---

## In one line

"Design Twitter" is not a requirement; three sentences about who posts, who reads, and how fast it has to be, is.

## What it is

Scoping produces two lists.

**Functional requirements** — what the system does, in user terms, ranked. Three to five is right; more than that and you have no time to design any of them. For a feed: *users post; users follow; users see a ranked timeline of people they follow.* Explicitly park the rest — "I'll leave DMs, search and ads out unless you want them" — which is both good scoping and a way to show you know they exist.

**Non-functional requirements** — the four numbers that actually pick the architecture:

- **Scale.** Daily active users, and the read:write ratio. A 100:1 read-heavy system is a caching and fan-out problem; a write-heavy one is a partitioning and ingestion problem. These are different designs.
- **Latency.** What does "fast" mean, at which percentile? p99 under 200ms for a timeline read rules out computing it on demand at scale.
- **Consistency.** Is stale data acceptable, and for how long? A follower count can lag ten seconds. A bank balance cannot. This one question decides replication, caching, and whether you can use a queue.
- **Availability.** Three nines or four? What is the degraded mode — read-only, stale, or down?

**Ask, don't assume, but don't stall either.** Three or four clarifying questions is the right budget. Past that, state an assumption out loud and move: *"I'll assume 10M DAU, read-heavy at roughly 100:1, and that a few seconds of staleness in the feed is fine — stop me if that's wrong."* An interviewer who wanted something else will correct you, and you've lost fifteen seconds instead of five minutes.

**Watch for the constraint that reshapes everything.** Multi-region? Regulated data with residency rules? Mobile clients on bad networks? Offline support? Each one changes the answer fundamentally, and each is usually mentioned once, in passing, in the prompt.

## Why it matters

The design round grades judgement, and judgement is visible mostly in what you choose *not* to build. Candidates who design for a scale nobody asked for — sharding a database that holds 40GB — are demonstrating the opposite of seniority. This is also the round's only chance to make the problem tractable: an unscoped prompt cannot be finished in 45 minutes, so the interviewer is waiting for you to cut it down.

## Key points

- Produce a ranked list of three to five functional requirements and get explicit agreement on it.
- Name the things you're deliberately leaving out; it scores as scoping, not as a gap.
- The read:write ratio is the single most design-determining number you can ask for.
- Ask for latency as a percentile target, not as an adjective.
- "How stale can this be?" decides caching, replication and async processing in one question.
- Budget three or four clarifying questions, then state assumptions aloud and proceed.
- Listen for the one-word constraint — multi-region, offline, regulated — that changes the whole design.
