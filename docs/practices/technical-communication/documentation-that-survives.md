---
title: Documentation that survives
summary: Split docs by what the reader is trying to do, keep them next to the code, and delete anything you can't keep true.
level: core
minutes: 20
order: 2
tags: [documentation, communication, onboarding]

related:
  - practices/technical-communication/runbooks-and-operational-docs
  - practices/team-workflow/local-environments-and-onboarding
  - frontend/architecture/documenting-ui-with-storybook

resources:
  - title: Diátaxis
    url: https://diataxis.fr/
    source: Daniele Procida
    type: docs
    minutes: 30
    primary: true
  - title: Technical Writing One
    url: https://developers.google.com/tech-writing/one
    source: Google
    type: course
    minutes: 120
  - title: Write the Docs — Documentation Guide
    url: https://www.writethedocs.org/guide/
    source: Write the Docs
    type: docs
    minutes: 25
---

## In one line

Most documentation fails because it mixes four different jobs into one page, and the reader who needed a five-line answer gets a tutorial instead.

## What it is

**Diátaxis** is the framework worth internalising: documentation serves four distinct needs, and each wants different writing. **Tutorials** teach a beginner by having them do something that works — no options, no explanation of alternatives. **How-to guides** help someone competent achieve a specific goal — a recipe, assuming context. **Reference** describes the machinery accurately and exhaustively, and is looked up, not read. **Explanation** gives background and reasoning — why it's built this way, what the tradeoffs were. Mixing them is why so many READMEs simultaneously over-explain and fail to answer the question.

A README's job is narrow: what this is, how to run it in one block of commands, how to run the tests, how to deploy, and where to go for more. If a new engineer can't get the project running from it alone, it's broken, and that's a testable claim — have the next joiner follow it verbatim and fix everything they trip on.

**Docs rot in proportion to their distance from the code.** Same-repo markdown, reviewed in the same PR as the change, survives; a wiki page updated by whoever remembers does not. Generating what can be generated — API reference from types or an OpenAPI spec, component docs from stories, CLI help from the parser — removes whole categories of drift. Executable docs are the strongest form: a quickstart that CI actually runs cannot silently become wrong.

**Write less.** Every page is a maintenance liability, and wrong documentation is worse than none because it's believed. Delete aggressively, date things that will age, and prefer linking one good external source to paraphrasing it badly. The pages that earn permanent status are the ones answering questions that recur: how to set up, how to deploy, how the domain model works, why this odd decision exists.

Style: short sentences, active voice, second person, concrete examples over abstract description, and code samples that can be pasted and run. Lead with the answer — readers are scanning, not reading.

## Why it matters

Documentation quality is one of the few things a candidate can be asked to produce on the spot ("write the README for your take-home"), and in take-home reviews it's scored. On a team, it's the multiplier that determines how much of your knowledge outlives your attention — and at remote companies, it's the primary interface between people.

## Key points

- Tutorials, how-to guides, reference, and explanation are four different documents; merging them serves nobody.
- A README must get someone from clone to running, testing, and deploying.
- Test the README by watching the next joiner follow it exactly.
- Docs stored with the code and reviewed in the same PR stay true; wikis drift.
- Generate reference material from the source of truth — types, specs, stories, CLI parsers.
- Executable documentation that CI runs can't rot silently.
- Fewer pages, kept accurate, beat comprehensive documentation that's partly wrong.
- Lead with the answer, write in the active voice, and give examples that can be pasted and run.
