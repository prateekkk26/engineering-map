---
title: Runbooks & operational docs
summary: A runbook is written for a tired person at 3am who didn't build the system — so it lists commands to run, not concepts to understand.
level: core
minutes: 18
order: 3
tags: [documentation, operations, incidents]

related:
  - practices/incident-response/on-call-and-alerting
  - practices/incident-response/mitigate-before-you-diagnose
  - practices/technical-communication/documentation-that-survives

resources:
  - title: Google SRE Workbook — On-Call
    url: https://sre.google/workbook/on-call/
    source: Google SRE
    type: docs
    minutes: 30
    primary: true
  - title: GitLab production runbooks
    url: https://gitlab.com/gitlab-com/runbooks
    source: GitLab
    type: repo
    minutes: 20
  - title: What is a Runbook?
    url: https://www.pagerduty.com/resources/learn/what-is-a-runbook/
    source: PagerDuty
    type: article
    minutes: 10
---

## In one line

Every alert should link to a page that says what this alert means, how to tell how bad it is, and the exact commands that fix or mitigate it.

## What it is

The audience assumption does all the work: **the reader is stressed, half-awake, and unfamiliar with this service**. That rules out prose, background, and anything requiring inference. A runbook entry is a checklist with copy-pasteable commands and expected output.

The shape that works, per alert:

- **What this means in user terms** — one sentence. "Checkout is failing for some users", not "queue depth exceeded".
- **How to assess severity** — the dashboard link, the query, the thresholds that distinguish "watch it" from "declare an incident".
- **First actions** — the specific commands, in order, with what a healthy response looks like. Include the safe mitigations (roll back, disable the flag, drain the queue) before the diagnostic detour.
- **Common causes**, ranked by how often they've actually been it.
- **Escalation** — who owns this service, how to reach them, and when it's justified.
- **Links** — dashboards, logs pre-filtered to the relevant query, the last postmortems for this alert.

Other operational docs worth having: **service overviews** (what it does, dependencies, SLOs, on-call owner), **deploy and rollback procedures** including how long a rollback takes, **disaster recovery** for restore paths and the last time a restore was tested, and **standard operating procedures** for routine risky work — rotating a credential, promoting a replica, running a backfill.

The hard part is keeping them true. Runbooks decay faster than any other documentation because they're only read under stress, so nobody notices they're wrong until the worst moment. Three habits fix most of it: **update the runbook as a postmortem action item** while the incident is fresh; **link them from the alert itself** so they're used and their errors get found; and **automate whatever you find yourself pasting**. A sequence of six commands that always run together should become one script, and eventually the automation replaces the runbook entry entirely — the ideal end state for any procedure a human keeps performing identically.

## Why it matters

Being asked "what does your team do when X alert fires?" is a fast probe for whether you've operated a service. It's also the highest-value writing an engineer does per word: a good runbook entry converts a 40-minute outage into a 5-minute one, in the hands of someone who has never seen the system.

## Key points

- Write for a tired, unfamiliar reader: commands and checks, not concepts.
- Every alert links to its runbook entry, and an alert without one is unfinished.
- State user impact in one plain sentence before anything technical.
- Put safe mitigations before diagnosis, so the fastest path to recovery is the first thing on the page.
- Rank likely causes by observed frequency, not by theoretical plausibility.
- Include the escalation path and who actually owns the service.
- Runbooks decay silently because they're only read under stress — update them as postmortem actions.
- Any procedure that never varies should become a script, and then the script replaces the entry.
