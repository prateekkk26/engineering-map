---
title: Feature Flags & Progressive Delivery
summary: Separating deploy from release — flag types, evaluation on the server versus the client, and paying down flag debt.
level: core
minutes: 25
order: 14
tags: [architecture, delivery, flags]

related:
  - frontend/architecture/large-scale-migrations
  - frontend/tooling/ci-cd-for-frontend
  - frontend/architecture/theming-and-multi-tenant-ui

resources:
  - title: Feature Toggles
    url: https://martinfowler.com/articles/feature-toggles.html
    source: Pete Hodgson, martinfowler.com
    type: article
    minutes: 35
    primary: true
  - title: OpenFeature
    url: https://openfeature.dev/docs/reference/intro
    source: OpenFeature
    type: docs
    minutes: 20
  - title: Trunk-based development
    url: https://trunkbaseddevelopment.com/
    source: trunkbaseddevelopment.com
    type: docs
    minutes: 25
---

## In one line

A flag decouples shipping code from turning it on, which is what makes trunk-based development, gradual rollout, and instant rollback possible — and what creates a debt you must actively repay.

## What it is

Four kinds, with different lifetimes, and conflating them is the root of most flag mess. **Release toggles** hide unfinished work and live days to weeks. **Experiment toggles** split traffic for an A/B test and live for the experiment. **Ops toggles** are kill switches for expensive or risky features and live indefinitely. **Permission toggles** gate by plan or entitlement and are really product configuration, not flags.

The delivery payoff is real: merge to main behind a flag instead of maintaining a long-lived branch, roll out to 1% then 10% then everyone while watching error rates, and turn a bad release off in seconds rather than reverting and redeploying.

**Where the flag is evaluated is the frontend-specific decision.** Client-side evaluation is simple and produces a flash of the wrong variant plus a bundle containing both code paths — and anyone can read the flag names and often flip them locally. Server-side evaluation avoids the flash and keeps unreleased code out of the client, which matters when the feature is confidential. In an App Router app, evaluating in `proxy.ts` or a server component and rendering only the chosen branch is the clean answer, at the cost of making the route dynamic.

**Flags never make something secure.** Hiding a button does not protect the endpoint behind it — authorisation is separate and still required.

**Flag debt is the recurring failure.** Every flag is a branch, and n flags are 2ⁿ potential states, of which you test maybe two. Mitigations that work: put an owner and an expiry date on every flag at creation, fail the build or open a ticket when one is stale, and treat removing a flag as part of finishing the feature rather than a follow-up nobody does.

Two practical notes. **Test the flagged-on path in CI**, not just the current default, or the feature is unverified until launch. And **make evaluation consistent per user** — a flag that flips between requests produces an incoherent experience and unusable experiment data.

## Why it matters

Progressive delivery is standard practice at these companies, and JDs list it directly. It is also the mechanism behind safe large-scale migration.

The interview angle is usually flag debt: anyone can add a flag, and knowing how to remove them is the senior half.

## Key points

- Distinguish release, experiment, ops, and permission toggles — they have different lifetimes and owners.
- Flags decouple deploy from release, enabling trunk-based development, gradual rollout, and instant rollback.
- Client-side evaluation flashes the wrong variant and ships both code paths; server-side avoids both.
- Evaluating in `proxy.ts` or a server component keeps unreleased code off the client, at the cost of dynamic rendering.
- A flag is not a security control — authorise the endpoint regardless.
- Every flag needs an owner and an expiry; stale flags should fail a check, not linger.
- Test the flagged-on path in CI and keep evaluation consistent per user.
