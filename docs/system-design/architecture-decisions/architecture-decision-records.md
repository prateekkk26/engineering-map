---
title: Architecture Decision Records
summary: Writing down why you chose what you chose, in a page, so the reasoning survives the people who made it.
level: core
minutes: 15
order: 5
tags: [architecture, documentation, practices]

related:
  - system-design/design-fundamentals/arguing-a-tradeoff
  - system-design/architecture-decisions/build-vs-buy
  - system-design/architecture-decisions/designing-under-constraints

resources:
  - title: Architectural Decision Records
    url: https://adr.github.io/
    source: ADR organisation
    type: docs
    minutes: 15
    primary: true
  - title: Documenting Architecture Decisions
    url: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
    source: Michael Nygard
    type: article
    minutes: 10
  - title: ADR Templates and Examples
    url: https://github.com/joelparkerhenderson/architecture-decision-record
    source: Joel Parker Henderson
    type: repo
    minutes: 20
---

## In one line

An ADR is a short, immutable record of one decision — the context, the options, the choice and its consequences — written when the decision is made, not reconstructed a year later.

## What it is

**The format**, which fits on a page:

*Title and status* — `Accepted`, `Superseded by ADR-014`, `Deprecated`. *Context* — the forces at play: requirements, constraints, deadlines, team size, what already exists. This is the part that ages best and the part people skip. *Decision* — what was chosen, stated plainly and in the active voice: "we will use Postgres for the primary datastore." *Consequences* — what this makes easy, what it makes hard, and what you're now committed to. Include the bad ones; an ADR listing only benefits is marketing. *Alternatives considered* — what else was on the table and why it lost.

**Immutable, and superseded rather than edited.** When a decision changes, write a new ADR that references the old one and mark the old one superseded. The history is the value: someone reading in two years needs to know that you considered the obvious alternative and rejected it for a reason that may or may not still hold.

**In the repository, in version control, reviewed in a pull request.** `docs/adr/0007-use-postgres-for-primary-storage.md`. Numbered sequentially, never renumbered. Keeping them next to the code means they're found by people working on that code and reviewed by the same process — a wiki page nobody links to isn't documentation.

**What earns one.** Anything expensive to reverse or surprising to a newcomer: choosing a datastore, a framework, an auth approach, a deployment model, a service boundary; adopting or dropping a major dependency; a significant deviation from a convention. Not: naming, formatting, a library with one obvious choice.

**Write it when the decision is made**, while the alternatives and the constraints are still fresh. Reconstructed ADRs are tidy and wrong — they present the outcome as inevitable and lose the messy constraint that actually drove it.

**The value shows up in three places.** New joiners stop asking "why on earth is it like this?" You stop relitigating settled arguments every six months. And when a constraint changes — the team grew, the deadline passed, the vendor changed pricing — you can find the decisions that depended on it, because the context section named it.

## Why it matters

It's the written form of `arguing-a-tradeoff`, and both the deep-dive and hiring-manager rounds probe for it: "how do you document decisions?" and "tell me about a decision you'd make differently." Candidates who write ADRs have a specific, credible answer, and the same four-part structure is what makes their verbal answers land too.

## Key points

- One decision per record: status, context, decision, consequences, alternatives.
- The context section is the part that ages best — record the constraints that drove the choice.
- List the negative consequences; an ADR with only upsides isn't a decision record.
- Never edit an accepted ADR — supersede it with a new one that links back.
- Keep them in the repo, numbered, and reviewed through the normal pull-request process.
- Write one for anything expensive to reverse or surprising to a newcomer.
- Write it at decision time; reconstructed ADRs lose the constraint that actually decided it.
- The payoff is fewer relitigated arguments and a way to find decisions when a constraint changes.
