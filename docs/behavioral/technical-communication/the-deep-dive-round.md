---
title: The Deep Dive Round
summary: One project, probed by follow-up until it reaches the edge of what you actually know — so choose the project by depth, not by impressiveness.
level: core
minutes: 22
order: 1
tags: [interviewing, communication, depth]

related:
  - behavioral/common-questions/the-hardest-technical-problem
  - behavioral/technical-communication/explaining-to-non-engineers
  - behavioral/what-senior-means/judgement-under-uncertainty

resources:
  - title: Acing the architecture interview
    url: https://lethain.com/acing-architecture-interview/
    source: Will Larson
    type: article
    minutes: 15
    primary: true
  - title: On being a senior engineer
    url: https://www.kitchensoap.com/2012/10/25/on-being-a-senior-engineer/
    source: John Allspaw
    type: article
    minutes: 25
  - title: The system design interview
    url: https://interviewing.io/guides/system-design-interview
    source: interviewing.io
    type: article
    minutes: 25
---

## In one line

An hour on one system you built, where the interviewer keeps asking "why" until you say "I don't know" — and how you get there matters more than where it happens.

## What it is

This round exists because it's very hard to fake. You pick a project, walk through it, and every answer generates a follow-up. Everyone hits a limit; the round is about the quality of the ground you cover on the way and how you behave when you arrive.

**Choose for depth over prestige.** The correct choice is something you designed or substantially owned, recent enough to remember precisely, and technically deep enough to sustain an hour. A modest project you know completely beats an impressive one where you owned a slice. Also check you're allowed to discuss it — describe the architecture and your decisions, not proprietary specifics.

**Open with two minutes of orientation**, unprompted: what the system did, who used it, the constraints, and where you sat in it. Interviewers are trying to build a mental model, and a candidate who supplies one immediately buys credibility for the whole hour. Then let them steer.

**Expect the follow-ups to be about alternatives.** "Why Postgres and not a queue?" "What breaks at ten times the traffic?" "What would you do differently now?" These aren't traps — they're checking whether you chose or defaulted. The best answer names the constraint that decided it: team size, deadline, existing operational expertise, cost.

**Bring numbers.** Requests per second, data volume, p95, team size, timeline. Concrete figures are the difference between someone who built the thing and someone who read the design doc.

**When you hit your limit, say so cleanly** and then reason: "I don't know how that was configured — I'd guess X, because Y, and I'd check by Z." Bluffing is the only genuinely fatal move here; it's obvious, and it retroactively devalues everything you said before it.

Prepare by drawing the architecture from memory and having someone ask "why" five times about each box.

## Why it matters

For senior and staff hires this round often carries more weight than the coding rounds — it's the closest available proxy for what you'd be like as a colleague designing something real. It's also the round where preparation is most visible, because the difference between a rehearsed walkthrough and an unprepared one is stark within five minutes.

## Key points

- Pick a project you owned, remember precisely, and can discuss for an hour — depth beats prestige.
- Check what you're allowed to disclose, and stick to architecture and reasoning.
- Open with a two-minute orientation: purpose, users, constraints, your scope.
- Expect "why not the alternative" and answer with the constraint that decided it.
- Have real numbers — scale, latency, timeline, team size — ready.
- Include what you'd do differently; the retrospective question is near-certain.
- Say "I don't know" cleanly, then reason towards a guess and how you'd verify it.
- Bluffing is the one unrecoverable failure; the interviewer usually knows the answer already.
