---
title: any, unknown, never & satisfies
summary: The four type-system escape hatches and boundary markers, and which one to reach for when.
level: core
minutes: 20
order: 3
tags: [typescript, type-system]

related:
  - frontend/typescript/narrowing-and-control-flow-analysis
  - frontend/typescript/runtime-validation-and-parse-dont-validate
  - frontend/typescript/tsconfig-strictness-and-project-references

resources:
  - title: The any type
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any
    source: TypeScript
    type: docs
    minutes: 10
    primary: true
  - title: unknown
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown
    source: TypeScript
    type: docs
    minutes: 15
  - title: satisfies operator
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html
    source: TypeScript
    type: docs
    minutes: 20
---

## In one line

`any` switches the checker off, `unknown` switches it on and demands a check, `never` marks the impossible, and `satisfies` validates without widening.

## What it is

**`any` is contagious.** It is not "some type" — it is an instruction to stop checking, and the absence of checking propagates: every property access, call, and derived value from an `any` is also `any`. One `any` at a boundary can silently disable type safety across a whole module. `noImplicitAny` catches the accidental ones; the deliberate ones deserve a comment explaining why.

**`unknown` is the honest version.** It says "a value exists and I don't know its type", and the compiler refuses every operation until you narrow it. That makes it the correct type for `JSON.parse`, `catch` clause bindings (with `useUnknownInCatchVariables`), and any external input. The pattern is unknown at the boundary, narrow once with a predicate or a schema, and a known type inward.

**`never` is the empty type** — no value has it. It shows up in three useful places: the return type of a function that never returns normally (throws or loops forever); the exhaustiveness check where assigning a supposedly-impossible value to `never` fails to compile if the union grew; and as the result of an impossible intersection, which is often the real explanation for a confusing "not assignable to never" error.

**`satisfies`** solves the widening problem. Annotating `const config: Record<string, string> = {...}` checks the value but throws away the specific keys, so `config.host` is just `string` and typos in key names are not caught downstream. Writing `const config = {...} satisfies Record<string, string>` validates against the constraint while keeping the literal type, so keys stay known and values stay narrow. It has largely replaced the `as const` plus helper-function trick for typed configuration objects.

The related pair: **`as` is an assertion, not a conversion** — it tells the compiler you know better and produces no runtime check, so a wrong `as` is a runtime error the type system promised would not happen. And **`as const`** freezes a literal to its narrowest type, which is what makes a tuple stay a tuple and a string stay that exact string.

## Why it matters

Codebase health is largely a question of how these are used: `any` at boundaries means the types are decorative, while `unknown` plus validation means they mean something.

`satisfies` is also a currency check — it landed in 4.9 and is the modern answer to a problem people still solve with awkward workarounds.

## Key points

- `any` disables checking and spreads through everything derived from it; each deliberate use deserves justification.
- `unknown` is the correct boundary type — it forces a narrowing step before use.
- `never` marks unreachable code and powers exhaustiveness checks via assignment in a default branch.
- An unexpected `never` usually means an impossible intersection, not a mistake in your check.
- `satisfies` validates a value against a type while preserving its narrow inferred type.
- `as` is an unchecked claim with no runtime effect; `as const` narrows literals and makes tuples stay tuples.
