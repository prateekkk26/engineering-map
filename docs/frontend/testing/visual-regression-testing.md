---
title: Visual Regression Testing
summary: Catching unintended visual change by comparing screenshots, and keeping the false positives low enough to stay useful.
level: deep
minutes: 20
order: 9
tags: [testing, visual, ci]

related:
  - frontend/architecture/documenting-ui-with-storybook
  - frontend/architecture/versioning-shared-ui
  - frontend/testing/frontend-tests-in-ci

resources:
  - title: Visual comparisons
    url: https://playwright.dev/docs/test-snapshots
    source: Playwright
    type: docs
    minutes: 20
    primary: true
  - title: Chromatic
    url: https://www.chromatic.com/docs/
    source: Chromatic
    type: docs
    minutes: 25
  - title: Visual testing
    url: https://storybook.js.org/docs/writing-tests/visual-testing
    source: Storybook
    type: docs
    minutes: 20
---

## In one line

Screenshot every component state, diff against an approved baseline, and surface the pixels that changed — the only automated way to catch "this CSS change broke something over there".

## What it is

The gap it fills is specific. A functional test asserts the button is in the document and clickable; it says nothing about the button being invisible, overlapping, or off-screen. A CSS change in one place can break an unrelated component, and no assertion you would think to write covers it.

The mechanism is simple: render a known state, capture an image, compare to the stored baseline, fail on difference beyond a threshold, and let a human approve intentional changes so the baseline moves forward.

**Storybook is the natural input**, because stories already enumerate the states worth checking. Chromatic runs them as a hosted service with review workflow; Playwright's `toHaveScreenshot` does it in your own CI at the cost of managing baselines and browser images yourself.

**False positives are the thing that kills adoption.** Anti-aliasing differs between machines, so run in a fixed containerised environment rather than on developer laptops. Freeze anything non-deterministic — dates, random data, animations (disable them), and loading spinners mid-spin. Wait for fonts and images to load before capturing, since a font swapping in after the screenshot produces a diff on every run. Mask genuinely dynamic regions rather than raising the global threshold, which would hide real changes everywhere.

**Cost scales with coverage**, in CI minutes and in reviewer attention. A hundred snapshots reviewed carefully beats a thousand approved in bulk — and bulk approval is exactly what happens when the diff list is long, which defeats the entire exercise.

Where it pays best: **design systems**, where one component change affects every consumer; **cross-browser** rendering differences; **responsive breakpoints**, captured at a few widths; and **theme variants**, especially dark mode, where a hard-coded colour is invisible until someone looks.

The honest limitation: it detects change, not correctness. It cannot tell you the design was wrong to begin with — only that it differs from what was approved. That makes it a regression net, not a substitute for design review.

## Why it matters

Visual bugs are the ones users notice immediately and automated tests otherwise miss entirely, and in a design system they are the difference between a safe change and a company-wide regression.

It is also what makes the versioning story work: without visual coverage, "breaking" is limited to the type signature.

## Key points

- Functional tests cannot see visual breakage; screenshot diffing is the only automated coverage for it.
- Storybook stories are the natural input since they already enumerate states.
- Run in a fixed containerised environment — anti-aliasing differences across machines cause false positives.
- Freeze dates, random data, and animations, and wait for fonts and images before capturing.
- Mask dynamic regions rather than raising the global threshold.
- Keep the snapshot count reviewable; bulk approval defeats the purpose.
- Highest value on design systems, cross-browser, breakpoints, and theme variants.
- It detects change, not correctness — a regression net, not design review.
