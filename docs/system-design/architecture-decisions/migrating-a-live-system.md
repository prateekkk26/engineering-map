---
title: Migrating a Live System
summary: Replacing something that's running and can't stop — strangler fig, dual writes, backfill, verification, and cutover you can reverse.
level: core
minutes: 25
order: 6
tags: [architecture, migration, operations]

related:
  - system-design/reliability-and-operations/rollouts-and-safe-deploys
  - data/schema-design-and-migrations/zero-downtime-migrations
  - frontend/architecture/large-scale-migrations

resources:
  - title: StranglerFigApplication
    url: https://martinfowler.com/bliki/StranglerFigApplication.html
    source: Martin Fowler
    type: article
    minutes: 15
    primary: true
  - title: Online Migrations at Scale
    url: https://stripe.com/blog/online-migrations
    source: Stripe
    type: article
    minutes: 25
  - title: BranchByAbstraction
    url: https://martinfowler.com/bliki/BranchByAbstraction.html
    source: Martin Fowler
    type: article
    minutes: 10
---

## In one line

Never big-bang a running system: put a seam in front of the old thing, move traffic through it a slice at a time, verify continuously, and keep rollback one flag away until the end.

## What it is

**The strangler fig.** Put a facade in front of the existing system, route everything through it, then implement one capability at a time in the new system and switch that route. The old system shrinks until nothing is left. It takes longer than a rewrite and it works, which the rewrite typically doesn't — a full parallel rebuild has to catch up with two years of accumulated behaviour *and* whatever ships during the rebuild, which is the classic doomed project.

**Data migration, in order.** *Dual write* — write to both stores, read from the old. *Backfill* — copy history in throttled, resumable batches with a durable cursor, monitoring the source database's load. *Verify* — compare old and new continuously on a sample, and reconcile the discrepancies you find (there will be some, and they're where the real bugs are). *Shadow read* — read from both, serve the old, and log differences. *Switch reads* to the new store, still dual-writing. *Stop writing to the old*, then remove it — usually weeks later, once you're sure.

Each step ships independently, each is reversible, and the whole thing is `expand → migrate → contract` at system scale.

**Shadow traffic is the highest-value technique here.** Send real production requests to the new system without using its responses, and diff. It surfaces the behaviour the specification didn't mention — the edge cases, the accidental features people depend on, the timezone bug — before any user is exposed. Watch for side effects: a shadowed system must not send emails or charge cards.

**Cut over gradually, by a dimension.** 1% of traffic, then 10, then 50. Or by tenant, starting with internal accounts, then small ones. Or by geography. Whatever you choose, you need a per-request kill switch and a defined rollback trigger — the error rate or latency threshold that means "go back" — decided *before* the cutover, not argued about during it.

**Delete the old path.** Migrations that stall at 95% are the norm: the last few callers are awkward, the team moves on, and you now maintain two systems forever with the reconciliation cost of both. Budget the finish explicitly, track remaining callers as a number, and treat removing the old code as part of the project rather than cleanup.

**Communicate.** Anything with an external contract — an API, an event schema, a URL structure — needs a deprecation window, migration docs, and a list of who's still on the old path. That work is usually larger than the technical migration.

## Why it matters

Senior engineers spend far more time changing systems than creating them, and the deep-dive round frequently lands on "tell me about a migration you ran." The answer that scores names the strangler pattern, the dual-write and backfill sequence, shadow verification, gradual cutover, and — the part most people forget — how the old system finally got deleted.

## Key points

- Put a facade in front of the old system and migrate capability by capability; avoid full rewrites.
- Data order: dual write, backfill in resumable batches, verify, shadow read, switch reads, stop dual writing.
- Backfills must be throttled and resumable, and monitored against the source database's load.
- Shadow traffic surfaces undocumented behaviour before users are exposed — suppress side effects.
- Cut over by percentage, tenant or region, with a kill switch and a pre-agreed rollback trigger.
- Reconcile discrepancies during verification; that's where the real bugs are found.
- Budget and track the deletion of the old path — stalled migrations cost double forever.
- External contracts need a deprecation window and a list of remaining callers.
