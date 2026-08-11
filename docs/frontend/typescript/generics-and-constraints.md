---
title: Generics & Constraints
summary: Type parameters as functions over types — where inference comes from, and why over-generic code is worse than concrete code.
level: core
minutes: 25
order: 4
tags: [typescript, generics]

related:
  - frontend/typescript/conditional-and-mapped-types
  - frontend/typescript/typing-react
  - frontend/typescript/structural-typing-and-assignability

resources:
  - title: Generics
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html
    source: TypeScript
    type: docs
    minutes: 35
    primary: true
  - title: Type inference
    url: https://www.typescriptlang.org/docs/handbook/type-inference.html
    source: TypeScript
    type: docs
    minutes: 20
  - title: Generics — Total TypeScript
    url: https://www.totaltypescript.com/no-such-thing-as-a-generic
    source: Matt Pocock
    type: article
    minutes: 15
---

## In one line

A generic is a type-level parameter that preserves the relationship between inputs and outputs, and its value comes entirely from that relationship — not from being reusable.

## What it is

`function first<T>(arr: T[]): T` says the return type is whatever the array held. That is the whole point: without the type parameter you would have to pick a concrete type or fall back to `any`, and either loses the connection between argument and result.

**Inference is the ergonomic half.** TypeScript infers `T` from the call site, so callers rarely write type arguments. Inference flows from arguments, and its quality is why parameter order and shape matter: putting the value you want inferred in a plain parameter position works, burying it behind a conditional type usually does not. When inference fails, the fix is often restructuring the signature rather than forcing an explicit type argument.

**Constraints** narrow what a parameter may be, using `extends`. `<T extends { id: string }>` lets the body access `id` while still returning the caller's specific type. `<K extends keyof T>` is the pattern behind type-safe property access — `get(obj, key)` returning `T[K]` is the canonical example and appears in interviews constantly.

Two defaults worth knowing: a type parameter can have a default (`<T = string>`), and constraints can reference earlier parameters (`<T, K extends keyof T>`), which is what makes multi-parameter signatures cooperate.

**Over-genericisation is the common failure.** A type parameter used exactly once in the signature is doing nothing that a plain type could not — Matt Pocock's rule that "there's no such thing as a generic" is really the observation that a parameter needs to appear at least twice (once to be inferred from, once to be used) to be earning its place. Deeply nested generics with three or four parameters produce error messages nobody can read, and the maintenance cost usually exceeds the reuse benefit.

Two advanced pieces round it out. **Generic constraints with conditional types** let a signature vary its return type by input, at the cost of inference clarity. And **variance annotations** (`in`, `out`) exist for the rare case where you need to state the intended variance rather than let the compiler infer it — mostly a library concern.

## Why it matters

Generics are unavoidable in React (`useState<T>`, component props, custom hooks) and in any shared utility, so reading them is a baseline skill and writing them well is a differentiator.

Live-coding rounds often include a small generic function — a typed `get`, a `pick`, a memoise wrapper — where the tell is whether you constrain properly rather than reaching for `any`.

## Key points

- A generic preserves the relationship between input and output types; that relationship is its only justification.
- Inference from arguments is what makes generics usable — restructure the signature when inference fails.
- `extends` constrains a parameter so the body can use its members while callers keep their specific type.
- `<T, K extends keyof T>` returning `T[K]` is the canonical type-safe property accessor.
- A type parameter appearing once in a signature is not doing any work — use a concrete type.
- Deep generic nesting produces unreadable errors; prefer clarity over maximal reuse.
