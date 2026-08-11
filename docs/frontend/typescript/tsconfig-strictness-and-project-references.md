---
title: tsconfig, Strictness & Project References
summary: The compiler flags that actually change safety, and how to keep type-checking fast in a large or multi-package codebase.
level: core
minutes: 25
order: 12
tags: [typescript, tooling, config]

related:
  - frontend/typescript/any-unknown-never-and-satisfies
  - frontend/architecture/monorepos-for-frontend
  - frontend/tooling/ci-cd-for-frontend

resources:
  - title: TSConfig Reference
    url: https://www.typescriptlang.org/tsconfig/
    source: TypeScript
    type: docs
    minutes: 40
    primary: true
  - title: Project References
    url: https://www.typescriptlang.org/docs/handbook/project-references.html
    source: TypeScript
    type: docs
    minutes: 25
  - title: tsconfig/bases
    url: https://github.com/tsconfig/bases
    source: tsconfig
    type: repo
---

## In one line

`strict: true` is the baseline, three flags outside it close the biggest remaining holes, and project references are what keep type-checking fast once one package becomes several.

## What it is

**`strict`** is a bundle, and the two members that matter most are `strictNullChecks` — which separates `null` and `undefined` from every other type and is the single largest safety win TypeScript offers — and `noImplicitAny`, which forces you to say when you are opting out. Turning `strict` off to make errors go away is the decision that produces a codebase where the types are decorative.

Three flags outside the bundle are worth enabling deliberately:

**`noUncheckedIndexedAccess`** adds `| undefined` to index signature and array lookups. `arr[0]` becoming possibly-undefined is annoying and correct — it is the flag that catches the empty-array crash.

**`exactOptionalPropertyTypes`** distinguishes an absent property from one explicitly set to `undefined`, which matters whenever you spread partial objects over defaults.

**`verbatimModuleSyntax`** makes import elision predictable and forces `import type` for type-only imports — necessary once bundler and runtime disagree about what a side-effect import means.

Then the resolution settings that determine whether modern packages work at all: `moduleResolution: "bundler"` for anything built by Vite, webpack, or Next; `"nodenext"` for Node libraries. Getting this wrong is the usual cause of "cannot find module" against a package with an `exports` map. `tsconfig/bases` provides sensible presets rather than assembling one from memory.

**Project references** address scale. Once a repo has several packages, one big `tsc` re-checks everything on every change. References split it: each package has its own config with `composite: true`, declares what it depends on, and emits `.d.ts` plus a build-info file so `tsc --build` recompiles only what changed. Consumers type-check against the emitted declarations rather than the source, which is what makes it fast — and also what makes a stale build produce confusing errors.

Two operational notes. Editors use the workspace's TypeScript version, not the global one — pin it per project or two developers see different errors from the same code. And **`tsc --noEmit` in CI is not optional**: the bundler strips types without checking them, so a build passing proves nothing about type correctness.

## Why it matters

Strictness settings determine whether TypeScript prevents bugs or just annotates them, and the three flags outside `strict` are where most remaining runtime type errors come from.

Migration questions — "how would you turn on strict in a large codebase?" — are common, and the answer is incremental: enable per-directory with overrides, or use `strict` with targeted `// @ts-expect-error` and a burn-down list.

## Key points

- `strict: true` is the baseline; `strictNullChecks` alone eliminates the largest class of runtime type errors.
- Add `noUncheckedIndexedAccess` — array and record lookups really can be undefined.
- `exactOptionalPropertyTypes` separates missing from explicitly-undefined, which matters when spreading.
- `verbatimModuleSyntax` makes type-only imports explicit and import elision predictable.
- Set `moduleResolution` to `bundler` or `nodenext` to match reality, or modern `exports` maps will not resolve.
- Project references with `composite` make large repos incrementally checkable via `tsc --build`.
- Pin the editor's TypeScript version, and run `tsc --noEmit` in CI — bundlers strip types without checking them.
