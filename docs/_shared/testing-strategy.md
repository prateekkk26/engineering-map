---
title: Testing Strategy
summary: Choosing what to test at which level, so the suite catches real breakage without becoming the thing that slows you down.
level: core
minutes: 25
tags: [testing, quality, delivery]

surfaced_in:
  - frontend/testing
  - practices/quality-and-tech-debt
  - practices/ci-cd-and-delivery

related:
  - frontend/testing/frontend-testing-strategy
  - practices/quality-and-tech-debt/refactoring-safely
  - practices/ci-cd-and-delivery/continuous-integration-in-practice

resources:
  - title: The Practical Test Pyramid
    url: https://martinfowler.com/articles/practical-test-pyramid.html
    source: Martin Fowler
    type: article
    minutes: 40
    primary: true
  - title: Test Sizes
    url: https://testing.googleblog.com/2010/12/test-sizes.html
    source: Google Testing Blog
    type: article
    minutes: 10
  - title: Test Double
    url: https://martinfowler.com/bliki/TestDouble.html
    source: Martin Fowler
    type: article
    minutes: 10
---

## In one line

A testing strategy is a set of deliberate bets about where bugs come from and what confidence is worth paying for — not a coverage number.

## What it is

The pyramid is the familiar shape: many fast tests that exercise a unit in isolation, fewer that check a slice of the system wired together, a handful that drive the whole thing end to end. What makes it useful is not the ratio but the reasoning behind it — **the further out you go, the more confidence a passing test buys and the more it costs in runtime, flakiness, and debugging distance from the failure.** The right mix is whatever puts most of your tests at the widest scope you can afford to run on every commit.

The more actionable framing is Google's: classify by **what a test is allowed to touch**, not by what you call it. A small test runs in one process, no network, no filesystem, no sleeping — so it is fast and deterministic by construction. A medium test may touch localhost and a real database. A large test may touch the network and other services. The value of the axis is that it predicts flakiness: every capability you grant a test is a way for it to fail for reasons unrelated to your code.

The central decision in any suite is **where to put the seams** — which collaborators you replace with a test double and which you keep real. Replace too much and the tests pass while the system is broken, because you have tested your mocks. Replace too little and every test is slow and coupled to infrastructure. The useful heuristic: fake what you don't own and can't run (a payment provider, a model API), keep real what you do own and can run cheaply (your own modules, a local database, an in-memory queue). Contract tests cover the gap left behind — see `_shared/api-contracts`.

Two rules keep a suite alive over years. **Test behaviour, not structure**: a test that breaks when you rename a private method is a tax on refactoring, and refactoring is the thing tests are supposed to make safe. And **a flaky test is worse than no test** — it trains the team to re-run red builds, which is the same as having no signal at all. Quarantine or delete it the day it appears.

Coverage percentage is the metric everyone reaches for and the one worth least: it measures lines executed, not assertions made, and optimising it produces tests that call code without checking anything. Use it to find untested areas, never as a target.

## Why it matters

Every practical round and take-home is silently graded on this — what you chose to test in limited time says more about your judgement than the code does. In the deep dive, "how did you know it worked?" and "what did you do about flaky tests?" are standard, and "we had 90% coverage" is a weak answer next to "the risky part was the payment path, so that's where the integration tests were."

## Key points

- Pick the level by what confidence it buys against what it costs to run and to debug, not by a fixed ratio.
- Classify tests by what they're allowed to touch — process, disk, network — because that predicts flakiness.
- Fake what you don't own and can't run; keep real what you own and can run cheaply.
- Over-mocking produces green suites over broken systems; that's the main failure mode of unit-heavy testing.
- Test observable behaviour, not internal structure, or the suite blocks the refactoring it exists to enable.
- A flaky test destroys trust in the whole suite — quarantine or delete it immediately.
- Coverage finds gaps; it does not measure quality, and it makes a terrible target.
- Say which risk each layer of your suite is buying down — that framing is what a senior answer sounds like.
