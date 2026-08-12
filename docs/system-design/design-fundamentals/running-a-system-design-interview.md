---
title: Running a System Design Interview
summary: A timeboxed structure for the 45 minutes, so the round is a conversation you're leading rather than a quiz you're answering.
level: core
minutes: 25
order: 1
tags: [system-design, interview, process]

related:
  - system-design/design-fundamentals/requirements-and-scoping
  - system-design/design-fundamentals/how-design-rounds-are-failed
  - system-design/frontend-system-design/running-a-frontend-design-interview
  - system-design/design-fundamentals/drawing-the-high-level-design

resources:
  - title: The System Design Interview — Delivery Framework
    url: https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery
    source: Hello Interview
    type: article
    minutes: 20
    primary: true
  - title: System Design Primer
    url: https://github.com/donnemartin/system-design-primer
    source: Donne Martin
    type: repo
    minutes: 60
  - title: How to Approach a System Design Interview
    url: https://blog.bytebytego.com/p/how-to-approach-a-system-design-interview
    source: ByteByteGo
    type: article
    minutes: 15 # unverified
---

## In one line

Spend the first ten minutes deciding what you're building and how big it is, and the design will mostly write itself.

## What it is

A design round is 45 to 60 minutes, open-ended by construction, and graded on how you think rather than on whether you land a particular architecture. The structure that survives contact with most interviewers:

**Scope — 5 to 8 minutes.** Ask what the system does, who uses it, and which parts are out of scope. Write the functional requirements down as a short list and get explicit agreement. Then the non-functional ones: scale, latency target, consistency requirement, availability target. Never skip this to start drawing; it is the single most-scored part of the round.

**Estimate — 3 to 5 minutes.** Turn "10 million users" into requests per second, bytes per day, and rows in the biggest table. You are not being graded on arithmetic — you are establishing which numbers make the design hard. If reads are 10,000/s and writes are 50/s, you've just decided the whole shape of the answer.

**API and data model — 5 minutes.** Name the two or three endpoints and the main entities with their key fields. This is where a lot of ambiguity dies quietly: an interviewer who disagrees with your design will usually show it here first.

**High-level design — 10 to 15 minutes.** Boxes and arrows, client to storage, happy path only. Say what each box is for as you draw it. Stop and check: does this satisfy the requirements you wrote down?

**Deep dive — 15 minutes.** The interviewer picks a component, or you offer the one you know is hardest. This is where seniority shows. Then bottlenecks, failure modes, and what you'd monitor.

**Drive it yourself.** Announce each phase — "let me size this before I draw anything" — so the interviewer knows where you are. Silence reads as being stuck; narrating reads as being in control.

## Why it matters

Every design round in PRD §1.1 is scored on process before content, and the most common failure is not missing knowledge — it's a candidate who starts drawing at minute two and finds at minute thirty that they solved the wrong problem. A visible structure also buys you recovery room: if you get stuck on one component, you can name it, park it, and move on without the round stalling.

## Key points

- The first ten minutes are scoping and estimation; drawing before that is the most common way to lose the round.
- Get explicit agreement on the functional requirement list before designing against it.
- Estimation exists to identify which dimension is hard, not to produce a correct number.
- Sketch the API and data model before the boxes — disagreements surface there cheaply.
- Design the happy path end to end first, then go deep; a half-drawn system can't be evaluated.
- Announce each phase out loud so the interviewer can follow and redirect you early.
- Leave ten minutes for bottlenecks, failure modes and monitoring — raising them unprompted is the senior signal.
