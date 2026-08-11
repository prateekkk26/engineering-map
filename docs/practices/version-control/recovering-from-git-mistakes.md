---
title: Recovering from Git mistakes
summary: Almost nothing committed is ever truly lost — reflog, revert and bisect cover the situations that actually cause panic.
level: core
minutes: 18
order: 5
tags: [git, debugging]

related:
  - practices/version-control/git-mental-model
  - practices/version-control/merge-rebase-and-history
  - practices/incident-response/mitigate-before-you-diagnose

resources:
  - title: Oh Shit, Git!?!
    url: https://ohshitgit.com/
    source: Katie Sylor-Miller
    type: article
    minutes: 15
    primary: true
  - title: git-reflog
    url: https://git-scm.com/docs/git-reflog
    source: git-scm
    type: docs
    minutes: 10
  - title: Pro Git — Debugging with Git (bisect)
    url: https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git
    source: git-scm
    type: docs
    minutes: 15
---

## In one line

The reflog records every position `HEAD` has held for weeks, so a "lost" commit is nearly always one `git reset --hard <sha>` away from being back.

## What it is

**`git reflog`** is the escape hatch. Every time `HEAD` moves — commit, checkout, reset, rebase, merge — Git appends an entry. A botched rebase, a hard reset to the wrong commit, a deleted branch: find the pre-disaster entry, and `git reset --hard HEAD@{n}` or `git branch recovered <sha>` puts it back. Orphaned commits survive until garbage collection, typically 30 days by default, so panic is rarely warranted.

What the reflog *doesn't* cover is uncommitted work. `git checkout .`, `git stash drop`, and `git reset --hard` on unstaged changes destroy data that was never in an object. The habit that prevents this: commit early and often on your branch, even messily, and tidy with an interactive rebase later. Cheap commits are the actual safety net.

**Undoing a published commit** is `git revert`, which creates a new commit inverting the change. It's the only correct move on a shared branch, because it doesn't rewrite history. `git reset` is for local, unpushed work. Reverting a merge commit needs `-m 1` to say which parent is the mainline, and re-merging that branch later behaves surprisingly — revert the revert rather than re-merging.

**`git bisect`** finds the commit that introduced a regression by binary search: mark a known-good and known-bad commit, and Git checks out midpoints for you to test. Twelve steps covers 4,000 commits. `git bisect run ./script.sh` automates it entirely if you can write a script that exits non-zero on the bug — this is the single highest-leverage Git command most engineers never use, and it's why linear history and commits that individually build are worth having.

Two more worth knowing: `git stash` for parking work when you need to jump branches (and `git stash list` for the ones you forgot), and `git cherry-pick` for lifting a single commit onto another branch — the standard way to get a hotfix onto both a release branch and `main`.

## Why it matters

Deep-dive interviews sometimes probe with "tell me about a time you broke something" — and "I reverted, then bisected to find the actual cause" is a much better answer than a story about a lost afternoon. Day to day, knowing revert-versus-reset is what stops a production rollback from becoming a second incident.

## Key points

- The reflog records every `HEAD` movement, so committed work survives bad rebases, resets, and deleted branches.
- Uncommitted changes are the genuinely destroyable thing — commit often, tidy later.
- Use `revert` on anything already pushed and `reset` only on local history.
- Reverting a merge requires `-m` to pick the mainline parent, and complicates re-merging that branch later.
- `git bisect run` automates finding a regression by binary search over history.
- `cherry-pick` is how a hotfix lands on both a release branch and `main`.
- `--force-with-lease` fails safely when the remote has moved; plain `--force` overwrites someone's work.
