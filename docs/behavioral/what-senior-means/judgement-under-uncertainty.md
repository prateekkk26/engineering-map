---
title: Judgement Under Uncertainty
summary: Seniority shows up as the quality of your defaults when there isn't enough information to be sure.
level: core
minutes: 20
order: 4
tags: [judgement, tradeoffs, decision-making]

related:
  - behavioral/common-questions/working-in-ambiguity
  - behavioral/what-senior-means/what-the-interviewer-is-scoring
  - system-design/architecture-decisions/architecture-decision-records

resources:
  - title: Choose Boring Technology
    url: https://boringtechnology.club/
    source: Dan McKinley
    type: article
    minutes: 25
    primary: true
  - title: Is high quality software worth the cost?
    url: https://martinfowler.com/articles/is-quality-worth-cost.html
    source: Martin Fowler
    type: article
    minutes: 15
  - title: Frameworks for decision making
    url: https://lethain.com/frameworks-decision-making/
    source: Will Larson
    type: article
    minutes: 10
---

## In one line

Good judgement is mostly a small set of well-chosen defaults plus the habit of asking how expensive it is to be wrong.

## What it is

Interviewers can't test judgement directly, so they test it indirectly: by asking about a decision you made with incomplete information and listening to how you reasoned.

The reasoning they're listening for has a shape.

**Reversibility first.** The cost of a wrong decision matters more than its probability. A choice you can undo in an afternoon — a library, a component boundary, a flag default — should be made fast and cheaply. A choice you can't — the data model, the auth model, a public API contract, a vendor you'll build the product around — deserves the doc and the day. Treating both classes the same is the most common judgement failure in either direction: agonising over the reversible, sleepwalking into the irreversible.

**Innovation budget.** You get to be novel in a small number of places. Spend it where the novelty is the product, and pick the boring option everywhere else, because boring technology's failure modes are already documented by strangers on the internet. At an AI startup the interesting risk is in the model layer; that's an argument for Postgres, not against it.

**Constraint before solution.** Most bad decisions are answers to unasked questions. "How many users, how fresh does the data need to be, what happens if it's wrong" narrows the option space faster than any comparison table.

**Deciding is a deliverable.** An unmade decision costs a team more than a mediocre made one, because everything downstream stalls. Senior engineers close decisions — with a stated assumption and a review date if necessary — rather than collecting more information forever.

And when it was wrong: say so, say what signal you missed, and say what you now check for. That's the actual demonstration of judgement, more than any decision that happened to work.

## Why it matters

Every round from the system design onward is a judgement test wearing different clothes, and the deep-dive round exists specifically to find the edge of yours. Companies hire seniors because they want fewer decisions escalated and fewer expensive ones made badly — so "how did you decide" gets more follow-up than "what did you build."

## Key points

- Sort decisions by reversibility; spend time proportional to the cost of being wrong, not to how interesting they are.
- Irreversible-ish by default: data model, auth, public contracts, and anything a vendor's shape leaks into.
- Keep the novelty budget for where novelty *is* the product; boring technology has publicly documented failure modes.
- Ask for the constraint — scale, freshness, blast radius — before comparing solutions.
- Not deciding is a decision with compounding cost; close it with a stated assumption and a review date.
- State the trade-off you accepted, not just the option you picked; "I chose X and gave up Y" is the senior sentence.
- Being wrong is fine in an answer; being wrong without having noticed why is not.
