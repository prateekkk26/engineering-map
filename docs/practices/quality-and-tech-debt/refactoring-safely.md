---
title: Refactoring safely
summary: Refactoring means changing structure without changing behaviour, which is only true if something independent is proving behaviour didn't change.
level: core
minutes: 22
order: 3
tags: [refactoring, quality, testing]

related:
  - practices/code-review/keeping-changes-small
  - practices/quality-and-tech-debt/working-in-unfamiliar-code
  - _shared/testing-strategy

resources:
  - title: Refactoring — Improving the Design of Existing Code
    url: https://martinfowler.com/books/refactoring.html
    source: Martin Fowler
    type: book
    primary: true
  - title: Workflows of Refactoring
    url: https://martinfowler.com/articles/workflowsOfRefactoring/
    source: Martin Fowler
    type: article
    minutes: 20
  - title: Opportunistic Refactoring
    url: https://martinfowler.com/bliki/OpportunisticRefactoring.html
    source: Martin Fowler
    type: article
    minutes: 6
---

## In one line

A refactor is a behaviour-preserving transformation applied in small verified steps — if you can't tell whether behaviour changed, you're rewriting, not refactoring.

## What it is

The defining property is **behaviour preservation**, and the thing that makes it real is a test suite you trust running between each step. Without one, the first move is not the refactor — it's characterisation tests: write tests that assert what the code *currently does*, bugs and all, so any deviation shows up. Approval or snapshot tests are a legitimate shortcut here, capturing existing output wholesale to detect drift without you having to understand it first.

Work in **small steps that keep the code working the whole time**. Extract a function, run the tests, commit. Rename, run, commit. The alternative — a four-hour transformation ending in a red suite and no idea which of forty edits broke it — is the experience that makes people afraid of refactoring. Automated refactorings from the IDE are safer than hand-editing for the mechanical ones (rename, extract, move) and are worth using even when it feels slower.

**Never mix a refactor with a behaviour change in the same commit.** A reviewer can skim a pure structural diff, and a bisect can trust it. Mixed together, both become invisible and a revert takes the wrong thing with it.

The **workflows** are worth naming because they're how it actually happens: *preparatory* (restructure so the feature you're about to add fits), *comprehension* (you understood something while reading, so encode that understanding in names and structure), *litter-pickup* (small cleanups as you pass through), *planned* (a scheduled chunk, the rarest and least preferred), and *long-term* (a large change made a piece at a time by many people, usually via branch by abstraction or parallel change).

Know when to stop: refactoring is not free, and structure that isn't causing pain doesn't need improving. The stopping rule is the same as the starting one — does this make the change I need to make easier? And for genuinely large restructurings, keep it merged and flagged rather than on a branch, because a two-week refactoring branch will lose the merge race against a team actively editing the same files.

## Why it matters

The practical and take-home rounds reward this directly — reviewers look at whether structural change is separated from behaviour change, and whether tests would have caught a mistake. In real work it's the mechanism that keeps a codebase workable, and describing it in terms of small verified steps rather than a heroic cleanup is the senior framing.

## Key points

- Behaviour preservation is the definition; without a trusted test suite you're rewriting.
- Write characterisation tests before touching code whose behaviour isn't specified anywhere.
- Take small steps and keep the code green between each one, committing frequently.
- Never combine a structural change and a behavioural change in one commit or PR.
- Use IDE-automated refactorings for mechanical transformations — they're safer than hand-editing.
- Preparatory refactoring is the highest-value workflow: restructure so the next change is easy.
- Large restructurings proceed via branch by abstraction on `main`, not on a long-lived branch.
- Stop when the structure stops causing pain — refactoring to taste has no payoff.
