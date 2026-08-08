---
title: Modules — ESM, CommonJS & Resolution
summary: Why ESM imports are live bindings resolved before execution, and what actually breaks when a package ships both formats.
level: core
minutes: 25
order: 9
tags: [language, tooling, modules]

related:
  - frontend/tooling/module-resolution-and-exports-maps
  - frontend/tooling/tree-shaking-and-side-effects
  - frontend/tooling/publishing-a-frontend-package

resources:
  - title: JavaScript modules
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: "ES modules: A cartoon deep-dive"
    url: https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
    source: Lin Clark, Mozilla Hacks
    type: article
    minutes: 20
  - title: "Modules: Packages"
    url: https://nodejs.org/api/packages.html
    source: Node.js
    type: docs
    minutes: 25
---

## In one line

ESM imports are static, hoisted, and *live* — the module graph is resolved before any code runs, which is what makes tree shaking and circular imports behave the way they do.

## What it is

CommonJS is imperative. `require()` is a function call that runs at the point it appears, executes the module if it hasn't run yet, and returns a **copy** of whatever `module.exports` pointed to at that moment. Because it's a runtime call, you can `require` conditionally, inside a function, with a computed path — and because it's dynamic, a bundler generally cannot know what you used.

ESM is declarative. `import` statements are hoisted and processed in three phases: **construction** (fetch and parse every module, building the graph), **instantiation** (allocate the exported bindings and wire imports to them), then **evaluation** (run module bodies, once each). The names are known statically before a line executes.

The consequence people trip on is **live bindings**. An ESM import is a reference to the exporting module's binding, not a copy of its value. If the exporter reassigns it later, importers see the new value. Under CommonJS they would not. This is why `import { count }` can change under you while `const { count } = require(...)` cannot.

Static structure is also what makes **tree shaking** possible: a bundler can see that only two of a module's twenty exports are imported and drop the rest — provided the module has no side effects, which is what `"sideEffects": false` in `package.json` declares.

**Circular dependencies** behave differently in each. CommonJS gives you a partially-populated `exports` object, silently. ESM handles function declarations fine because they're hoisted during instantiation, but accessing a `const` from a cycle before its module has evaluated throws a TDZ `ReferenceError` — noisier, and better.

`import()` is the escape hatch: a function returning a promise, usable anywhere, and the mechanism behind every code-split route and lazily-loaded component.

**Dual packages** are where this becomes a real support burden. A package shipping both formats can end up loaded twice in one process — the CJS copy and the ESM copy — with separate module state. Two instances of a singleton, two React contexts, `instanceof` failing across them. The `exports` field in `package.json` controls which entry point each consumer gets and is the main tool for containing this.

In the browser, `<script type="module">` is deferred by default, always strict mode, has its own top-level scope rather than sharing globals, and is fetched with CORS.

## Why it matters

Bundle size questions bottom out here — "why didn't this tree-shake?" is nearly always a side-effectful module or a CJS dependency. So do a whole family of confusing build errors: `ERR_REQUIRE_ESM`, `"exports" is not defined`, a library that works in dev and breaks in the Next.js server build.

At senior level you're expected to reason about the module graph rather than trial-and-error the config, and to know what you're committing to when you publish a package other teams consume.

## Key points

- ESM resolves its graph statically before evaluation; CommonJS resolves at runtime when `require()` executes, which is why only ESM can be reliably tree-shaken.
- ESM imports are live bindings to the exporter's variable — reassignment is visible to importers. CommonJS hands back a value copy.
- Tree shaking needs both static imports and an absence of side effects; `"sideEffects": false` is the declaration bundlers rely on.
- Circular imports give CommonJS a half-initialised `exports` object silently, while ESM throws a TDZ `ReferenceError` for `const` access before evaluation.
- Dynamic `import()` returns a promise and is the basis of route-level code splitting and lazy components.
- A dual-format package can be instantiated twice in one process, producing duplicated singletons and `instanceof` failures across the copies.
- The `exports` field in `package.json` is what decides which entry a consumer resolves, and it is the main tool for avoiding the dual-package hazard.
- `<script type="module">` is deferred, strict, CORS-fetched, and scoped to the module rather than sharing the global namespace.
