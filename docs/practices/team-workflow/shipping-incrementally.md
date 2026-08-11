---
title: Shipping incrementally
summary: Slice work so each piece is independently valuable and deployable, and use flags to keep unfinished work in production without exposing it.
level: core
minutes: 20
order: 3
tags: [delivery, process, flags]

related:
  - practices/code-review/keeping-changes-small
  - practices/ci-cd-and-delivery/deploying-safely-in-practice
  - frontend/architecture/feature-flags-and-progressive-delivery

resources:
  - title: Feature Toggles (aka Feature Flags)
    url: https://martinfowler.com/articles/feature-toggles.html
    source: Pete Hodgson
    type: article
    minutes: 40
    primary: true
  - title: Vertical slicing of user stories
    url: https://www.humanizingwork.com/the-humanizing-work-guide-to-splitting-user-stories/
    source: Humanizing Work
    type: article
    minutes: 20
  - title: Walking Skeleton
    url: https://wiki.c2.com/?WalkingSkeleton
    source: Ward's Wiki
    type: article
    minutes: 5
---

## In one line

Slice vertically — a thin path through every layer that a user can actually use — rather than horizontally by layer, which produces three weeks of work with nothing to show.

## What it is

**Horizontal slicing** builds the schema this week, the API next week, the UI the week after. Nothing is demonstrable until the end, integration risk lands all at once, and the first real feedback arrives after the expensive decisions are locked. **Vertical slicing** takes the narrowest complete path — one entity, one happy case, no edge handling — through database, service, and interface, and ships it. Everything after that is widening.

The **walking skeleton** is the first slice of a new system: an end-to-end path that does almost nothing but is deployed, monitored, and tested through the real pipeline. It's the cheapest possible way to find out that your deployment story, auth, or cross-service call doesn't work — problems that are catastrophic to discover in week six.

Standard ways to split something that "can't be split": by user type or role, by input variation (one payment method first), happy path first and error handling after, manual before automated (an internal admin does it by hand while the automation is built), read before write, one platform before all of them, and hardcoded before configurable. Each of these produces something real that ships.

**Feature flags** are the enabling mechanism: unfinished work lives in `main`, deployed and dark. That preserves trunk-based development and continuous deployment while a feature takes three weeks. The discipline that keeps flags from becoming the next problem — every flag has an owner and an expiry, release flags are deleted within weeks of full rollout, and long-lived flags (permissions, ops kill switches, experiments) are treated as a separate, deliberate category with their own management.

The genuine cost: extra plumbing for slices that get thrown away, and interim states that are visibly incomplete. It's worth it because the compounding benefit is **feedback** — the second slice is informed by real usage of the first, which is the mechanism by which you avoid building the wrong thing thoroughly.

## Why it matters

The take-home and practical rounds reward visible incremental delivery — a working narrow thing beats a half-built broad thing every time. And "how would you ship this in stages?" is a standard follow-up in frontend system design, where the expected answer is flags plus vertical slices, not a big-bang launch.

## Key points

- Slice vertically through all layers so each piece is usable and deployable on its own.
- Horizontal, layer-by-layer work hides integration risk and delays all feedback to the end.
- A walking skeleton proves the pipeline, deploy, and integration path before the feature exists.
- Split by user type, input variation, happy path, read-before-write, or manual-before-automated.
- Manual first is a legitimate first slice; automate once the behaviour is proven.
- Feature flags let incomplete work sit in `main` and keep trunk-based development viable.
- Release flags need an owner and an expiry; permission and kill-switch flags are a separate category.
- The compounding return is feedback — each slice informs the design of the next.
