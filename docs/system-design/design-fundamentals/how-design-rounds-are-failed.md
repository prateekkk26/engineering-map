---
title: How Design Rounds Are Failed
summary: The recurring failure modes — designing before scoping, boxes with no numbers, silence, and over-engineering — and what to do instead.
level: core
minutes: 15
order: 7
tags: [system-design, interview, process]

related:
  - system-design/design-fundamentals/running-a-system-design-interview
  - system-design/design-fundamentals/arguing-a-tradeoff
  - system-design/architecture-decisions/designing-under-constraints

resources:
  - title: What Interviewers Look For in a System Design Interview
    url: https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction
    source: Hello Interview
    type: article
    minutes: 15
    primary: true
  - title: On Interviewing for Systems Design
    url: https://blog.pragmaticengineer.com/system-design-interview-an-insiders-guide-review/
    source: The Pragmatic Engineer
    type: article
    minutes: 20
  - title: Simple Made Easy
    url: https://www.infoq.com/presentations/Simple-Made-Easy/
    source: Rich Hickey / Strange Loop
    type: video
    minutes: 60
---

## In one line

Almost nobody fails a design round for not knowing enough; they fail for solving the wrong problem, going quiet, or building for a scale nobody asked for.

## What it is

**Designing before scoping.** Drawing at minute two, discovering at minute thirty that the interviewer wanted the write path. Fix: five minutes of requirements, agreed out loud, every time.

**Boxes with no numbers.** A diagram that would look identical for 100 users and 100 million. If nothing in your design references your own estimate, the estimate was decoration. Fix: every added component cites the number that forced it.

**Over-engineering.** Microservices, Kafka, a sharded datastore and a service mesh for a system with 10,000 daily users. This reads as inexperience, not seniority — it says you've read about big systems rather than operated one. Fix: start with the smallest thing that satisfies the requirements and name the trigger for each upgrade.

**Going silent.** Thinking quietly for ninety seconds is indistinguishable from being stuck. Fix: narrate. "I'm deciding whether the fan-out happens on write or on read — let me think about the read:write ratio."

**Depth-first with no breadth.** Twenty-five minutes on the perfect ID-generation scheme and no feed. Fix: complete the happy path, then go deep. Park hard sub-problems explicitly: *"I'll come back to ID generation; assume unique 64-bit IDs for now."*

**Ignoring failure entirely.** A design where nothing ever times out, retries, or falls over. Interviewers in these loops are explicitly told to check for it. Fix: reserve the last ten minutes for bottlenecks, failure modes, degraded behaviour and what you'd alert on — unprompted.

**Name-dropping without depth.** Saying "we'd use Kafka for exactly-once" and being unable to explain what that actually guarantees. Every proper noun in your answer is an invitation to a follow-up. Fix: only name things you can be questioned about, and say when you're at the edge of your knowledge.

**Treating it as a monologue.** The interviewer usually knows a good answer and is dropping hints. Ignoring "hmm, what happens if that node dies?" costs you the round. Fix: treat every interjection as a redirect, and follow it.

## Why it matters

These loops select for people who will design real systems with real colleagues, and every failure above is a collaboration failure as much as a technical one. Knowing the list is worth more than another architecture pattern: the marginal round is lost to process, not to a missing fact.

## Key points

- Scope for five minutes before drawing anything, every time.
- If no component in the design references a number you calculated, the design is decoration.
- Over-engineering reads as inexperience; start small and name the upgrade triggers.
- Narrate continuously — silence is indistinguishable from being stuck.
- Finish the happy path end to end before any deep dive; park hard sub-problems out loud.
- Raise failure modes, degraded behaviour and monitoring unprompted, in the last ten minutes.
- Every proper noun you say is an invitation to a follow-up; only name what you can defend.
- Interviewer interjections are hints, not interruptions — follow them.
