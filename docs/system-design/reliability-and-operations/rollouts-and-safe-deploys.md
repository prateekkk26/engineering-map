---
title: Rollouts & Safe Deploys
summary: Shipping changes to a running system without downtime — canaries, flags, and why every migration is two deploys.
level: core
minutes: 20
order: 7
tags: [operations, deployment, migrations]

related:
  - data/schema-design-and-migrations/zero-downtime-migrations
  - system-design/architecture-decisions/migrating-a-live-system
  - system-design/reliability-and-operations/availability-slos-and-error-budgets

resources:
  - title: Automating Safe, Hands-Off Deployments
    url: https://aws.amazon.com/builders-library/automating-safe-hands-off-deployments/
    source: AWS Builders' Library
    type: article
    minutes: 35
    primary: true
  - title: Feature Toggles (aka Feature Flags)
    url: https://martinfowler.com/articles/feature-toggles.html
    source: Pete Hodgson / Martin Fowler
    type: article
    minutes: 30
  - title: BlueGreenDeployment
    url: https://martinfowler.com/bliki/BlueGreenDeployment.html
    source: Martin Fowler
    type: article
    minutes: 10
---

## In one line

Deploy to a small slice first, watch the metrics that would show harm, and keep the change reversible — which for anything touching data means expanding before you contract.

## What it is

**Rolling deploys** replace instances a few at a time. The default, and it requires that two versions run simultaneously — so every change must be backward compatible with the version it's replacing, in both directions during the window.

**Blue-green** runs two full environments and switches traffic. Instant rollback by switching back; twice the infrastructure, and shared state (the database) still has to be compatible with both.

**Canary** sends a small percentage of traffic to the new version and compares its error rate and latency against the old one, automatically, before proceeding. This is the one to name: it catches problems at 1% of users instead of 100%, and automated analysis with automatic rollback is what makes it a control rather than a ritual.

**Feature flags decouple deploy from release.** Ship the code dark, turn it on for internal users, then 1%, then everyone. Rollback becomes a config change in seconds instead of a redeploy. The discipline that's often missing: flags are temporary, and a codebase with two hundred stale flags is unreadable — every flag needs an owner and a removal date.

**Database changes are the hard part, and the rule is expand/contract.** Never make a breaking schema change in one step:

1. *Expand* — add the new column or table, nullable, with no code depending on it.
2. *Backfill* in batches, throttled, resumable.
3. *Dual-write* — new code writes both old and new, reads old.
4. *Switch reads* to the new column, verify.
5. *Contract* — stop writing the old, then drop it, once no running version needs it.

Each step ships separately and each is independently reversible. Also: adding a column with a non-null default, adding an index without `CONCURRENTLY`, or a long-running `ALTER` can lock a table and take the service down — this is one of the most common self-inflicted outages there is.

**Rollback must be planned, not improvised.** Know before shipping: what signal says to roll back, who can trigger it, and whether it's actually possible — a migration that dropped a column is not reversible, and a queue full of new-format messages is not either.

## Why it matters

The deploy is the most frequent cause of incidents in most organisations, so how you ship is a reliability property of the system, not a process detail. In interviews it comes up as "how would you roll this out?" and, in the deep-dive round, as "tell me about a migration you ran" — where expand/contract, backfill batching, and the rollback plan are exactly what the interviewer is listening for.

## Key points

- Rolling deploys mean two versions run at once, so every change must be compatible in both directions.
- Canary with automated metric comparison and automatic rollback catches harm at 1% of traffic.
- Feature flags separate deploy from release and make rollback a config change.
- Flags are temporary — give each one an owner and a removal date.
- Schema changes follow expand, backfill, dual-write, switch reads, contract — each step reversible.
- Backfills run in throttled, resumable batches, never as one statement.
- Locking DDL on a large table is a classic self-inflicted outage; build indexes concurrently.
- Decide the rollback trigger and verify rollback is possible *before* shipping.
