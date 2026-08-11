---
title: Tree Shaking & Side Effects
summary: Why unused code still ends up in the bundle, and the package-level signals that let a bundler drop it.
level: core
minutes: 20
order: 4
tags: [tooling, bundling, performance]

related:
  - frontend/tooling/how-bundlers-work
  - frontend/performance/javascript-bundle-budgets
  - frontend/tooling/publishing-a-frontend-package

resources:
  - title: Tree Shaking
    url: https://webpack.js.org/guides/tree-shaking/
    source: webpack
    type: docs
    minutes: 25
    primary: true
  - title: sideEffects
    url: https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
    source: webpack
    type: docs
    minutes: 15
  - title: Bundlephobia
    url: https://bundlephobia.com/
    source: Bundlephobia
    type: docs
    minutes: 10
---

## In one line

Tree shaking removes exports nothing imports, and it only works when the bundler can prove that dropping a module changes nothing observable — which is where most of the failures come from.

## What it is

The mechanism depends on **static ESM**. `import { debounce } from 'lodash-es'` declares a specific binding at compile time, so the graph knows what is reachable. `require()` is dynamic and cannot be analysed the same way, which is why a CommonJS dependency is usually included whole.

**Side effects are the blocker.** If a module might do something on import — assign to a global, register a polyfill, inject CSS, patch a prototype — removing it changes behaviour, so the bundler must keep it. Since it cannot prove absence of side effects, it assumes presence unless told otherwise.

`"sideEffects": false` in `package.json` is that assertion, and it is the single highest-leverage field for a library author. Where some files genuinely have side effects — CSS imports, polyfill entry points — list them: `"sideEffects": ["*.css", "./src/polyfills.js"]`. Getting this wrong in either direction is bad: claiming purity that does not hold produces missing styles in production only, and omitting it entirely means consumers ship your whole package.

**The common failures** on the consumer side are worth memorising. **Barrel files** that re-export a large surface cause the bundler to pull in far more than needed; `optimizePackageImports` in Next mitigates it for known packages, but narrow imports are the reliable fix. **Default-importing a namespace** — `import _ from 'lodash'` — brings everything. **CommonJS-only dependencies** cannot be shaken. And **class methods are not shaken** at all, so a large class with one used method ships whole; a module of standalone functions is the shakeable shape.

**Verify rather than assume.** A bundle analyzer shows what actually landed, Bundlephobia estimates a package's cost before you add it, and webpack's `usedExports` output explains why a module was retained. "It should tree-shake" is a belief; the analyzer is evidence.

The general principle for library authors: **ESM output, granular modules, `sideEffects` declared, no top-level work**. For consumers: **import narrowly, prefer function-shaped libraries, and check the analyzer after adding anything substantial**.

## Why it matters

Bundle size maps directly to load and interaction performance, and failed tree shaking is one of the most common reasons a bundle is larger than the code justifies.

It also determines the design of a library you publish — the difference between a package consumers can use a slice of and one they must take whole.

## Key points

- Tree shaking needs static ESM imports; CommonJS is dynamic and generally included whole.
- A bundler assumes side effects unless told otherwise, so unimported modules are retained by default.
- `"sideEffects": false` (or a list) is the highest-value field a library can set — and dangerous if wrong.
- Barrel files pull in far more than the named import suggests; import narrowly.
- Namespace default imports defeat shaking entirely.
- Class methods are not shaken — standalone functions are the shakeable shape.
- Verify with a bundle analyzer; "it should tree-shake" is not evidence.
