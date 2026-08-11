---
title: Accessibility in Tests
summary: Automating the third of accessibility issues a machine can find, and knowing which two-thirds still need a human.
level: core
minutes: 20
order: 10
tags: [testing, accessibility, ci]

related:
  - frontend/accessibility/testing-with-a-screen-reader
  - frontend/testing/component-testing-with-rtl
  - frontend/accessibility/semantic-html-and-the-accessibility-tree

resources:
  - title: axe-core
    url: https://github.com/dequelabs/axe-core
    source: Deque
    type: repo
    primary: true
  - title: jest-axe
    url: https://github.com/nickcolley/jest-axe
    source: Nick Colley
    type: repo
  - title: Accessibility testing
    url: https://playwright.dev/docs/accessibility-testing
    source: Playwright
    type: docs
    minutes: 20
---

## In one line

Automated tooling reliably catches roughly a third of accessibility defects — the mechanical ones — and running it everywhere is cheap, but the remaining two-thirds need judgement.

## What it is

**What automation finds** is the rule-checkable set: missing alternative text, insufficient colour contrast, form inputs without labels, invalid ARIA attributes and roles, duplicate ids, missing document language, and broken heading order. axe-core is the engine behind essentially every tool in this space — browser extensions, Playwright's accessibility assertions, `jest-axe`, and Storybook's a11y addon are all wrapping it.

**What it cannot find** is the part that matters most: whether alternative text is *meaningful* rather than merely present, whether focus order makes sense, whether a custom widget's keyboard interaction matches expectations, whether an announcement is comprehensible, and whether the flow is usable at all with a screen reader. A page can pass axe completely and be unusable.

**Run it at three levels.** In component tests, `expect(await axe(container)).toHaveNoViolations()` costs one line and catches issues at the point they are introduced. In Storybook, the a11y addon checks every story automatically, which covers states the app rarely reaches. In end-to-end tests, Playwright's `AxeBuilder` scans whole composed pages, catching the issues that only appear in combination — a duplicate landmark, a contrast failure against a real background.

**The strongest accessibility test is not an accessibility test at all.** Querying by role and accessible name in ordinary component tests means the whole suite fails when a control loses its label or its role. That is continuous accessibility pressure with no separate tooling, and it is the main reason Testing Library's query priority is worth following.

**Keyboard testing is scriptable and underused.** `userEvent.tab()` through a component and assert focus order; open a dialog and assert focus moved into it; press Escape and assert it closed and focus returned. Those are ordinary tests covering the interactions that break most often.

Two practical notes. **Adopt on new code first** — turning a violation into a build failure across a legacy codebase produces hundreds of failures and an immediate exemption. And **do not chase a score**: the goal is a usable product, and a clean axe run on an unusable page is worse than an honest failing one.

## Why it matters

Accessibility regressions are easy to introduce and invisible without tooling, and legal exposure is real — the European Accessibility Act and ADA-based litigation both make this a business risk, not only an ethical one.

In interviews it is a strong signal: knowing what automation covers *and* what it misses is the difference between compliance theatre and understanding.

## Key points

- Automated tools catch roughly a third of issues — the mechanical, rule-checkable ones.
- axe-core underlies nearly every tool; the wrapper differs, the rules do not.
- Meaningful alt text, sensible focus order, and comprehensible announcements need a human.
- Run axe in component tests, in Storybook, and over composed pages end-to-end.
- Querying by role and accessible name in normal tests is continuous accessibility pressure for free.
- Script keyboard flows: tab order, focus into a dialog, Escape and focus restoration.
- Enforce on new code first, and never treat a clean scan as proof of usability.
