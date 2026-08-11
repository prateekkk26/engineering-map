---
title: Merge, rebase & readable history
summary: Rebase your own unpushed work to keep history linear, merge anything shared, and never rewrite a branch other people are building on.
level: core
minutes: 20
order: 3
tags: [git, collaboration]

related:
  - practices/version-control/git-mental-model
  - practices/version-control/commit-and-pr-hygiene
  - practices/version-control/recovering-from-git-mistakes

resources:
  - title: Pro Git — Rebasing
    url: https://git-scm.com/book/en/v2/Git-Branching-Rebasing
    source: git-scm
    type: docs
    minutes: 20
    primary: true
  - title: Merging vs. rebasing
    url: https://www.atlassian.com/git/tutorials/merging-vs-rebasing
    source: Atlassian
    type: article
    minutes: 15
  - title: git-rebase
    url: https://git-scm.com/docs/git-rebase
    source: git-scm
    type: docs
    minutes: 15
---

## In one line

Merge preserves what actually happened, rebase rewrites it into what you wish had happened, and the deciding question is whether anyone else has the commits.

## What it is

A **merge** creates a commit with two parents, joining two lines of development. History stays truthful and nothing is rewritten, at the cost of a graph that braids — on a busy repo, `git log --graph` becomes unreadable and "when did this break?" gets harder to answer.

A **rebase** replays your commits onto a new base, producing new commits with new hashes. History is linear and each commit sits on top of current `main`, which makes `bisect` and `blame` behave sensibly. The cost is that the commits are fabrications: they are presented as though written against a base they were never tested against, so each intermediate commit may not actually build unless you rebuild during an interactive rebase.

**The golden rule: don't rebase commits that exist outside your machine.** Rewriting a shared branch means everyone else's copy diverges from a history that no longer exists, and the recovery is `--force-with-lease` plus a message in chat, or a mess. `--force-with-lease` over plain `--force` at least refuses when the remote has moved since you last fetched.

At merge time into `main`, teams pick one of three: a **merge commit** (full history, braided graph), **squash** (one commit per PR — tidy, and the review unit and the history unit match, but intermediate steps vanish), or **rebase-and-merge** (linear, all commits preserved). Squash is the common default for product repos with PR-sized changes; it also means messy work-in-progress commits on a branch cost nothing, which is liberating.

`git rebase -i` is the workhorse for cleaning a branch before review: reorder, squash fixups, reword messages, split a commit. `git commit --fixup` plus `rebase --autosquash` automates the common case. Doing this before requesting review is a courtesy to the reviewer; doing it after review has started destroys comment anchoring.

## Why it matters

Every team has this argument, and how you frame it signals whether you think about the people reading history later. The practical stakes are real: a rebase of a shared branch mid-sprint costs the team an afternoon, and a history where every commit builds is the difference between `git bisect` finding a regression in ten minutes and nobody bothering.

## Key points

- Merge preserves true history; rebase produces a cleaner but fictional linear one.
- Never rewrite history that others have pulled — the golden rule of rebasing.
- `--force-with-lease` is the safe force push: it aborts if the remote moved since your last fetch.
- Squash merging makes the PR the unit of history, which keeps `main` readable and lets branch commits stay messy.
- Rebase interactively *before* review starts; rebasing mid-review orphans reviewer comments.
- Linear history is what makes `git bisect` and `git blame` genuinely useful for finding regressions.
- Conflicts during a rebase are resolved once per commit, which is why long-running rebases hurt and short branches don't.
