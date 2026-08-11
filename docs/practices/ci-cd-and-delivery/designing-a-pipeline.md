---
title: Designing a pipeline
summary: Order stages so the cheapest checks fail first, cache and parallelise aggressively, and treat pipeline duration as a product metric.
level: core
minutes: 22
order: 2
tags: [ci, delivery, performance]

related:
  - practices/ci-cd-and-delivery/continuous-integration-in-practice
  - frontend/testing/frontend-tests-in-ci
  - practices/team-workflow/measuring-delivery-and-devex

resources:
  - title: Deployment Pipeline
    url: https://martinfowler.com/bliki/DeploymentPipeline.html
    source: Martin Fowler
    type: article
    minutes: 12
    primary: true
  - title: Caching dependencies to speed up workflows
    url: https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows
    source: GitHub
    type: docs
    minutes: 15
  - title: The Practical Test Pyramid
    url: https://martinfowler.com/articles/practical-test-pyramid.html
    source: Ham Vocke
    type: article
    minutes: 45
---

## In one line

A pipeline is a sequence of increasingly expensive gates, and its design goal is to tell you "this is broken" as early and as cheaply as possible.

## What it is

The shape almost every good pipeline converges on: **fast feedback stage** (lint, typecheck, unit tests — under five minutes, runs on every push), then **integration** (service-level tests, a real database in a container, contract tests), then **build and package** an immutable artifact, then **deploy to a staging or preview environment**, then **end-to-end tests** against it, then production. Each stage runs only if the previous passed, so the expensive stuff never runs on a change that fails a typecheck.

**Speed is the whole game**, because pipeline duration sets the cost of every change and therefore how big changes get. The levers, in rough order of payoff: cache dependencies and build outputs keyed on lockfile hashes; parallelise independent jobs and shard the slow test suite across runners; run only what the change affects — in a monorepo this means task graph tools (Turborepo, Nx, Bazel) that skip untouched packages; and move genuinely slow things (full e2e matrices, visual regression, performance budgets) off the PR path to a post-merge or nightly run, accepting that a regression is then found in an hour instead of a minute.

**The artifact is built once.** Build, tag it with the commit SHA, and promote that same artifact through environments. Rebuilding per environment means the thing you tested is not the thing you shipped — and it makes environment-specific bugs impossible to reason about. Configuration comes from the environment at deploy time, not from a build variant.

Two things quietly ruin pipelines. **Flakiness**: a suite that fails 2% of the time by chance fails most PRs at scale, teams learn to hit re-run, and real failures get re-run too. Quarantine flaky tests with a deadline rather than tolerating them. And **secrets sprawl**: pipelines are a favourite supply-chain target, so pin third-party actions to a SHA, scope tokens to the minimum, and never expose secrets to workflows triggered by forked PRs.

Worth measuring: pipeline duration at the median and p95, failure rate split by real-versus-flaky, and time-to-green after a red trunk.

## Why it matters

"Walk me through what happens when you open a PR" is a standard deep-dive question, and the answer reveals whether you've built a pipeline or inherited one. Practically, a 40-minute pipeline is one of the most expensive things a team can own — it directly inflates batch size, review latency, and time to recover from an incident.

## Key points

- Order stages cheapest-first so expensive jobs never run on changes that fail a lint or typecheck.
- Cache dependencies and build outputs keyed on lockfile hashes; parallelise and shard slow suites.
- In a monorepo, run only the tasks affected by the change rather than everything.
- Build the artifact once and promote the identical artifact through environments.
- Configuration is injected per environment at deploy time, never baked into the build.
- Move genuinely slow checks off the PR path, accepting a later signal in exchange for fast merges.
- Flaky tests are a pipeline defect: quarantine with a deadline, don't normalise re-running.
- Pin third-party CI actions by SHA and keep secrets out of workflows triggered by forks.
