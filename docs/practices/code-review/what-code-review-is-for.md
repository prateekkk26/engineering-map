---
title: What code review is for
summary: Review exists to keep the codebase healthy over time and spread context through the team — catching bugs is a side effect, not the goal.
level: core
minutes: 20
order: 1
tags: [code-review, collaboration, process]

related:
  - practices/code-review/what-to-look-for-in-a-review
  - practices/code-review/keeping-changes-small
  - practices/quality-and-tech-debt/keeping-a-codebase-healthy

resources:
  - title: Google Engineering Practices — How to do a code review
    url: https://google.github.io/eng-practices/review/reviewer/
    source: Google
    type: docs
    minutes: 30
    primary: true
  - title: The Standard of Code Review
    url: https://google.github.io/eng-practices/review/reviewer/standard.html
    source: Google
    type: docs
    minutes: 10
  - title: Ship / Show / Ask
    url: https://martinfowler.com/articles/ship-show-ask.html
    source: Rouan Wilsenach
    type: article
    minutes: 12
---

## In one line

The bar is not "is this how I would have written it" but "does this definitively improve the overall health of the codebase" — and if it does, it gets approved.

## What it is

Google's formulation is the clearest one in circulation and worth adopting verbatim: **a reviewer approves a change once it definitely improves overall code health, even if it isn't perfect.** There is no such thing as perfect code, only better code, and blocking on perfection means changes stall while the codebase gets worse in the meantime. The corollary is that "I'd have done it differently" is not grounds to block; "this makes the codebase harder to change" is.

Review does several jobs at once, and they're worth separating because they suggest different behaviours:

- **Design feedback** — is this the right shape, in the right place, at the right layer? This is the highest-value thing a reviewer does, and it has to happen early, because by the time 800 lines exist the design is effectively fixed.
- **Context spread** — two people now know how this works. This is the underrated one: it's the mechanism by which a team stops having single points of human failure.
- **Correctness and safety** — bugs, security holes, missing edge cases. Real, but the thing tests and types should be catching, and a reviewer reading a diff is a weak net compared to either.
- **Consistency** — the codebase looks like one system. Mostly automatable; if a human is arguing about it, the linter is misconfigured.

Because review is expensive and blocking, some teams grade it: **Ship / Show / Ask**. Trivial or low-risk changes ship straight to `main`; "show" opens a PR and merges immediately, inviting comment after the fact; "ask" blocks on approval. It works when the team has strong tests and trust, and it directs review attention at the changes that actually warrant it.

The thing to be alert to is review as a **latency tax**. A PR that waits a day and a half for a first look means the author has context-switched away and will take an hour to come back. Fast, imperfect review usually beats slow, thorough review.

## Why it matters

"How does your team do code review?" comes up in nearly every hiring-manager conversation, and it's a proxy for how you handle disagreement and how much you care about the codebase after you've left it. Naming a standard — code health, not personal preference — is the difference between having opinions and having a policy.

## Key points

- Approve when the change improves code health overall; perfection is not the bar.
- "Not how I'd write it" is a comment, not a blocker — reserve blocking for real harm.
- Design feedback is the highest-value part of review and must arrive early to be actionable.
- Spreading context so more than one person understands each area is a first-class goal, not a bonus.
- Style and formatting should be enforced by tooling, never by humans in comments.
- Review latency is a real cost: a slow first response forces the author to context-switch twice.
- Grading review by risk (ship/show/ask) concentrates attention where it matters, given enough test coverage and trust.
