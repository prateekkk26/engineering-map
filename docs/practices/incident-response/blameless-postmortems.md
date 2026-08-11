---
title: Blameless postmortems
summary: The point is to find the conditions that let a competent person make that mistake, and to leave with owned, prioritised actions rather than a promise to be careful.
level: core
minutes: 22
order: 5
tags: [incidents, culture, reliability]

related:
  - practices/incident-response/triage-and-severity
  - practices/quality-and-tech-debt/making-the-case-for-paydown
  - practices/technical-communication/documentation-that-survives

resources:
  - title: Google SRE Book — Postmortem Culture
    url: https://sre.google/sre-book/postmortem-culture/
    source: Google SRE
    type: docs
    minutes: 30
    primary: true
  - title: Google SRE Workbook — Postmortem Culture in Practice
    url: https://sre.google/workbook/postmortem-culture/
    source: Google SRE
    type: docs
    minutes: 25
  - title: How Complex Systems Fail
    url: https://how.complexsystems.fail/
    source: Richard Cook
    type: article
    minutes: 20
---

## In one line

Blameless doesn't mean nobody made a mistake — it means the interesting question is why the mistake was possible and why nothing caught it.

## What it is

The premise, from Cook and from Allspaw's version at Etsy: complex systems run in a degraded mode continuously, and failures are combinations of conditions rather than single causes. The person who ran the command had reasons that made sense given the information they had at the time. If you punish that, you don't get fewer mistakes — you get fewer reports, more hedged timelines, and an organisation that learns nothing.

Practically, blamelessness is a **writing constraint**. Describe systems and actions, not people: "the deploy tool allowed a config push without a diff preview" rather than "Sam pushed bad config". Reconstruct what the responder believed at each moment, not what they should have known in hindsight — hindsight bias is the main thing that makes postmortems useless, because the cause is always obvious afterwards.

A postmortem that works contains: **impact** in user terms and duration (how many users, which functionality, how long, and how you know); a **timeline** with timestamps, including detection and each mitigation attempt; **contributing factors**, plural — the change, the missing test, the alert that didn't fire, the runbook that was stale; **what went well**, which is not filler because it identifies defences worth protecting; **where we got lucky**, which is where the next incident lives; and **action items**.

Action items are where most postmortems fail. Each needs an owner, a priority, and a ticket, and "be more careful" and "add more monitoring" are not action items. Prefer changes that make the failure class impossible or immediately visible — a constraint in the tool, a guardrail in the pipeline, a test — over changes that depend on someone remembering. Cap the list: five real items that ship beat twenty that don't.

Two more habits. **Trigger criteria are written down** — every SEV1/2, every rollback, every incident with customer impact, regardless of blame — so writing one is routine rather than a signal that someone screwed up. And they're **published and read**: a postmortem archive is the highest-value engineering documentation most companies have, and near-misses are worth writing up precisely because they were free.

## Why it matters

"Tell me about a time you broke production" is a values question as much as a technical one, and interviewers are listening for ownership without self-flagellation plus a systemic fix. Being able to describe a real postmortem process — with follow-through on actions — is one of the strongest senior signals in the behavioural round.

## Key points

- Blameless means treating the mistake as a symptom of the system's conditions, not of the individual.
- Blame suppresses information; the direct cost is worse timelines and unreported near-misses.
- Complex systems fail through combinations of conditions, so "the root cause" is usually a simplification.
- Write from what the responder knew at the time, not from hindsight.
- State impact in user terms with duration and detection time, not just error counts.
- "What went well" and "where we got lucky" are the two most valuable sections.
- Action items need owners, priorities, and tickets; "be more careful" is not one.
- Prefer guardrails that make the failure impossible over remedies that rely on memory.
- Write postmortems on fixed trigger criteria, including near-misses, and publish them.
