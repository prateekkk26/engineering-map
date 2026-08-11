---
title: Large-Scale Migrations
summary: Moving a live codebase from one framework, library or pattern to another without a rewrite and without stopping feature work.
level: deep
minutes: 25
order: 15
tags: [architecture, migration, process]

related:
  - frontend/nextjs/migrating-pages-to-app-router
  - frontend/architecture/feature-flags-and-progressive-delivery
  - frontend/architecture/versioning-shared-ui

resources:
  - title: Strangler Fig Application
    url: https://martinfowler.com/bliki/StranglerFigApplication.html
    source: Martin Fowler
    type: article
    minutes: 15
    primary: true
  - title: jscodeshift
    url: https://github.com/facebook/jscodeshift
    source: Meta
    type: repo
  - title: Codemods
    url: https://nextjs.org/docs/app/guides/upgrading/codemods
    source: Next.js
    type: docs
    minutes: 20
---

## In one line

The big rewrite fails for the same reasons every time, so migration is incremental by construction: both systems run, new work goes to the new one, and the old one shrinks.

## What it is

**Why rewrites fail** is well documented and worth being able to state: they take longer than estimated, feature work either stops or has to be done twice, the new system reaches parity just as requirements have moved, and there is no point at which the value is partially realised — it is all or nothing, and the nothing is common.

**The strangler fig** is the alternative. Put a routing layer in front, migrate one route or one feature at a time, and let the old system shrink until it can be deleted. Every step is shippable and independently valuable, and the work can pause without leaving a half-finished rewrite.

**Sequencing** matters more than speed. Start with something low-traffic to shake out the build, deploy and monitoring path — the first migration is mostly infrastructure. Move shared layout and providers early, since everything depends on them. Then take the highest-value surfaces, and leave the most complex and least-touched for last: a rarely-modified legacy page may be worth leaving indefinitely.

**Codemods do the mechanical part.** jscodeshift or ts-morph turn a hundred-file rename into a reviewable commit. The rule is to spend the time on the transform when the change is repetitive and large — and to accept that the last 10% is manual, because codemods are pattern matchers, not compilers.

**Prevent backsliding.** A lint rule that forbids importing the old thing in new code is what stops the migration from being a moving target. Without it, the old pattern keeps growing while you migrate it.

**Make progress visible.** A dashboard counting files or routes on each side turns "still going" into a number, which is what sustains organisational support past the first month.

Two more that decide whether it lands. **Both systems must coexist in production**, which usually means shared authentication, consistent styling, and navigation that crosses the boundary without a full reload feeling broken. And **feature flags** let a migrated route be switched on for 1% of traffic and off instantly, which converts a risky cutover into a monitored rollout.

The judgement to keep: know what you are buying. A migration with no measurable benefit — no performance win, no velocity gain, no capability unlocked — is not worth the quarter it costs, however much nicer the new stack is.

## Why it matters

Most companies hiring senior frontend engineers have a migration in flight — Pages to App Router, CSS-in-JS to something zero-runtime, Redux to something smaller — and it is a routine JD line.

It is also a strong staff-level interview topic, where the expected answer is incremental strategy, codemods, enforcement, and visible progress rather than a technical comparison of the two stacks.

## Key points

- Rewrites fail because value arrives only at the end; strangler-fig migration is shippable at every step.
- Route a low-traffic surface first to prove the build and deploy path, then shared layout, then value.
- Leave rarely-touched legacy surfaces for last — some are worth never migrating.
- Codemods make repetitive changes reviewable; expect the last stretch to be manual.
- Add a lint rule forbidding the old pattern in new code, or the target keeps moving.
- Publish a progress metric to sustain support beyond the first month.
- Coexistence needs shared auth, styling, and navigation; flags turn cutover into a monitored rollout.
- Be able to name the benefit — a migration with no measurable payoff is not worth the quarter.
