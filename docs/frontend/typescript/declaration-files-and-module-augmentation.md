---
title: Declaration Files & Module Augmentation
summary: Typing untyped packages, extending library types, and declaring the non-JavaScript things a bundler lets you import.
level: deep
minutes: 20
order: 11
tags: [typescript, tooling, types]

related:
  - frontend/typescript/tsconfig-strictness-and-project-references
  - frontend/tooling/publishing-a-frontend-package
  - frontend/tooling/module-resolution-and-exports-maps

resources:
  - title: Declaration Files — Introduction
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
    source: TypeScript
    type: docs
    minutes: 25
    primary: true
  - title: Declaration Merging
    url: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
    source: TypeScript
    type: docs
    minutes: 25
  - title: DefinitelyTyped
    url: https://github.com/DefinitelyTyped/DefinitelyTyped
    source: DefinitelyTyped
    type: repo
---

## In one line

A `.d.ts` file describes types without implementation — it is how untyped packages get typed, how library types get extended, and how the compiler learns that importing a CSS file is legal.

## What it is

When a package ships no types, three options exist in order of preference: install `@types/whatever` from DefinitelyTyped; write a local declaration file; or, as a last resort, `declare module 'whatever'` with no body, which types it as `any` and at least stops the error.

A local declaration is usually short. `declare module 'untyped-lib' { export function doThing(x: string): number }` types only what you actually use, which is a legitimate and maintainable subset.

**Module augmentation** extends types you do not own. Reopen the module and add to an existing interface:

```ts
declare module 'express' {
  interface Request { user?: User }
}
```

The frontend versions of this are everywhere: extending the theme type in styled-components or Emotion, adding custom matchers to Jest or Vitest's `expect`, extending `next-auth`'s `Session`. **Interfaces merge; type aliases do not** — which is precisely why libraries expose extension points as interfaces.

**Global augmentation** uses `declare global` inside a module (or a plain script-context `.d.ts`), and is how you type `window.myAppConfig`, custom events, or a global set by a script tag. Use it sparingly — a global is a global in the type system too.

**Ambient module declarations for assets** are the everyday case in an app: `declare module '*.svg'` so the bundler's import works, `declare module '*.module.css'` for CSS modules. Most frameworks ship these; Next.js includes them in its generated types, which is why `next-env.d.ts` exists and should not be edited.

Two rules that prevent hours of confusion. **The `.d.ts` must be included by `tsconfig`** — a declaration file outside `include` is invisible, and this is the most common reason an augmentation "does not work". And **augmentation requires the file to be a module**: a `.d.ts` with no top-level import or export is treated as a global script, so `declare module 'x'` in it means something different. Adding `export {}` fixes it.

## Why it matters

Every real project hits an untyped dependency or needs to extend a library's types, and getting it wrong produces either a wall of errors or a silent `any`.

The interfaces-merge-but-types-do-not detail is also a good interview question, because it explains a design choice visible across the whole ecosystem.

## Key points

- Prefer `@types/*` from DefinitelyTyped; a hand-written local declaration of just what you use is a fine fallback.
- `declare module 'name'` with an empty body types the package as `any` — a stopgap, not a solution.
- Module augmentation reopens a library's module to extend its interfaces; this is how themes and matchers get typed.
- Interfaces merge across declarations, type aliases do not — the reason libraries expose interfaces.
- `declare global` types `window` extensions and globals; use it sparingly.
- Ambient module declarations (`*.svg`, `*.module.css`) make bundler imports type-check.
- A `.d.ts` must be in `include`, and needs `export {}` to be treated as a module rather than a global script.
