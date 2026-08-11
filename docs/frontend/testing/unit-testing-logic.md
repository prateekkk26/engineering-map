---
title: Unit Testing Logic
summary: The parts of a frontend that genuinely deserve unit tests, and how to write them so they survive refactoring.
level: core
minutes: 20
order: 2
tags: [testing, unit, vitest]

related:
  - frontend/testing/frontend-testing-strategy
  - frontend/testing/test-data-and-factories
  - frontend/react/usereducer-and-ui-state-machines

resources:
  - title: Vitest
    url: https://vitest.dev/guide/
    source: Vitest
    type: docs
    minutes: 25
    primary: true
  - title: Jest
    url: https://jestjs.io/docs/getting-started
    source: Jest
    type: docs
    minutes: 25
  - title: fast-check
    url: https://fast-check.dev/
    source: fast-check
    type: docs
    minutes: 25
---

## In one line

Unit tests earn their place where logic is genuinely branchy and independent of the DOM — reducers, formatters, validators, algorithms — and nowhere else.

## What it is

The good candidates share a shape: pure, deterministic, with enough branches that enumerating them by hand through the UI would be tedious. A **reducer** is the ideal case — given a state and an action, assert the next state, with no rendering involved. Date and currency **formatters**, **validation rules**, **sorting and filtering**, and any real **algorithm** are the same.

Everything else on the frontend is usually better covered by an integration test, because a unit test of a component tends to assert what the component does rather than what the user gets.

**Write against behaviour, not structure.** Test the exported function, not the private helper it calls. Assert the returned value, not the number of times an internal function ran. The rule of thumb: if a pure refactor breaks the test, the test was measuring the wrong thing.

**Cover the edges, since that is the whole reason for the test.** Empty input, one item, many, boundary values, negative numbers, `null` and `undefined`, unicode and emoji in strings, timezone boundaries in dates. The happy path is rarely where the bug is.

**Table-driven tests** — `it.each` — express those cases compactly and make an added case a one-line diff, which is what keeps edge coverage growing over time.

**Determinism** is a hard requirement and has two usual violations. `Date.now()` and `new Date()` need fake timers or an injected clock, or the test passes until December. And `Math.random()` needs seeding or injection. A test that fails once a month is worse than no test, because the team learns to re-run rather than to look.

**Property-based testing** is the underused tool. Instead of enumerating examples, state an invariant — parsing then serialising returns the original, sorting produces a permutation of the input — and let fast-check generate hundreds of cases including the pathological ones you would not have written. It is genuinely worth reaching for on parsers, formatters, and anything with a round trip.

Two notes on tooling: Vitest is the default for anything Vite-based, sharing the build config so ESM and TypeScript work without a parallel setup; Jest remains fine and widely deployed. Mock at the boundary — the network, the clock, the filesystem — and let the code under test be real.

## Why it matters

Fast, deterministic tests of real logic are the cheapest defect detection available, and the same discipline makes the logic itself better factored — code that is hard to unit test is usually code that mixes concerns.

Live coding rounds often ask for a small function plus its tests, where edge-case coverage is exactly the signal.

## Key points

- Unit-test branchy, DOM-independent logic: reducers, formatters, validators, algorithms.
- Test the exported behaviour; if a pure refactor breaks the test, the test was wrong.
- Edge cases are the reason the test exists — empty, one, many, boundaries, null, unicode, timezones.
- `it.each` keeps case coverage cheap to extend.
- Fake the clock and seed randomness; a test that fails monthly trains people to ignore failures.
- Property-based testing finds the cases you would not have written, especially for round trips.
- Mock at the boundary and keep the code under test real.
