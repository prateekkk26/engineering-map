---
title: Utility Types in Practice
summary: The built-in helpers worth knowing by heart, the ones that are traps, and how to compose them.
level: core
minutes: 20
order: 8
tags: [typescript, utility-types]

related:
  - frontend/typescript/conditional-and-mapped-types
  - frontend/typescript/typing-react
  - frontend/typescript/structural-typing-and-assignability

resources:
  - title: Utility Types
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html
    source: TypeScript
    type: docs
    minutes: 30
    primary: true
  - title: type-fest
    url: https://github.com/sindresorhus/type-fest
    source: Sindre Sorhus
    type: repo
  - title: Mapped Types
    url: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
    source: TypeScript
    type: docs
    minutes: 25
---

## In one line

A dozen built-in type transformations cover most day-to-day needs, and knowing which ones are unsafe matters more than knowing all of them.

## What it is

The everyday set: **`Partial<T>`** and **`Required<T>`** flip optionality; **`Readonly<T>`** adds `readonly`; **`Pick<T, K>`** and **`Omit<T, K>`** select and remove keys; **`Record<K, V>`** builds a dictionary; **`Exclude<T, U>`** and **`Extract<T, U>`** filter unions; **`NonNullable<T>`** drops `null` and `undefined`; **`ReturnType`**, **`Parameters`**, and **`Awaited`** extract from functions and promises.

Three of them deserve warnings.

**`Omit` does not check its keys.** `Omit<User, 'nmae'>` compiles happily and silently omits nothing, so a rename elsewhere leaves the omit pointing at a key that no longer exists. `Pick` does check, because its keys are constrained to `keyof T`. A stricter `Omit` that constrains the key parameter is a five-line helper worth adding.

**`Record<string, T>` lies about lookups.** Indexing it returns `T`, not `T | undefined`, so `record[someKey].foo` type-checks and crashes at runtime. `noUncheckedIndexedAccess` fixes this globally and is worth the friction it introduces.

**`Partial` is over-applied.** Making every field optional to model "a form in progress" pushes `undefined` checks into every consumer. A discriminated union between draft and complete states is usually the honest model.

Composition is where the value is: `Omit<Props, 'onChange'> & { onChange: (v: Value) => void }` is the standard way to wrap a component and change one prop's type, and `Pick<T, K> & Partial<Omit<T, K>>` expresses "these fields required, the rest optional".

For what the standard library lacks — `SetOptional`, `RequireAtLeastOne`, `Merge`, deep variants — **type-fest** is the well-maintained answer, and reaching for it beats hand-rolling a recursive `DeepPartial` that breaks on arrays.

Finally, define types once and derive: infer from a Zod schema, derive props from a component, and `Pick` a subset rather than declaring a parallel type that will drift.

## Why it matters

These appear in every real codebase and in every library's type signatures, so fluency is a baseline requirement rather than an advanced skill.

The `Omit` and `Record` gaps in particular are quiet, real bugs that experienced reviewers look for.

## Key points

- Know `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`.
- `Omit` accepts keys that do not exist — a typo silently omits nothing; `Pick` is checked.
- `Record<string, T>` claims every lookup succeeds; enable `noUncheckedIndexedAccess`.
- `Partial` as a stand-in for "incomplete" pushes undefined checks everywhere — prefer a state union.
- Compose with `Omit`-and-intersect to change one prop's type when wrapping a component.
- Use type-fest for the gaps rather than hand-rolling recursive helpers.
- Derive types from one source of truth instead of declaring parallel shapes.
