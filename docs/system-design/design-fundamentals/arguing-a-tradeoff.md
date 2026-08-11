---
title: Arguing a Tradeoff
summary: How to make a design decision out loud so it survives follow-up — name the alternative, name the cost, name the condition that would change your mind.
level: core
minutes: 20
order: 6
tags: [system-design, interview, communication]

related:
  - system-design/architecture-decisions/architecture-decision-records
  - system-design/design-fundamentals/how-design-rounds-are-failed
  - system-design/architecture-decisions/designing-under-constraints

resources:
  - title: Architectural Decision Records
    url: https://adr.github.io/
    source: ADR GitHub organisation
    type: docs
    minutes: 15
  - title: Writing an Architectural Decision Record
    url: https://github.com/joelparkerhenderson/architecture-decision-record
    source: Joel Parker Henderson
    type: repo
    minutes: 20
  - title: Sacrificial Architecture
    url: https://martinfowler.com/bliki/SacrificialArchitecture.html
    source: Martin Fowler
    type: article
    minutes: 10
    primary: true
---

## In one line

A defensible decision has four parts: what you chose, what you rejected, what it costs, and what would make you choose differently.

## What it is

The failure mode is not picking the wrong option — it's picking any option without visible reasoning. Interviewers push back on correct answers deliberately, to see whether the reasoning was real.

**The four-part form.** *"I'd use a queue between upload and processing. The alternative is doing it synchronously, which is simpler and gives the user immediate feedback. The queue costs me an extra component to operate, at-least-once delivery I have to make idempotent, and a harder time telling the user when their job is done. I'd take it because processing is measured in seconds and the upload request can't hold that long. If processing were under 200ms I'd do it inline."*

That last sentence is the important one. Naming the condition that flips the decision proves the reasoning is a model rather than a memorised preference.

**Quantify when you can.** "Redis will be faster" is weak. "This is a 100:1 read-heavy workload at 3,000 reads/second, and a cache hit is sub-millisecond versus 5ms to Postgres, so the cache removes most of the database load" is an argument.

**Prefer the boring option, and say why.** Most senior candidates over-reach: microservices for a five-person team, Kafka where a database table would do, sharding at 40GB. Choosing Postgres and explaining what would have to be true before you'd add anything is a stronger signal than reaching for the exotic thing. The reverse also holds — if the numbers genuinely demand a specialised system, say so.

**Handle pushback without folding.** If the interviewer challenges a choice, don't immediately abandon it. Ask what they're worried about, restate the constraint you were optimising for, then either defend it or concede for a stated reason: *"if writes have to be durable before we respond, you're right, the queue doesn't work — I'd go synchronous and cap the batch size instead."* Flipping instantly reads as having had no reason; refusing to move reads as not listening.

**Say what you don't know.** "I haven't run Kafka in production; what I know is the delivery-semantics model, and here's what I'd verify before committing" is a good answer. Bluffing is discovered on the very next question.

## Why it matters

The deep-dive and hiring-manager rounds in PRD §1.1 are explicitly probes: one decision, followed until it hits the edge of what you actually know. What's being measured is whether your architecture came from reasoning or from pattern-matching a blog post. This is also the single most transferable interview skill — the same four-part form is what makes a design doc or an ADR persuasive at work.

## Key points

- State the choice, the alternative, the cost, and the condition that would reverse it.
- The reversal condition is what proves you have a model rather than a preference.
- Attach numbers from your own estimate to the argument wherever possible.
- Default to the boring, smaller option and name what would have to be true to outgrow it.
- Under pushback, ask what the concern is before conceding or defending.
- Concede with a reason, not reflexively; flipping instantly signals there was no reasoning.
- Say plainly what you haven't operated in production and what you'd verify first.
