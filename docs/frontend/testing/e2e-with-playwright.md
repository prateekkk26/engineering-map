---
title: End-to-End with Playwright
summary: Testing real journeys in a real browser — selectors that survive, the auth setup that keeps it fast, and how many to write.
level: core
minutes: 25
order: 8
tags: [testing, e2e, playwright]

related:
  - frontend/testing/frontend-testing-strategy
  - frontend/testing/flaky-tests-and-determinism
  - frontend/testing/frontend-tests-in-ci

resources:
  - title: Playwright
    url: https://playwright.dev/docs/intro
    source: Playwright
    type: docs
    minutes: 30
    primary: true
  - title: Best Practices
    url: https://playwright.dev/docs/best-practices
    source: Playwright
    type: docs
    minutes: 25
  - title: Authentication
    url: https://playwright.dev/docs/auth
    source: Playwright
    type: docs
    minutes: 20
---

## In one line

End-to-end tests are the only ones that prove the whole system works together, and they earn that by being few, stable, and focused on journeys where failure is unacceptable.

## What it is

**Write few.** Sign up, log in, the core action the product exists for, checkout. Each one costs minutes of CI time and a maintenance burden; a suite of two hundred is one nobody trusts because something is always red.

**Locators decide stability.** Playwright's are auto-waiting and retrying, which removes a whole class of timing flake, but only if you query the way the library intends: `getByRole` with the accessible name first, then label and text, then `data-testid` for genuinely dynamic content. CSS and XPath selectors couple the test to markup and break on unrelated refactors.

**`expect` auto-retries too**, so `await expect(locator).toBeVisible()` polls until it holds. Explicit sleeps are unnecessary and are the main source of both slowness and flake.

**Authenticate once.** Logging in through the UI for every test is the largest avoidable cost. Playwright's storage-state pattern runs a setup project that logs in once, saves cookies and local storage to a file, and every subsequent test starts already authenticated. For multi-role suites, save one state per role.

**Isolate the data.** Tests that share a fixture account interfere and fail in parallel. Create the data each test needs via an API call in setup, use a unique identifier per run, and clean up afterwards — or accept a seeded, read-only dataset and never mutate it.

**Decide on network policy deliberately.** Hitting the real backend is what makes the test end-to-end and is right for the critical journeys. Routing third-party calls — payments, analytics, maps — through `page.route` mocks keeps the test from depending on someone else's uptime.

Two capabilities worth knowing beyond the basics: **trace viewer** records a timeline with DOM snapshots, network, and console for every failure, which turns "flaked in CI" into something you can actually inspect; and **projects** run the same suite across Chromium, Firefox, and WebKit, plus mobile viewports, which is the cheapest real cross-browser coverage available.

In CI, shard across workers, retry failures once to distinguish flake from breakage, and keep traces from the retry so a failure is diagnosable without reproducing it locally.

## Why it matters

These are the tests that catch integration failures nothing else can — the deploy that broke auth, the API contract change, the third-party script that blocks a form.

Playwright is the default in this ecosystem now, so familiarity is expected, and knowing to keep the suite small is the judgement being assessed.

## Key points

- Cover only journeys where failure is unacceptable; a large end-to-end suite is a distrusted one.
- Use role and label locators — they auto-wait and survive refactors; CSS and XPath do not.
- `expect` retries, so explicit sleeps are unnecessary and actively harmful.
- Authenticate once with storage state, one saved state per role.
- Create per-test data via the API with unique identifiers, or use a read-only seeded set.
- Hit the real backend but mock third parties with `page.route`.
- Use the trace viewer for failures, run across browser projects, and shard with a single retry in CI.
