---
title: Narrowing & Control Flow Analysis
summary: How TypeScript tracks what a value could be as code branches, and the guards that teach it something it cannot infer.
level: core
minutes: 25
order: 2
tags: [typescript, type-system, narrowing]

related:
  - frontend/typescript/any-unknown-never-and-satisfies
  - frontend/typescript/branded-types-and-domain-modelling
  - frontend/state-and-data/ui-state-machines

resources:
  - title: Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
    source: TypeScript
    type: docs
    minutes: 35
    primary: true
  - title: Discriminated unions
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    source: TypeScript
    type: docs
    minutes: 15
  - title: Type predicates
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
    source: TypeScript
    type: docs
    minutes: 15
---

## In one line

TypeScript follows your control flow and narrows a union as your checks eliminate possibilities — and where it cannot follow, you tell it with a predicate.

## What it is

Inside an `if (typeof x === 'string')`, `x` is a `string`. That is control flow analysis: the compiler simulates the branches and tracks the possible types at each point. The narrowing operators are `typeof`, `instanceof`, `in`, truthiness, equality against a literal, and `Array.isArray`.

**Discriminated unions** are the pattern this exists for. Give each member a common literal-typed field — `type: 'success' | 'error'` — and a `switch` on it narrows to exactly one member per branch, with the other members' fields correctly inaccessible. Modelling application state this way is what makes impossible states unreachable rather than merely discouraged.

**Exhaustiveness checking** falls out of it. In the `default` branch, assign the value to `never`; if a new union member is added later, that assignment fails to compile and points at every switch you forgot to update. This is one of the highest-value patterns in the language.

**Type predicates** cover what the compiler cannot see. A function returning `value is User` tells the checker that a `true` result means the argument is a `User` — necessary for validation helpers and for filtering. `arr.filter(Boolean)` famously does *not* narrow, which is why a predicate-typed helper is worth having. **Assertion functions** (`asserts value is User`) do the same for the throw-on-failure style.

Narrowing is fragile in specific, predictable ways. It **resets across a function boundary**, so a narrowed value used inside a callback is widened again — the fix is a local `const`. It resets after an `await` or any call the compiler cannot prove is side-effect-free, for mutable bindings. And it does not survive property access on a `let` that could have been reassigned.

Two more tools: the **non-null assertion** `!` is a claim, not a check, and each one is a place you have overruled the compiler; and `satisfies` lets you validate a value against a type without widening it, preserving the narrow inferred literal types for downstream narrowing.

## Why it matters

Narrowing is what makes strict TypeScript pleasant rather than an obstacle course of casts. A codebase full of `as` is usually one where nobody learned discriminated unions.

Exhaustiveness checking in particular converts a whole class of "we forgot to handle the new case" bugs into compile errors, which is a compelling thing to demonstrate in a take-home.

## Key points

- `typeof`, `instanceof`, `in`, truthiness, and literal equality all narrow; the compiler tracks the result per branch.
- Discriminated unions with a literal tag are the pattern narrowing is designed around.
- Assign to `never` in the default branch to get compile errors when a union grows.
- Type predicates (`x is T`) and assertion functions teach the compiler what it cannot infer.
- Narrowing resets across callbacks, across `await`, and for reassignable bindings — capture into a `const`.
- `!` is an unchecked claim; treat each one as a place you overrode the type system.
- `satisfies` validates against a type while keeping the narrower inferred type.
