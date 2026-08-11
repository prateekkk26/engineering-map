---
title: Triage, severity & roles
summary: Declare early, assign an incident commander separate from the person debugging, and communicate on a fixed cadence.
level: core
minutes: 20
order: 2
tags: [operations, incidents, communication]

related:
  - practices/incident-response/mitigate-before-you-diagnose
  - practices/incident-response/blameless-postmortems
  - practices/technical-communication/communicating-with-non-engineers

resources:
  - title: PagerDuty Incident Response
    url: https://response.pagerduty.com/
    source: PagerDuty
    type: docs
    minutes: 40
    primary: true
  - title: Google SRE Book — Managing Incidents
    url: https://sre.google/sre-book/managing-incidents/
    source: Google SRE
    type: docs
    minutes: 20
  - title: Atlassian Incident Handbook — Severity levels
    url: https://www.atlassian.com/incident-management/kpis/severity-levels
    source: Atlassian
    type: article
    minutes: 10
---

## In one line

An incident is a coordination problem as much as a technical one, so the first move is to name who's in charge, not to start reading logs.

## What it is

**Severity** is a shared shorthand for how hard to pull the fire alarm. A typical ladder: SEV1, complete outage or data loss, all hands, wake people up; SEV2, major functionality broken or a large subset of users affected, urgent but not everyone; SEV3, degraded or a workaround exists, business hours. The exact wording matters less than that everyone uses the same one and that severity maps to *actions* — who gets paged, whether the status page updates, how often you communicate.

**Roles** matter because the failure mode of an incident is five engineers debugging in parallel, nobody talking to the business, and two people restarting the same service. The standard split: an **incident commander** who coordinates and decides, and explicitly does not debug; one or more **responders** doing the technical work; a **communications lead** handling stakeholders and the status page; and a **scribe** keeping a timestamped log. On a small team one person may hold several, but the commander role should never be held by the person deepest in the debugger — their attention is exactly where it should be, which is why they can't also run the room.

**Declare early.** The bias runs the wrong way: people delay declaring because it feels dramatic, and the cost of a false alarm is fifteen minutes while the cost of a late declaration is measured in the outage. Make declaring cheap and routine.

**Communicate on a cadence** rather than when there's news — every 30 minutes for a SEV1, even if the update is "still investigating, next update at 14:30". Silence gets filled with speculation and with people DMing responders, which is the thing that most slows a response down. Each update: what's broken, who it affects, what we're doing, when the next update comes. No causes, no ETAs you can't keep, no blame.

Practical mechanics: one dedicated channel or bridge per incident with everything in it; a running timeline written *during* the incident, because reconstructing timestamps afterwards is guesswork; and an explicit "all clear" that says monitoring continues, which is also when you schedule the postmortem while it's fresh.

## Why it matters

"Tell me about a production incident you were part of" is a standard deep-dive prompt, and answers that describe coordination — roles, comms cadence, decisions made under uncertainty — read as senior, while answers that are purely a debugging story read as individual contribution. Small companies frequently have no process, so being able to bring one is directly valuable.

## Key points

- Severity levels are only useful if they map to concrete actions: who's paged, what's communicated, how often.
- Declare early and cheaply; a false alarm costs minutes, a late declaration costs the outage.
- The incident commander coordinates and does not debug — those two jobs compete for the same attention.
- A dedicated channel plus a timestamped running log is the difference between a postmortem and a reconstruction.
- Communicate on a fixed cadence, including "no news yet, next update at X".
- Stakeholder updates say impact and next steps, not root causes or speculative ETAs.
- Declare an explicit all-clear, and schedule the postmortem while everyone still remembers.
