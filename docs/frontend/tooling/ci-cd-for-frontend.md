---
title: CI/CD for Frontend
summary: The pipeline from pull request to production — checks, previews, deployment strategy, and getting back out safely.
level: core
minutes: 25
order: 9
tags: [tooling, ci, deployment]

related:
  - frontend/testing/frontend-tests-in-ci
  - frontend/architecture/feature-flags-and-progressive-delivery
  - frontend/performance/performance-budgets-in-ci

resources:
  - title: GitHub Actions
    url: https://docs.github.com/en/actions
    source: GitHub
    type: docs
    minutes: 30
    primary: true
  - title: Deploying
    url: https://nextjs.org/docs/app/getting-started/deploying
    source: Next.js
    type: docs
    minutes: 20
  - title: Turborepo — Caching
    url: https://turborepo.com/docs/crafting-your-repository/caching
    source: Turborepo
    type: docs
    minutes: 20
---

## In one line

A frontend pipeline should give a reviewable preview and a confident answer in under ten minutes, and make going back as easy as going forward.

## What it is

**The PR pipeline**, staged by cost: format and lint, then type-check, then unit and integration tests, then a build, then end-to-end and visual against a preview deployment. Failing fast on the cheap stages means most problems surface in two minutes rather than twenty.

**Preview deployments per pull request** are the single highest-value piece. A URL a reviewer, designer or PM can click changes review from reading a diff to using the change, and it gives end-to-end tests a realistic target. Every modern host provides them.

**Deployment strategy** for a frontend is unusually forgiving, because static assets are immutable and content-hashed: publishing a new version is uploading new files and pointing the entry HTML at them. That makes **atomic deploys** natural — nothing is half-updated — and **instant rollback** a matter of repointing.

The strategies worth naming: **blue-green** keeps two environments and switches traffic; **canary** sends a small percentage to the new version while watching error rates; **progressive rollout** widens that percentage over time. For a frontend, canary plus feature flags covers most needs, and flags decouple release from deploy entirely — which is the more valuable half.

**The frontend-specific deploy hazard** is the version skew problem: a user with an old page requests a chunk that the new deploy removed. Keep old assets available for a window rather than deleting on deploy, and handle chunk-load failure by prompting a reload.

**Gates that should block a merge**: type errors, failing tests, lint errors, and a bundle-size budget. **Gates that should block a production deploy**: a passing smoke test against the deployed artifact, and a check that the environment configuration is present — a missing environment variable discovered at runtime is a common and avoidable outage.

**After deploy**, watch the signals that indicate a bad release: error rate, Core Web Vitals, and the product's own conversion metric, with an automatic rollback threshold where possible. A deploy is not finished when the pipeline is green; it is finished when the metrics say it was fine.

Finally, **make CI reproducible locally** — the same commands, ideally the same container — because a failure nobody can reproduce is a failure nobody can fix.

## Why it matters

Deployment frequency and lead time are the standard measures of engineering effectiveness, and the pipeline is what sets both.

Preview deployments in particular change the quality of review more than any other single investment.

## Key points

- Stage checks by cost so most failures appear in the first two minutes.
- Preview deployments per PR turn review from reading a diff into using the change.
- Content-hashed static assets make atomic deploys and instant rollback the natural default.
- Canary plus feature flags covers most frontend release needs; flags decouple deploy from release.
- Keep old chunks available after deploy and handle chunk-load failure with a reload prompt.
- Block merges on types, tests, lint, and bundle size; block deploys on a smoke test and config presence.
- Watch error rate, vitals, and a product metric after release, with an automatic rollback threshold.
