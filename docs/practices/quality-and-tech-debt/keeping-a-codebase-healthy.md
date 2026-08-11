---
title: Keeping a codebase healthy
summary: Health comes from automated constraints and clear ownership, not from everyone agreeing to be disciplined.
level: core
minutes: 20
order: 5
tags: [quality, tooling, architecture]

related:
  - frontend/tooling/linting-and-formatting-at-scale
  - practices/quality-and-tech-debt/what-tech-debt-actually-is
  - practices/team-workflow/measuring-delivery-and-devex

resources:
  - title: Software Engineering at Google — Large-Scale Changes
    url: https://abseil.io/resources/swe-book/html/ch22.html
    source: Google
    type: book
    primary: true
  - title: CodeSmell
    url: https://martinfowler.com/bliki/CodeSmell.html
    source: Martin Fowler
    type: article
    minutes: 8
  - title: About code owners
    url: https://docs.github.com/articles/about-code-owners
    source: GitHub
    type: docs
    minutes: 10
---

## In one line

Anything a team has agreed to do by hand will decay; anything the pipeline enforces will hold.

## What it is

The pattern behind healthy codebases is **converting conventions into constraints**. Formatting is a formatter with no options worth arguing about. Import boundaries between modules are a lint rule, not a paragraph in a wiki. Type coverage is a compiler flag. Bundle size and Core Web Vitals are budgets that fail the build. Dependency freshness is an automated PR that arrives weekly. Each of these replaces a recurring human argument with a one-time decision.

**Ownership** is the other half. `CODEOWNERS` mapping directories to people or teams means every change reaches someone who knows the area, and — more importantly — every area has someone accountable for it. Code with no owner is where rot concentrates, because nobody's job is to notice.

**Ratcheting** is how you improve an existing codebase without a stop-the-world cleanup: allow the current level of a problem, forbid it from getting worse, and shrink the allowance over time. Type-check new files strictly while legacy files stay loose; baseline the current lint violations and fail on new ones; require coverage on changed lines rather than globally. This is the technique that makes a large migration survive contact with feature delivery, and it works precisely because it never blocks anyone.

Signals worth watching, cheaply: files that change constantly *and* are complex (the hotspots), test suite duration, flake rate, build time, the number of open dependency vulnerabilities, and how long a typical PR takes to merge. Any of them trending badly is an early warning that costs nothing to collect.

The counterweight matters too: **rules have costs**. A lint rule that fires on legitimate code trains people to add ignore comments, and each ignore comment weakens every rule. Prefer few, high-value, unambiguous constraints; delete rules that generate more argument than value. Same for abstractions — premature shared components and speculative generality make a codebase harder to change, and "keeping it healthy" does not mean maximally DRY.

## Why it matters

Anyone senior gets asked how they'd raise the quality bar on a team they've just joined, and "automate it and assign ownership" is a much stronger answer than "code review and discipline". It's also the practical answer to how a migration ever finishes on a team that also has to ship features.

## Key points

- Turn every convention you'd otherwise repeat in review into an automated constraint.
- Formatting, import boundaries, type strictness, and performance budgets are all enforceable in CI.
- `CODEOWNERS` gives every area an accountable owner; unowned code is where rot collects.
- Ratchet improvements: freeze the current level, forbid regressions, shrink the allowance over time.
- Enforce on changed lines rather than globally so quality gates never block unrelated work.
- Watch hotspots, suite duration, flake rate, and PR merge time as early warning signals.
- Noisy rules get suppressed and weaken every other rule — keep the set small and unambiguous.
- Premature abstraction is its own health problem; duplication is sometimes the cheaper choice.
