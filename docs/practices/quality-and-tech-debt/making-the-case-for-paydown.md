---
title: Making the case for paydown
summary: Nobody funds "refactoring" — they fund a named business cost, so measure the tax the debt charges and attach the fix to work already planned.
level: core
minutes: 20
order: 2
tags: [tech-debt, communication, influence]

related:
  - practices/quality-and-tech-debt/what-tech-debt-actually-is
  - practices/technical-communication/communicating-with-non-engineers
  - practices/team-workflow/planning-estimation-and-scope

resources:
  - title: Manage technical quality
    url: https://staffeng.com/guides/manage-technical-quality/
    source: Will Larson
    type: article
    minutes: 30
    primary: true
  - title: Refactoring — When Should We Refactor?
    url: https://martinfowler.com/books/refactoring.html
    source: Martin Fowler
    type: book
  - title: Google SRE Book — Eliminating Toil
    url: https://sre.google/sre-book/eliminating-toil/
    source: Google SRE
    type: docs
    minutes: 20
---

## In one line

Translate the debt into the currency your stakeholders already track — delivery time, incident rate, support load, churn — and the conversation stops being about engineering taste.

## What it is

The failed version of this conversation is "we need a quarter to clean up the codebase". It fails because it asks for a large, unbounded, unmeasurable investment with no visible outcome, from someone accountable for shipping. Three moves make it work.

**Quantify the interest.** Not "the auth module is a mess" but "the last four features touching auth were each estimated at three days and took eight, and two of the last five incidents came from it". Cycle time on that area, change failure rate, on-call pages, support tickets, and time-per-feature are all things you can pull from tools you already have. A number turns a preference into an argument.

**Attach paydown to work that's already funded.** The strongest version is the preparatory refactor: "this feature is two weeks as-is, or three days plus four days of restructuring — and the next three features in this area get cheaper too." Kent Beck's line — make the change easy, then make the easy change — is the whole technique. Opportunistic cleanup as you pass through (the campsite rule) covers the small stuff without ever needing permission.

**Size it and bound it.** A named, time-boxed piece of work with a stated outcome — "two weeks, and after it the checkout flow has one payment abstraction instead of three" — is fundable. An open-ended rewrite is not, and the full rewrite is usually the wrong answer anyway: it takes longer than promised, ships no features while it runs, and reproduces the same problems with different names. Incremental strangling beats rewriting on almost every real system.

Some teams reserve a fixed fraction of each cycle — 10–20% — for maintenance. It works when it's protected and spent on the highest-interest debt, and becomes theatre when it's the first thing cut. Either way, keep a visible debt register with the cost of each item, so the conversation is about a prioritised list rather than a vague feeling.

The last piece is timing: the best moment to ask is right after an incident caused by that debt, when the cost is fresh and undisputed. The postmortem's action items are the most fundable engineering work in the building.

## Why it matters

This is the "influence without authority" question in technical clothing, and it appears in nearly every senior and staff loop. The answer that lands describes a measurement, a specific ask, and a business outcome — not a complaint about a codebase.

## Key points

- Express debt as delivery time, incidents, support load, or churn — never as code aesthetics.
- Use data you already have: cycle time, change failure rate, pages, tickets by area.
- The preparatory refactor is the most fundable form: make the change easy, then make the easy change.
- Bound the ask with a duration and an observable outcome; open-ended cleanup doesn't get approved.
- Big-bang rewrites usually cost more than promised and reproduce the original problems.
- Opportunistic cleanup in code you're already touching needs no permission and compounds.
- A fixed maintenance allocation only works if it's genuinely protected when deadlines get tight.
- Post-incident is the highest-leverage moment to ask, because the cost is undisputed.
