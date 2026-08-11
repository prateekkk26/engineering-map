---
title: Frontend Tests in CI
summary: Running the suite on every change fast enough that nobody routes around it, with failures that are diagnosable remotely.
level: core
minutes: 20
order: 13
tags: [testing, ci, tooling]

related:
  - frontend/tooling/ci-cd-for-frontend
  - frontend/testing/flaky-tests-and-determinism
  - frontend/performance/performance-budgets-in-ci

resources:
  - title: Running tests in CI
    url: https://playwright.dev/docs/ci
    source: Playwright
    type: docs
    minutes: 20
    primary: true
  - title: actions/cache
    url: https://github.com/actions/cache
    source: GitHub
    type: repo
  - title: Turborepo — Caching
    url: https://turborepo.com/docs/crafting-your-repository/caching
    source: Turborepo
    type: docs
    minutes: 20
---

## In one line

CI feedback under ten minutes gets used; over thirty gets bypassed — so the engineering is mostly about staging the work and not repeating it.

## What it is

**Stage by cost.** Lint, format and type-check first — they finish in a couple of minutes and catch a real fraction of problems. Then unit and integration tests. Then end-to-end and visual, which are the expensive tier. Failing fast on the cheap stages means most bad pull requests never reach the slow ones.

**Do not repeat work.** Cache the dependency install keyed on the lockfile. Cache build output — Turborepo or Nx with remote caching means an unchanged package is not rebuilt or retested at all, which on a monorepo is the single biggest saving available. Run only what a change affects, using the task graph rather than a hand-maintained path filter.

**Parallelise deliberately.** Shard the end-to-end suite across workers; Playwright's sharding is a flag. Run independent jobs concurrently rather than in a chain. The limit is usually cost, so measure whether more workers actually reduces wall-clock time before adding them.

**Make failures diagnosable without reproduction.** This is where most CI setups fall short. Upload Playwright traces, screenshots and videos from failures. Publish a test report rather than making people read raw logs. Include the seed if ordering is randomised. A failure that requires a local reproduction to understand costs an hour; one with a trace costs five minutes.

**Retry once, and count it.** One retry distinguishes flake from breakage, and recording retry rate per test turns flake into a tracked metric rather than folklore. Retrying more than once hides real intermittent bugs.

**Gate on the right things.** Type errors, test failures, lint errors, and a bundle-size budget should block a merge. Coverage thresholds are a weaker signal and, set too high, encourage tests written to satisfy the number.

Two more that matter in practice. **Preview deployments** per pull request give reviewers something to click and let end-to-end tests run against a realistic environment. And **keep CI reproducible locally** — the same commands, the same container where possible — because "passes locally, fails in CI" with no way to reproduce is the worst debugging position there is.

## Why it matters

CI is where the testing investment either pays off or becomes an obstacle, and slow or noisy pipelines get worked around — with merge-queue bypasses, skipped tests, and eventually a suite nobody runs.

The affected-only and caching techniques are also standard monorepo knowledge that JDs assume.

## Key points

- Stage cheap checks first so most failures surface in the first two minutes.
- Cache installs on the lockfile and build outputs remotely; run only what the change affects.
- Shard end-to-end tests and run independent jobs concurrently, measuring the actual wall-clock gain.
- Upload traces, screenshots, and reports so failures are diagnosable without local reproduction.
- Retry once to separate flake from breakage, and track the retry rate.
- Block merges on type, test, lint, and bundle-size failures; treat coverage thresholds sceptically.
- Provide preview deployments and keep the CI commands reproducible locally.
