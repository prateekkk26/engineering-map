---
title: Branching strategies
summary: Trunk-based development with short-lived branches beats Git Flow for most product teams, and you should be able to say why.
level: core
minutes: 20
order: 2
tags: [git, delivery, process]

related:
  - practices/ci-cd-and-delivery/continuous-integration-in-practice
  - practices/team-workflow/shipping-incrementally
  - practices/version-control/merge-rebase-and-history

resources:
  - title: Patterns for Managing Source Code Branches
    url: https://martinfowler.com/articles/branching-patterns.html
    source: Martin Fowler
    type: article
    minutes: 60
    primary: true
  - title: Trunk Based Development
    url: https://trunkbaseddevelopment.com/
    source: Paul Hammant
    type: docs
    minutes: 25
  - title: Comparing Git workflows
    url: https://www.atlassian.com/git/tutorials/comparing-workflows
    source: Atlassian
    type: article
    minutes: 20
---

## In one line

The only variable that really matters is how long a branch lives before it merges back, and every named workflow is a different answer to that.

## What it is

**Trunk-based development** means everyone integrates into `main` at least daily. Branches exist, but they live hours to a couple of days, and anything unfinished hides behind a feature flag rather than behind an unmerged branch. `main` is always releasable; releases are cut from it, or `main` deploys continuously.

**Git Flow** adds long-lived `develop`, `release/*`, and `hotfix/*` branches on top of feature branches. It was designed in 2010 for versioned desktop software shipping on a schedule with multiple supported versions in the field. That context matters: if you ship a web app continuously, most of its machinery is overhead, and its own author has since said as much. **GitHub Flow** is the middle ground most teams actually run — branch from `main`, open a PR, merge on green, deploy.

The cost of a long-lived branch is not merge conflicts as such, it's **integration risk stacking up invisibly**. Two people refactoring the same area for three weeks each have working code and a broken combination, and nobody finds out until the end. Short branches convert one large, badly-timed integration into many small, cheap ones. This is the actual claim of continuous integration, and branching strategy is downstream of it.

The reason teams reach for long branches is usually that something else is broken: releases are risky, so changes are batched; or the codebase can't tolerate half-finished work in `main`, because there are no flags. Fix those and short branches become the natural choice rather than a discipline you have to enforce.

Release branches still earn their place in two cases: shipping software you can't update centrally (mobile binaries, on-prem, SDKs), and supporting multiple versions at once. Say that explicitly rather than treating trunk-based as universal.

## Why it matters

"How does your team branch and release?" is a standard hiring-manager question, and a flat "we use Git Flow" answer with no reasoning reads as inherited habit. The senior version names the tradeoff — integration frequency versus release isolation — and ties it to whether the product can be flagged and deployed continuously.

## Key points

- Branch lifetime is the variable that matters; naming conventions are cosmetic by comparison.
- Trunk-based development keeps `main` releasable and hides unfinished work behind flags, not behind unmerged branches.
- Git Flow was designed for versioned, scheduled releases and is usually overhead for a continuously deployed web app.
- Long-lived branches accumulate integration risk silently — the pain arrives all at once at merge time.
- Feature flags are the enabling technology for short branches; without them, teams are forced into batching.
- Release branches genuinely earn their keep for mobile binaries, on-prem installs, and multi-version support.
- Requiring a green pipeline on `main` is what makes any of these strategies safe, regardless of which you pick.
