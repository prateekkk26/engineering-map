---
title: Deploying safely in practice
summary: Small, frequent, reversible deploys with a rollback you have actually tested beat any amount of pre-release ceremony.
level: core
minutes: 22
order: 5
tags: [delivery, reliability, operations]

related:
  - system-design/reliability-and-operations/rollouts-and-safe-deploys
  - practices/incident-response/mitigate-before-you-diagnose
  - data/schema-design-and-migrations/zero-downtime-migrations

resources:
  - title: Google SRE Book — Release Engineering
    url: https://sre.google/sre-book/release-engineering/
    source: Google SRE
    type: docs
    minutes: 30
    primary: true
  - title: Feature Toggles (aka Feature Flags)
    url: https://martinfowler.com/articles/feature-toggles.html
    source: Pete Hodgson
    type: article
    minutes: 40
  - title: Canary Release
    url: https://martinfowler.com/bliki/CanaryRelease.html
    source: Martin Fowler
    type: article
    minutes: 8
---

## In one line

Deploy is a technical event and release is a product decision, and separating them with flags is what makes shipping boring.

## What it is

The design constraints of a system-level rollout — canary, blue/green, progressive delivery — are covered in `system-design`. What's here is the team-level version: the checklist and the habits that determine whether a Tuesday afternoon deploy is uneventful.

**Separate deploy from release.** Code goes to production dark, behind a flag, and is turned on separately — for internal users first, then a percentage, then everyone. This means the risky moment (turning it on) is instant and instantly reversible, unlike a deploy, and it decouples shipping from the marketing calendar. The cost is flag debt: every flag is a branch in the code and a combination to reason about, so each one gets an owner and a removal date, and stale flags are deleted aggressively.

**The rollback has to be real.** "We can roll back" is worth nothing until it's been done recently and timed. Two things routinely make it false: a database migration that isn't backwards-compatible with the previous version (fix with expand/migrate/contract — deploy the schema change and the code change separately, in that order), and caches or client bundles that persist after the server reverts. Decide rollback *triggers* before deploying — which metric, at what threshold, for how long — because deciding while an error rate is climbing produces hesitation.

**Deploy small and often.** A deploy containing one change has an obvious culprit when the graphs move; a deploy containing thirty is an investigation. This is the direct link between deployment frequency and mean time to recovery, and it's why deploying more often makes systems safer rather than riskier.

The practical checklist before merging something risky: is it behind a flag; is the migration backwards-compatible; can it be rolled back without data loss; what metric will show it's wrong; who's around for the next hour. And afterwards: watch the thing you said you'd watch, for the period you said, before moving on. Deploying at 5pm on Friday is a joke with a real point behind it — deploy when the people who understand the change are awake.

## Why it matters

Deep-dive rounds go here fast: "how did that get to production, and what happened when it broke?" A candidate who describes flags, a tested rollback path, and predefined triggers is describing a system they've operated. It's also the single largest lever on incident duration.

## Key points

- Deploy (code in production) and release (users see it) are separate events; flags are the separation mechanism.
- Progressive exposure — internal, then a percentage, then all — makes the risky step instantly reversible.
- Every flag needs an owner and a removal date, or flag combinations become their own complexity problem.
- A rollback path is hypothetical until it's been exercised and timed.
- Backwards-incompatible migrations break rollback; expand/migrate/contract preserves it.
- Define rollback triggers and thresholds before deploying, not while the graph is moving.
- Frequent small deploys shorten recovery because the culprit is obvious.
- Stay and watch the metric you named after deploying, for the window you named.
