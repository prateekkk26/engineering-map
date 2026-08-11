---
title: Flaky Tests & Determinism
summary: Why tests fail intermittently, the small set of root causes, and the process that keeps flake from destroying trust.
level: core
minutes: 20
order: 12
tags: [testing, reliability, ci]

related:
  - frontend/testing/testing-async-and-suspense
  - frontend/testing/e2e-with-playwright
  - frontend/testing/frontend-tests-in-ci

resources:
  - title: Flaky tests
    url: https://playwright.dev/docs/test-retries
    source: Playwright
    type: docs
    minutes: 20
    primary: true
  - title: Eradicating Non-Determinism in Tests
    url: https://martinfowler.com/articles/nonDeterminism.html
    source: Martin Fowler
    type: article
    minutes: 25
  - title: Fake timers
    url: https://vitest.dev/api/vi.html#vi-usefaketimers
    source: Vitest
    type: docs
    minutes: 15
---

## In one line

A test that fails sometimes is worse than no test, because it teaches the team that red means "run it again" — and the causes are a short, fixable list.

## What it is

The damage is cultural before it is technical. Once re-running becomes routine, a genuine regression gets re-run too, and the suite stops functioning as a gate. That is why flake deserves treatment as a defect rather than an annoyance.

The root causes are few:

**Timing.** A fixed sleep instead of waiting for a condition, or an assertion that runs before an async update lands. The fix is polling assertions — `findBy`, `waitFor`, Playwright's auto-retrying `expect` — never a duration.

**Shared state.** Module-level variables, a database row, `localStorage`, or a mock left configured by a previous test. Failures appear only in a particular order, which is why they show up in CI's parallel run and not locally. Reset everything between tests and enable random ordering to surface the dependency deliberately.

**Real time and randomness.** `new Date()` and `Math.random()` produce tests that fail at a month boundary, in another timezone, or once in fifty runs. Fake the clock, seed the generator.

**Network and third parties.** Any test touching the real internet inherits someone else's uptime. Mock at the boundary; where an end-to-end test must be real, mock the third parties.

**Animations and transitions** cause elements to be mid-flight when a click lands. Disable them globally in the test environment.

**Resource contention** in CI — parallel workers competing for CPU — makes timing-sensitive tests fail under load and pass in isolation.

The **process** matters as much as the fixes. Quarantine a flaky test immediately so the suite stays trustworthy, but track it with an owner and a deadline rather than letting quarantine become a graveyard. Retry once in CI to distinguish flake from breakage, and record every retry — a rising retry rate is the leading indicator. Keep traces or videos from the failing attempt so diagnosis does not require reproduction.

And the underrated one: **fix or delete**. A test that has been quarantined for three months and nobody has fixed was not providing value; deleting it is honest and cheaper than pretending.

## Why it matters

Flake is the most common reason teams stop trusting their tests, and once trust is gone the suite is pure cost.

It is also a good process question in interviews — "what do you do about flaky tests?" — where quarantine-with-an-owner, retry tracking, and fix-or-delete is a more mature answer than "add a retry".

## Key points

- The real damage is that re-running becomes routine, so genuine failures get re-run too.
- Never sleep for a duration; poll for the condition you expect.
- Shared state across tests causes order-dependent failures — reset between tests and randomise order.
- Fake the clock and seed randomness so failures are reproducible.
- Mock the network at the boundary; disable animations in the test environment.
- Quarantine with an owner and a deadline; retry once in CI and track the retry rate as a signal.
- Keep traces from the failing attempt, and delete tests nobody will fix.
