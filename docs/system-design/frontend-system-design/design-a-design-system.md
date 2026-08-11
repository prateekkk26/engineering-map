---
title: Design a Design System
summary: Tokens, component API contracts, versioning and adoption — the design prompt where the hard parts are organisational, not technical.
level: core
minutes: 30
order: 14
tags: [frontend-system-design, design-problem, architecture, design-systems]

related:
  - frontend/architecture/design-systems
  - frontend/architecture/component-api-design
  - frontend/architecture/versioning-shared-ui
  - frontend/tooling/publishing-a-frontend-package
  - frontend/accessibility/building-accessible-components

resources:
  - title: Design Tokens Format Module
    url: https://tr.designtokens.org/format/
    source: W3C Design Tokens Community Group
    type: docs
    minutes: 25
    primary: true
  - title: Radix Primitives
    url: https://www.radix-ui.com/primitives/docs/overview/introduction
    source: Radix
    type: docs
    minutes: 25
  - title: Writing Resilient Components
    url: https://overreacted.io/writing-resilient-components/
    source: Dan Abramov
    type: article
    minutes: 25
  - title: Storybook — Docs
    url: https://storybook.js.org/docs
    source: Storybook
    type: docs
    minutes: 20
---

## In one line

A component library is the easy half; the design system is the tokens beneath it, the versioning around it, and the answer to "how do forty engineers adopt this without forking it".

## What it is

**Requirements.** How many consuming apps and teams? One brand or several (white-label, dark mode, per-tenant theming)? One framework or several? Is there an existing UI to migrate from — because greenfield and migration are different projects. Who owns it: a central team, or a federated model with contributions?

**Layer it, and say the layers out loud.**

*Tokens.* Primitives (`blue-500`, `space-4`) → semantic aliases (`color-surface-danger`, `space-inline-md`) → component-level tokens. Components consume **semantic** tokens only, never primitives — that indirection is what lets you reskin or add a theme without touching component code. Ship tokens as a platform-neutral source (JSON) built out to CSS custom properties, and to whatever iOS/Android need. CSS custom properties, not build-time variables, if theming has to switch at runtime.

*Primitives and components.* Unstyled behavioural primitives (a menu that handles focus, keyboard and positioning) with styling layered on top; that split is why Radix-style libraries won. Then composed components, then patterns.

**Component API design is the technical core.** Prefer composition over configuration — `<Card><Card.Header/></Card>` rather than fifteen boolean props, because every boolean is a permanent commitment and they multiply combinatorially. Every interactive component supports controlled *and* uncontrolled use. Forward refs and spread the rest of the props onto the underlying element, or consumers will fork the component the first time they need an `aria-` attribute you didn't anticipate. Provide a deliberate escape hatch (`asChild`, slots, a `className` merge) — without one, teams copy-paste your source, and that's the real failure of most design systems.

**Accessibility is the value proposition.** Solving focus management, ARIA wiring and keyboard interaction *once* is the strongest argument for the system existing. Test with axe in CI and with a screen reader manually, and document the keyboard contract per component.

**Distribution and versioning.** Semver, with breaking changes batched into planned majors rather than dribbled out. Codemods shipped with every breaking change — this is what makes upgrades happen. Deprecate loudly (console warnings in dev, lint rules) before removing. Tree-shakeable ESM with correct `sideEffects` and `exports` maps so consuming a button doesn't pull the whole library. Monorepo with the consuming apps, or a separate repo with a canary channel — both defensible, pick one and justify it.

**Adoption is the part that actually fails.** Documentation with live examples (Storybook), visual regression tests so you can change things safely, a contribution path with a clear bar, usage telemetry so you know which components are used and which are being worked around, and a migration story per consuming app. A design system nobody adopts is worse than none, because now there are two systems.

## Why it matters

It's the frontend design prompt closest to actual staff-level work, and it's asked precisely because the answer reveals whether you think about other engineers as your users. Component API design and the versioning/codemod story are the two parts most candidates have never had to think through, and both are recurring JD lines — "reusable component libraries used across teams".

## Key points

- Three token tiers — primitive, semantic, component — and components consume only semantic ones; that's what makes theming possible.
- Ship tokens from a neutral source into CSS custom properties so themes can switch at runtime.
- Split unstyled behavioural primitives from styling; it's why the primitive-library model won.
- Composition beats configuration — every boolean prop is permanent and they combine combinatorially.
- Support controlled and uncontrolled modes, forward refs, and spread remaining props to the underlying element.
- Ship a deliberate escape hatch, or teams will fork your component the first time it doesn't fit.
- Solving keyboard and ARIA once, correctly, is the system's core value — document the keyboard contract per component.
- Batch breaking changes into planned majors and ship codemods with them; that is what makes upgrades actually happen.
- Correct `exports` maps and `sideEffects` so importing one component doesn't pull the whole bundle.
- Track usage telemetry and visual regression tests — adoption and safe change are the real failure modes, not the code.
