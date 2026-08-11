---
title: Design Systems
summary: What a design system actually consists of beyond a component library, and why adoption is the hard part.
level: core
minutes: 25
order: 3
tags: [architecture, design-systems, process]

related:
  - frontend/architecture/component-api-design
  - frontend/css/design-tokens-and-theming
  - frontend/architecture/versioning-shared-ui

resources:
  - title: Design Systems Handbook
    url: https://www.designbetter.co/design-systems-handbook
    source: DesignBetter
    type: book
    primary: true
  - title: Radix Primitives
    url: https://www.radix-ui.com/primitives/docs/overview/introduction
    source: Radix UI
    type: docs
    minutes: 25
  - title: Design tokens
    url: https://www.designtokens.org/
    source: Design Tokens Community Group
    type: docs
    minutes: 20
---

## In one line

A design system is tokens, primitives, components, documentation and governance — and the components are the easy part.

## What it is

The layers, from the bottom: **tokens** (colour, spacing, type, radius, motion) as the shared vocabulary; **primitives** (Box, Stack, Text) that make layout consistent without bespoke CSS; **components** with agreed behaviour and accessibility; **patterns** — how those components compose into a form, an empty state, a destructive confirmation; and **documentation** covering not just the props but when to use each thing and when not to.

**Build versus buy** is the first real decision, and the market has changed the answer. Headless libraries — Radix, React Aria, Base UI — provide behaviour and accessibility with no styling, which is where nearly all the difficulty lives. A production-grade combobox with correct keyboard interaction, focus management and screen reader announcements is weeks of work and easy to get subtly wrong. Building on a headless primitive and styling it yourself is the default for most teams; building from scratch is justified only by unusual requirements.

**Accessibility must be built in.** If the button is accessible, everything using the button is. If it is not, every team re-fixes the same defect. This is the strongest single argument for a design system existing at all.

**Adoption is the hard part**, and it is a people problem. A system nobody uses is worse than no system, because it costs maintenance and creates two ways to do everything. What works: make the system path easier than the alternative, migrate the highest-traffic surfaces yourself rather than filing tickets, publish a genuine contribution path so teams add rather than fork, and measure adoption — percentage of components from the system, count of one-off overrides — so the conversation is about data.

**Governance** decides who can add a component, how breaking changes are handled, and how requests get triaged. Without it a system either ossifies (nothing gets added, teams fork) or bloats (everything gets added, nothing is consistent).

Two failure modes worth naming. **The design-code gap**: Figma and the codebase drift, and the fix is generating tokens from one source rather than agreeing to be careful. And **the escape hatch problem**: no escape hatch means teams fork; too easy an escape hatch means nobody uses the system. `className` pass-through plus a documented "here's when to go around us" is the usual balance.

## Why it matters

Design systems are standard at any company past a handful of engineers, and JDs list "reusable component libraries across teams" explicitly.

They are also a good seniority signal in interviews, because the interesting answers are about adoption, governance and versioning rather than about building a Button.

## Key points

- Tokens, primitives, components, patterns, documentation, governance — the components are the smallest part.
- Headless libraries provide the behaviour and accessibility that are hardest to get right; style them yourself.
- Building accessibility into shared components fixes it once instead of in every team.
- Adoption is a people problem: make the paved path easier, migrate high-traffic surfaces yourself, measure uptake.
- Governance prevents both ossification and bloat.
- Generate tokens from one source to close the design-code gap.
- Provide a documented escape hatch — no escape means forks, too easy an escape means no system.
