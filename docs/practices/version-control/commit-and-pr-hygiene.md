---
title: Commit & pull request hygiene
summary: A commit should be one reversible idea with a message explaining why, and a PR should tell the reviewer what to look at first.
level: core
minutes: 18
order: 4
tags: [git, collaboration, communication]

related:
  - practices/code-review/keeping-changes-small
  - practices/version-control/merge-rebase-and-history
  - practices/technical-communication/async-updates-and-visibility

resources:
  - title: How to Write a Git Commit Message
    url: https://cbea.ms/git-commit/
    source: Chris Beams
    type: article
    minutes: 12
    primary: true
  - title: Conventional Commits
    url: https://www.conventionalcommits.org/en/v1.0.0/
    source: Conventional Commits
    type: docs
    minutes: 10
  - title: Write Better Commits, Build Better Projects
    url: https://github.blog/developer-skills/github/write-better-commits-build-better-projects/
    source: GitHub
    type: article
    minutes: 15
---

## In one line

Commit messages and PR descriptions are the only documentation guaranteed to still exist in two years, so write them for the person doing the archaeology.

## What it is

A good commit is **one coherent change** that could be reverted on its own. Mixing a rename, a bug fix, and a dependency bump into one commit means reverting the bug fix takes the rename with it, and `blame` on any line lands on a message that doesn't explain it. Formatting-only changes belong in their own commit for the same reason — otherwise they bury the two real lines in a 400-line diff.

The message has a shape: a subject under ~50 characters in the imperative ("Fix stale cache on profile update", not "Fixed" or "Fixes"), a blank line, then a body wrapped at ~72 explaining **why**. The diff already says what changed; it cannot say what you tried first, which constraint forced the odd-looking approach, or which incident this came from. Link the ticket, but don't make the ticket the only record — issue trackers get migrated and links rot.

**Conventional Commits** (`feat:`, `fix:`, `chore:`, with `!` for breaking) adds machine-readable structure. It earns its place when something automated consumes it — semantic-release, changelog generation, monorepo change detection. Adopted purely as ceremony, it's noise with a colon in it.

A pull request description is a different artifact from a commit message: it's addressed to a reviewer who has limited time and no context. Say what changed and why, how you verified it, and — most valuably — **where you want the reviewer to focus** and what you're unsure about. Screenshots or a short clip for UI work. Call out anything intentionally out of scope so it doesn't get flagged. Self-reviewing your own diff before hitting request, and leaving inline comments on the non-obvious parts, catches a surprising share of what a reviewer would otherwise find.

## Why it matters

This is one of the cheapest, most visible senior signals there is — a reviewer forms an impression of your judgement from the PR description before reading a line of code. It also pays off directly during incidents, when someone bisects to a commit and needs to know in thirty seconds whether reverting it is safe.

## Key points

- One commit is one reversible idea; mixing refactors with behaviour changes makes both harder to review and to revert.
- The subject line is imperative and short; the body explains *why*, because the diff already shows *what*.
- Keep pure formatting or rename commits separate so real changes aren't buried.
- Conventional Commits are worth adopting only when tooling consumes them — otherwise they're ceremony.
- A PR description should state scope, verification, and where the reviewer should look hardest.
- Self-review the diff and annotate the non-obvious parts before requesting review.
- Commit messages outlive tickets, wikis, and the people who wrote them — write them for future archaeology.
