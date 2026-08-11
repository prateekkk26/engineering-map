---
title: Keeping changes small
summary: Review quality falls off a cliff past a few hundred lines, so the highest-leverage review skill is splitting work before anyone reads it.
level: core
minutes: 18
order: 5
tags: [code-review, delivery, process]

related:
  - practices/code-review/what-code-review-is-for
  - practices/team-workflow/shipping-incrementally
  - practices/quality-and-tech-debt/refactoring-safely

resources:
  - title: Small CLs
    url: https://google.github.io/eng-practices/review/developer/small-cls.html
    source: Google
    type: docs
    minutes: 12
    primary: true
  - title: Branch by Abstraction
    url: https://martinfowler.com/bliki/BranchByAbstraction.html
    source: Martin Fowler
    type: article
    minutes: 10
  - title: Parallel Change
    url: https://martinfowler.com/bliki/ParallelChange.html
    source: Martin Fowler
    type: article
    minutes: 8
---

## In one line

A 50-line diff gets real comments and a 1,500-line diff gets "LGTM", so size is the variable that decides whether review happens at all.

## What it is

Reviewers have a fixed attention budget. Past roughly 200–400 lines of real change, defect detection drops sharply and approval becomes rubber-stamping — everyone has both written and approved the 2,000-line PR that nobody read. Small changes also review faster, roll back cleaner, conflict less, and let the author ship instead of babysitting a branch for a week.

The objection is always "this change can't be split". Usually it can, with one of a few standard techniques:

- **Separate refactoring from behaviour change.** Two PRs: one that moves and renames things with no behavioural delta, one small one that changes what the code does. The first is skimmable, the second is readable. Mixed together, both are invisible.
- **Parallel change (expand / migrate / contract).** Add the new thing alongside the old, migrate callers incrementally, then delete the old. Each step is independently mergeable and independently revertible — this is also how you make a breaking API or schema change without a big-bang cutover.
- **Branch by abstraction.** Introduce a seam in front of the thing you're replacing, then swap implementations behind it over several PRs.
- **Merge unreachable code.** Land the backend, the schema, the helper module before anything calls them. Dead code that compiles and is tested is harmless; a giant PR is not.
- **Flag it off.** Feature flags let a half-built feature live in `main` without being visible, which is what makes the previous four possible on a trunk-based team.

Splitting has a cost — more PRs to open, more descriptions to write, and each one needs to be independently safe to deploy, because on a continuously-deployed system it *will* be. That cost is real and much smaller than the alternative.

The one place the rule bends: a change that only makes sense as a whole — a rename touching 300 files, a generated update, a dependency bump — is fine large, as long as the description says so and the mechanical part is separated from anything hand-written.

## Why it matters

This is the practice that makes everything else in review work, and it's the concrete answer to "how do you ship a large change safely?" — a question that shows up in both system design and deep-dive rounds. Naming parallel change or branch by abstraction by name signals you've done a migration rather than read about one.

## Key points

- Defect detection collapses past a few hundred changed lines; large PRs get approved, not reviewed.
- Never mix a refactor with a behaviour change — split them into two PRs so each is legible.
- Parallel change (expand, migrate, contract) turns a breaking change into a sequence of safe ones.
- Branch by abstraction introduces a seam so a replacement can land across several PRs.
- Merging code before anything calls it is safe and shrinks the PR that turns it on.
- Feature flags are what let incomplete work live in `main` without shipping to users.
- Each split PR must be independently deployable and revertible, which is a real design constraint.
- Mechanical bulk changes are the exception — keep them separate from hand-written ones and say so.
