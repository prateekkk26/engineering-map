---
title: Writing a design doc
summary: A design doc exists to get disagreement out early and cheaply, so it leads with the problem and the options you rejected, not the solution you like.
level: core
minutes: 25
order: 1
tags: [communication, architecture, writing]

related:
  - system-design/architecture-decisions/architecture-decision-records
  - practices/technical-communication/communicating-with-non-engineers
  - practices/quality-and-tech-debt/making-the-case-for-paydown

resources:
  - title: Design Docs at Google
    url: https://www.industrialempathy.com/posts/design-docs-at-google/
    source: Malte Ubl
    type: article
    minutes: 20
    primary: true
  - title: RFCs and design docs
    url: https://blog.pragmaticengineer.com/rfcs-and-design-docs/
    source: Gergely Orosz
    type: article
    minutes: 15
  - title: Scaling Engineering Teams via RFCs
    url: https://blog.pragmaticengineer.com/scaling-engineering-teams-via-writing-things-down-rfcs/
    source: Gergely Orosz
    type: article
    minutes: 20
---

## In one line

The value of a design doc is mostly in the writing and the arguing, not the artifact — it is the cheapest place to find out that the plan is wrong.

## What it is

A design doc is written **before** the work, for a specific audience, to reach a decision. Its shape is stable: **context and problem** (what's broken or needed, with evidence, and why now), **goals and explicit non-goals**, **constraints** (deadlines, team size, existing systems, compliance), **the proposed design** at the altitude where it's arguable — data model, interfaces, request flow, failure behaviour — **alternatives considered with why they were rejected**, **risks and open questions**, and a **rollout plan** including migration and how you'd undo it.

Two of those sections do most of the work. **Non-goals** prevent the review from expanding into everything the system could theoretically do. **Alternatives** are the part reviewers actually read: they show the space was searched, and they pre-empt the "why not just use X?" comment that otherwise consumes the whole thread. If you can't articulate a credible case for the option you rejected, you haven't finished thinking.

Length is a design decision. One to three pages for most things; ten only for something genuinely large. A doc nobody finishes doesn't reduce risk. Diagrams beat paragraphs for anything about flow or topology, and a rough box diagram is enough — this is not documentation, it's an argument.

**Run it as a process**, not a broadcast. Share early while the design is still soft; circulate to a named set of reviewers with a deadline rather than to a channel; collect comments inline; hold a short meeting only if the comments haven't converged. Then record the decision *in the doc*, mark it accepted with a date, and leave the rejected alternatives visible. A design doc that dies unresolved in a comment thread is worse than none, because the work proceeds without the decision having been made.

Afterwards, the doc becomes history — the answer to "why is it like this?" in two years. That's what ADRs formalise: a short, immutable, per-decision record. Design docs and ADRs are complements, not competitors; the doc is the argument, the ADR is the receipt.

## Why it matters

Writing is how a senior engineer's influence scales past the code they personally write, and every staff-leaning loop probes for it — often as "tell me about a technical decision you drove". Remote and async companies weight it even higher, since a doc is the primary decision-making instrument when the team spans timezones.

## Key points

- The doc exists to surface disagreement before implementation, when changing course is cheap.
- Lead with the problem and evidence; a design with no stated problem cannot be evaluated.
- Explicit non-goals are what keep the review bounded.
- Alternatives with honest reasons for rejection are the section reviewers read most closely.
- Include failure behaviour, migration, and how to roll back — not just the happy-path architecture.
- Keep it short enough to be read in full; diagrams beat prose for flow and topology.
- Name reviewers and a deadline rather than broadcasting to a channel.
- Record the outcome in the doc with a date; an unresolved doc means the decision was made by default.
