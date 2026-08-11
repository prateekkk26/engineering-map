---
title: Documenting UI with Storybook
summary: A workshop for building components in isolation, and what it buys beyond documentation — testing, review, and accessibility checks.
level: core
minutes: 20
order: 5
tags: [architecture, tooling, documentation, testing]

related:
  - frontend/architecture/design-systems
  - frontend/testing/visual-regression-testing
  - frontend/testing/accessibility-in-tests

resources:
  - title: Storybook
    url: https://storybook.js.org/docs
    source: Storybook
    type: docs
    minutes: 30
    primary: true
  - title: Component Story Format
    url: https://storybook.js.org/docs/api/csf
    source: Storybook
    type: docs
    minutes: 20
  - title: Chromatic
    url: https://www.chromatic.com/docs/
    source: Chromatic
    type: docs
    minutes: 20
---

## In one line

Storybook renders components in isolation with controllable props, which turns "documentation" into an executable artifact that also serves as the input to visual and interaction testing.

## What it is

A **story** is one component in one state. Written in Component Story Format — a default export describing the component and named exports for each state — stories are plain modules, which is why other tools can consume them.

The immediate value is development ergonomics: building a component without navigating three screens to reach it, and being able to reach the states that are hard to produce in the real app — error, empty, loading, very long content, a name that breaks the layout. Those are exactly the states that ship broken, because nobody sees them during normal development.

Beyond that, the same stories drive four other things. **Visual regression** — Chromatic or Playwright screenshots every story and diffs across commits, catching the CSS change that broke an unrelated component. **Interaction tests** via the `play` function, which script clicks and assertions inside the story and run in CI. **Accessibility checks** with the a11y addon, which runs axe on every story and surfaces violations at build time. And **design review**, where a deployed Storybook is a link a designer or PM can open without a local checkout.

The docs layer — autodocs generating prop tables from TypeScript — is genuinely useful, and genuinely not enough on its own. What consumers need is when to use a component and when not to, which has to be written.

Two honest costs. **Maintenance**: stories go stale, and a Storybook full of components that no longer match production is worse than none. Keeping stories minimal and deriving them from real prop types helps. And **setup**: it is another build configuration to maintain alongside the app's.

The judgement call: Storybook earns its place for a shared component library, where isolation and visual testing pay across many consumers. For a small product surface with no reuse, the cost usually exceeds the benefit, and colocated tests plus the real app are enough.

## Why it matters

Any company with a design system runs one, so it appears in JDs and in day-to-day work, and knowing it as a testing surface rather than a documentation site is the more useful framing.

The isolation argument is also a good design-round point: the states you cannot easily reach are the states that ship broken.

## Key points

- A story is one component in one state, written as a plain module in CSF — which is why other tools can consume it.
- Isolation makes the hard-to-reach states — error, empty, overflow — visible during development.
- The same stories drive visual regression, interaction tests, and automated accessibility checks.
- A deployed Storybook gives designers and PMs a reviewable artifact with no checkout.
- Autodocs generates prop tables; the when-and-when-not guidance still has to be written.
- Stale stories are worse than no stories — keep them minimal and derived from real types.
- Worth it for a shared library; often not worth it for a small non-reused surface.
