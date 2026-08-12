---
title: STAR, and How It Fails
summary: STAR is a good skeleton and a terrible script — the situation should take fifteen seconds and the result is the part everyone forgets.
level: core
minutes: 15
order: 1
tags: [storytelling, interviewing, star]

related:
  - behavioral/story-bank/building-the-story-bank
  - behavioral/story-bank/quantifying-impact
  - behavioral/what-senior-means/what-the-interviewer-is-scoring

resources:
  - title: Interviewing at Amazon — STAR in practice
    url: https://www.amazon.jobs/en/landing_pages/in-person-interview
    source: Amazon
    type: docs
    minutes: 10
    primary: true
  - title: The STAR method explained
    url: https://www.themuse.com/advice/star-interview-method
    source: The Muse
    type: article
    minutes: 10
  - title: How to answer behavioral questions
    url: https://www.techinterviewhandbook.org/behavioral-round-overview/
    source: Tech Interview Handbook
    type: docs
    minutes: 15
---

## In one line

Situation, Task, Action, Result — useful as a checklist that your answer has an ending, damaging when it turns into a recited format.

## What it is

STAR exists because the natural way engineers answer behavioural questions is to describe a system, not a story. The structure forces four things into the answer: what the circumstances were, what you specifically had to do, what you actually did, and what happened as a consequence.

Where it goes wrong is proportion. Most candidates spend two minutes on Situation — the org chart, the tech stack, why the legacy service existed — and thirty seconds on Action. Invert it. The situation needs one or two sentences and only the details the rest of the story depends on. The interviewer does not need to understand your architecture; they need to understand why the thing was hard.

The **Task** is the most-skipped part and does real work: it establishes scope. "I was asked to help" and "I was the only engineer on it and owned the call" are the difference between two levels.

The **Action** is where all the value is, and it must be first-person and decision-shaped. Not "we investigated" but "I bisected the releases, found the regression in the caching layer, and decided to roll forward rather than revert because the revert would have dropped queued jobs." Include the option you *rejected* — that single clause is what makes an answer sound senior rather than lucky.

The **Result** is the most commonly missing part. Numbers if you have them, and if you don't, direction and evidence: "queue depth stopped growing", "support tickets on that flow went to roughly zero", "it's still running unchanged two years later". Add a sentence on what you'd do differently; interviewers reliably ask for it and volunteering it reads as reflection rather than defensiveness.

A well-told story runs 90 seconds to two minutes and then stops. Stopping is a skill — it invites the follow-up, which is where the interesting part happens.

## Why it matters

The behavioural round is the one where preparation has the highest return per hour, and the mechanics are this simple. An engineer with genuinely better experience routinely loses to one with worse experience and an answer that has an ending.

## Key points

- Situation and Task together should be about fifteen seconds — only the detail the rest depends on.
- Task establishes your scope; skipping it is how senior work gets heard as mid-level work.
- Action is first person and decision-shaped: what you chose, and what you chose against.
- Naming the rejected option is the cheapest seniority signal available.
- Always land a Result, with a number if one exists and observable direction if not.
- Volunteer one thing you'd do differently before you're asked.
- Aim for two minutes, then stop and let the follow-up come.
- Use STAR as a pre-flight check, not as a spoken format; nobody should hear the letters.
