---
title: The Git mental model
summary: Git stores immutable snapshots in a DAG and moves labels around them, which explains almost every command you find confusing.
level: core
minutes: 25
order: 1
tags: [git, fundamentals]

related:
  - practices/version-control/merge-rebase-and-history
  - practices/version-control/recovering-from-git-mistakes

resources:
  - title: Pro Git — Git Internals
    url: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
    source: git-scm
    type: docs
    minutes: 25
    primary: true
  - title: Git from the inside out
    url: https://maryrosecook.com/blog/post/git-from-the-inside-out
    source: Mary Rose Cook
    type: article
    minutes: 45
  - title: Pro Git — Branches in a Nutshell
    url: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell
    source: git-scm
    type: docs
    minutes: 15
---

## In one line

A commit is an immutable snapshot pointing at its parents, a branch is just a movable label on one of those commits, and every Git operation is either creating snapshots or moving labels.

## What it is

Git has four object types, all content-addressed by the SHA of their contents. A **blob** is file contents. A **tree** is a directory listing of blobs and other trees. A **commit** points at one tree plus zero or more parent commits, with author and message attached. A **tag** points at a commit with a name. Because a commit's hash covers its tree *and* its parents, changing anything about history necessarily produces new hashes for everything downstream — this is why rewriting history is never in-place.

Commits form a directed acyclic graph. A **branch** is a 40-character file under `.git/refs/heads/` containing one commit hash — nothing more. `HEAD` is a pointer to the branch you're on. Committing writes a new commit whose parent is the current one, then advances the branch label. Merging creates a commit with two parents. Rebasing *copies* commits onto a new base and moves the label, leaving the originals orphaned until garbage collection.

Between your editor and the repository sit two more places: the **working tree** (actual files on disk), and the **index** — the staging area, which is a proposed next tree. `git add` copies working-tree content into the index; `git commit` turns the index into a tree object and a commit. Most confusion about `reset` dissolves once you see it as choosing how many of those three to move: `--soft` moves only the branch, `--mixed` also resets the index, `--hard` also overwrites the working tree.

Remotes are just other repositories with their own refs. `origin/main` is a local cache of where `main` was on the remote last time you talked to it; `fetch` updates that cache and touches nothing else, while `pull` is `fetch` plus a merge or rebase. Separating those two is what makes "my branch diverged" legible instead of scary.

## Why it matters

Deep-dive rounds don't ask you to recite Git internals, but they do ask what you did when a rebase went wrong or how you'd untangle a shared branch — and the answers are trivially derivable from the model and pure memorisation without it. The graph model is also what makes `reflog`, `bisect`, and `cherry-pick` obvious tools rather than incantations.

## Key points

- Commits are immutable snapshots, not diffs; Git computes diffs on demand between two trees.
- A branch is a movable pointer to a commit, so creating and deleting branches is nearly free.
- Rewriting history always creates new commit objects, because the hash covers the parent chain.
- The index is a real third state between working tree and repository, and `reset` is best understood as choosing which of the three to move.
- `origin/main` is a local cache of a remote ref, which is why `fetch` and `pull` behave differently.
- Nothing you commit is lost by moving labels — the old commits remain reachable through the reflog until garbage collection.
- Detached `HEAD` just means `HEAD` points directly at a commit instead of at a branch label.
