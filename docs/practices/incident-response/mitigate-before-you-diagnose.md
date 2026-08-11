---
title: Mitigate before you diagnose
summary: Stopping user pain and understanding the cause are different jobs, and doing them in the wrong order is what turns a ten-minute blip into an afternoon.
level: core
minutes: 18
order: 3
tags: [operations, incidents, reliability]

related:
  - practices/incident-response/debugging-production-systems
  - practices/ci-cd-and-delivery/deploying-safely-in-practice
  - system-design/reliability-and-operations/graceful-degradation-and-load-shedding

resources:
  - title: Google SRE Workbook — Incident Response
    url: https://sre.google/workbook/incident-response/
    source: Google SRE
    type: docs
    minutes: 30
    primary: true
  - title: PagerDuty — During an Incident
    url: https://response.pagerduty.com/during/during_an_incident/
    source: PagerDuty
    type: docs
    minutes: 15
  - title: Google SRE Book — Emergency Response
    url: https://sre.google/sre-book/emergency-response/
    source: Google SRE
    type: docs
    minutes: 30
---

## In one line

The goal during an incident is to stop the bleeding — root cause is tomorrow's problem, and curiosity during an outage is expensive.

## What it is

The instinct of every good engineer during an outage is to understand it. That instinct is wrong at that moment. **Mitigation and diagnosis are separate phases**, and the first question is not "why is this happening" but "what is the fastest safe action that reduces user impact".

The mitigation menu, roughly in order of how often it's the right answer:

- **Roll back.** If something deployed in the window before symptoms started, revert it. You do not need to know which line broke. This is why deploy logs and small deploys matter so much — it makes rollback a first move rather than a last resort.
- **Turn off the flag.** Instant, targeted, and lower-risk than a rollback when the change is flagged.
- **Shed or throttle load.** Disable the expensive endpoint, drop the batch job, rate-limit the abusive caller, serve stale cache.
- **Scale or fail over.** More capacity, a replica promoted, traffic shifted to another region.
- **Degrade deliberately.** Turn off recommendations so checkout works. Losing a feature beats losing the product.

Two disciplines make this safe. **Change one thing at a time and record it** — parallel undocumented fixes make the eventual timeline unreadable and can mask which action helped. And **check whether mitigation actually worked** against the user-facing metric, not against a hypothesis; "the error rate is falling" is the confirmation, not "that should have fixed it".

The trap on the other side is **mitigating so cleanly that nobody investigates**. A restart that clears a memory leak resolves the page and guarantees a repeat next Tuesday. Capture evidence before you destroy it — heap dump, goroutine or thread dump, a sample of failing requests, the current metric snapshot — then mitigate. Thirty seconds of evidence collection saves the postmortem.

And know the exception: when mitigation itself is risky or irreversible (a data-corrupting fix, a migration you can't undo), slow down and diagnose first. The rule is "reduce impact fast", not "act fast".

## Why it matters

This is the clearest dividing line in an incident story between someone who has been on-call and someone who hasn't. It also directly sets mean time to recovery, the metric leadership actually feels — and "we rolled back within four minutes, then found the cause the next morning" is the answer interviewers are hoping to hear.

## Key points

- Stopping user impact comes first; understanding why comes after service is restored.
- If a deploy correlates with the start of symptoms, roll it back without needing to know the cause.
- Flags, load shedding, failover, and deliberate degradation are the standard mitigation levers.
- Change one thing at a time and log it, or the timeline becomes unreadable and the fix unattributable.
- Confirm mitigation against user-facing metrics rather than against your hypothesis.
- Capture evidence — dumps, samples, snapshots — before restarting something that would destroy it.
- Losing a non-essential feature to keep the core path working is a good trade, and should be pre-planned.
- Slow down when the mitigation itself is irreversible or risks data.
