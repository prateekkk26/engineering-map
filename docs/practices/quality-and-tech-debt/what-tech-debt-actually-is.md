---
title: What tech debt actually is
summary: Debt is the future cost of a design choice, and the useful distinction is whether it was taken deliberately and whether interest is actually being paid.
level: core
minutes: 20
order: 1
tags: [tech-debt, quality, architecture]

related:
  - practices/quality-and-tech-debt/making-the-case-for-paydown
  - practices/quality-and-tech-debt/keeping-a-codebase-healthy
  - system-design/architecture-decisions/designing-under-constraints

resources:
  - title: Technical Debt
    url: https://martinfowler.com/bliki/TechnicalDebt.html
    source: Martin Fowler
    type: article
    minutes: 8
    primary: true
  - title: Technical Debt Quadrant
    url: https://martinfowler.com/bliki/TechnicalDebtQuadrant.html
    source: Martin Fowler
    type: article
    minutes: 6
  - title: Is High Quality Software Worth the Cost?
    url: https://martinfowler.com/articles/is-quality-worth-cost.html
    source: Martin Fowler
    type: article
    minutes: 20
---

## In one line

Technical debt is the accumulated cost of design decisions that make future change slower, and like financial debt it is sometimes the right thing to take on.

## What it is

Ward Cunningham's metaphor was originally about **learning**: you ship your current understanding of the domain, the understanding improves, and the gap between the code and what you now know is the debt. Repaying it means refactoring the code to match the better model. That framing is more useful than the common one, because it explains why debt appears even on a team that did everything right.

Fowler's **quadrant** — deliberate/inadvertent crossed with prudent/reckless — is the tool for talking about it without moralising. *Deliberate and prudent*: "we ship the hardcoded version to hit the launch and generalise in Q3." *Deliberate and reckless*: "we don't have time for design." *Inadvertent and prudent*: "now that it's built, we see what the right structure was" — Cunningham's original case, and the largest category on any healthy team. *Inadvertent and reckless*: nobody knew what layering was. Only the reckless quadrants are failures; the other two are normal engineering.

The distinction that matters operationally is **whether the debt charges interest**. Ugly code in a stable module nobody touches costs nothing — leave it. The same ugliness in the file every feature edits costs a tax on every change, and that's what you pay down. Debt is a rate, not a balance, so prioritise by *change frequency × pain*, not by how offended you are by the code.

Not everything called debt is debt: a missing feature is not debt, code you don't like is not debt, and choosing a boring technology deliberately is not debt. Being loose with the word is how the term became a shrug that means "code I'd rather not work in", which is exactly why business stakeholders stopped taking it seriously.

The economic argument, and the one to use with a product manager: quality here is not a virtue purchase, it's the mechanism by which the team stays fast. The tradeoff curve turns within weeks, not years — internal quality pays for itself in the same quarter on any codebase that's still being changed.

## Why it matters

Every senior loop probes this: "tell me about a time you had to balance shipping speed against quality." A candidate who can classify the debt, say what interest it charged, and describe a deliberate decision to take it on sounds like an engineer with judgement rather than one with preferences.

## Key points

- Debt is the gap between the code you have and the design your current understanding implies.
- The quadrant separates prudent from reckless — deliberate shortcuts with a plan are legitimate engineering.
- Learning-driven debt is unavoidable and is the largest category even on strong teams.
- Interest is what matters: debt in rarely-touched code is free, debt in hot code taxes every change.
- Prioritise by change frequency times pain, not by how much the code offends you.
- Missing features, unfamiliar style, and deliberate boring technology choices are not debt.
- Internal quality pays back on a scale of weeks on any code still being modified.
- The word only stays useful if it means something specific — say what the actual cost is.
