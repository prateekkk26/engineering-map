---
title: Styling Architecture Trade-offs
summary: Utility CSS, CSS Modules, CSS-in-JS and vanilla-extract — what each optimises for, and why runtime CSS-in-JS lost ground.
level: core
minutes: 25
order: 6
tags: [css, architecture, tooling]

related:
  - frontend/css/design-tokens-and-theming
  - frontend/css/css-at-scale
  - frontend/react/react-server-components

resources:
  - title: CSS Modules
    url: https://github.com/css-modules/css-modules
    source: css-modules
    type: repo
    primary: true
  - title: Tailwind CSS
    url: https://tailwindcss.com/docs/styling-with-utility-classes
    source: Tailwind
    type: docs
    minutes: 25
  - title: vanilla-extract
    url: https://vanilla-extract.style/documentation/getting-started/
    source: vanilla-extract
    type: docs
    minutes: 20
---

## In one line

The real axis is when styles are computed — build time or runtime — and the shift to server components made that the deciding factor rather than a preference.

## What it is

**CSS Modules** scope class names by hashing them per file. Plain CSS, zero runtime, works everywhere including server components, and the styles live next to the component. The cost is indirection when reading markup and no direct access to props — dynamic values go through custom properties or a class map.

**Utility CSS** (Tailwind) puts atomic classes in the markup. The wins are real: no naming, no dead CSS because the output is generated from what is used, a fixed design scale that prevents one-off values, and total CSS size that stops growing with the codebase. The costs are equally real: verbose markup, a learning curve, and dynamic values still needing an escape hatch. It has become the default for new projects at these companies, so fluency matters regardless of preference.

**Runtime CSS-in-JS** (styled-components, Emotion) offered the best ergonomics — props in styles, colocation, dynamic theming — and has lost ground for two concrete reasons. It costs runtime work on every render to serialise and inject styles, and it fundamentally cannot run in a server component, because it needs a client runtime. In an RSC codebase that is disqualifying for anything outside a `'use client'` boundary.

**Zero-runtime CSS-in-JS** (vanilla-extract, Panda, Linaria) keeps the TypeScript authoring experience and extracts static CSS at build time. Type-safe tokens, no runtime cost, RSC-compatible. The trade is build complexity and a smaller ecosystem.

The honest recommendation: **CSS Modules or Tailwind for new work**, chosen on team preference — both are zero-runtime and both work everywhere. Reach for vanilla-extract when type-safe tokens matter enough to justify the setup. Choose runtime CSS-in-JS only for a client-only application where its ergonomics genuinely pay.

Three things cut across all of them and matter more than the choice: cascade layers to control override order, custom properties for runtime theming, and a shared token source. Get those right and switching styling libraries later is a mechanical refactor rather than a rewrite.

## Why it matters

This is a decision every project makes, it is hard to reverse, and the RSC constraint has genuinely changed the correct answer since 2022 — so an out-of-date opinion is visible.

Interviewers ask it expecting trade-off reasoning; naming build-time versus runtime as the axis, and the server-component constraint as the forcing function, is the answer.

## Key points

- The deciding axis is build-time versus runtime style computation, not syntax preference.
- CSS Modules give scoping with zero runtime and full server-component compatibility.
- Tailwind removes naming and dead CSS and caps total stylesheet growth, at the cost of verbose markup.
- Runtime CSS-in-JS cannot work in server components and costs work on every render.
- Zero-runtime CSS-in-JS keeps type-safe authoring and extracts static CSS at build time.
- Default to CSS Modules or Tailwind for new work; pick vanilla-extract when typed tokens justify the setup.
- Layers, custom properties, and a shared token source matter more than the library and make switching cheap.
