---
title: Module Resolution & Exports Maps
summary: How a bare import becomes a file on disk, and why the dual-package era still produces "cannot find module".
level: deep
minutes: 20
order: 1
tags: [tooling, modules, node]

related:
  - frontend/javascript/modules-esm-and-cjs
  - frontend/tooling/publishing-a-frontend-package
  - frontend/typescript/tsconfig-strictness-and-project-references

resources:
  - title: Package entry points
    url: https://nodejs.org/api/packages.html#package-entry-points
    source: Node.js
    type: docs
    minutes: 30
    primary: true
  - title: Modules — Theory
    url: https://www.typescriptlang.org/docs/handbook/modules/theory.html
    source: TypeScript
    type: docs
    minutes: 30
  - title: Are the types wrong?
    url: https://arethetypeswrong.github.io/
    source: arethetypeswrong
    type: docs
    minutes: 15
---

## In one line

`import x from 'lib'` is resolved by walking `node_modules` and consulting the package's `exports` map, and most resolution errors come from that map disagreeing with your tooling's assumptions.

## What it is

Resolution has two parts. **Specifier kinds**: relative (`./foo`), absolute, bare (`lodash`), and subpath imports (`#internal`). Bare specifiers walk up the directory tree checking each `node_modules` until a match is found — which is why a hoisted dependency can be importable without being declared, and why pnpm's strict layout catches that as a bug.

**The `exports` field** is what a modern package uses to declare its public surface. It replaces `main` and, importantly, it is *encapsulating*: anything not listed cannot be imported at all. That is why `import 'lib/dist/internal.js'` — which used to work — now fails against a package that adopted it. That is intentional, and it is the fix for the old problem of consumers depending on internals.

The map is keyed by **conditions**, resolved in declaration order: `types`, `import`, `require`, `node`, `browser`, `default`. A package can therefore serve ESM to a bundler, CJS to `require`, and a browser-specific build to a bundler targeting the web. Order matters — `types` must come first, and `default` last.

**The dual-package hazard** is the recurring failure: a library shipping both CJS and ESM can end up loaded twice in one process, with two copies of its internal state. For anything holding a singleton — a React context, a client instance — that is a real bug that manifests as "the provider is not found" when it clearly is.

**TypeScript's `moduleResolution`** must match reality: `bundler` for anything built by Vite, webpack or Next; `nodenext` for Node libraries. The legacy `node` setting does not understand `exports` at all, which is the single most common cause of "cannot find module" against a package that resolves fine at runtime.

Two practical tools. **`arethetypeswrong`** checks a published package's resolution across conditions and catches the type/runtime mismatches that produce confusing consumer errors. And **`imports`** (the `#`-prefixed counterpart to `exports`) gives internal aliases without `../../..` chains, resolved by Node and bundlers alike rather than only by your build config.

## Why it matters

Resolution errors are among the most time-consuming and least interesting problems in frontend work, and they are almost always explicable by a condition order, a missing `exports` entry, or a mismatched `moduleResolution`.

Publishing a package makes it your problem directly, and getting the map wrong breaks consumers in ways that are hard for them to diagnose.

## Key points

- Bare specifiers walk up `node_modules`; strict layouts like pnpm's surface undeclared dependencies as errors.
- `exports` encapsulates a package — unlisted paths are unimportable, which breaks deep imports by design.
- Conditions resolve in declaration order: `types` first, `default` last.
- Loading both CJS and ESM copies of one package duplicates its state and breaks singletons.
- Set `moduleResolution` to `bundler` or `nodenext`; the legacy `node` mode ignores `exports`.
- Check published packages with `arethetypeswrong` before shipping.
- Use `imports` (`#internal`) for internal aliases that work outside your bundler config.
