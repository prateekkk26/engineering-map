---
title: infer & Type-Level Programming
summary: Extracting types from other types, recursive type computation, and knowing when to stop.
level: deep
minutes: 25
order: 7
tags: [typescript, type-system, advanced]

related:
  - frontend/typescript/conditional-and-mapped-types
  - frontend/typescript/template-literal-types-and-key-remapping
  - frontend/typescript/utility-types-in-practice

resources:
  - title: Inferring Within Conditional Types
    url: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types
    source: TypeScript
    type: docs
    minutes: 20
    primary: true
  - title: Type Challenges
    url: https://github.com/type-challenges/type-challenges
    source: type-challenges
    type: repo
  - title: Recursive conditional types
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types
    source: TypeScript
    type: docs
    minutes: 15
---

## In one line

`infer` declares a type variable inside a conditional's pattern and binds it to whatever matched — pattern matching for types, and the basis of every "extract the X from Y" utility.

## What it is

`type Unwrap<T> = T extends Promise<infer U> ? U : T` reads as: if `T` matches the shape `Promise<something>`, call that something `U` and return it. The same pattern gives you the element type of an array, the return type of a function, the parameters as a tuple, and the resolved value of a nested promise chain. `ReturnType`, `Parameters`, `Awaited`, and `InstanceType` in the standard library are all three-line `infer` conditionals.

**Recursion** turns pattern matching into computation. A conditional type that references itself can walk a structure: `DeepPartial` recurses into nested objects, `Awaited` unwraps chained promises, and tuple types can be processed head-and-tail like a list. TypeScript 4.1 made recursive conditional types officially supported, and 4.5 added tail-call optimisation for the common accumulator pattern — which is what raised the practical recursion limit from a few dozen to around a thousand.

Multiple `infer` positions in one pattern are allowed, and inference to the same variable in multiple positions produces a union (or an intersection in contravariant position) — a subtlety that occasionally does exactly what you want and occasionally explains a baffling result.

The genuinely useful applications are narrow and worth naming: deriving a client's types from a server's route definitions, inferring form field types from a schema, extracting the state shape from a reducer, and typing a builder or fluent API. In each case the alternative is duplicated type declarations that drift.

**The costs are the reason to be disciplined.** Compile time and editor responsiveness degrade with deep recursion over large unions, and users of your types feel it as laggy autocomplete. Error messages become unreadable — a failed match names intermediate computed types nobody can interpret. And the code becomes unmaintainable by anyone who has not done the exercises.

The rule of thumb: type-level programming belongs in libraries and in the seam between systems. Inside application code, a slightly more verbose explicit type is nearly always the better trade.

## Why it matters

Every library that gives you "types derived from your schema" is doing this, and when the inference produces something wrong you have to read the implementation to fix it.

In interviews it is a genuine seniority signal — not because the tricks matter daily, but because knowing when *not* to use them is the judgement being assessed.

## Key points

- `infer` binds a type variable to whatever matched a pattern inside a conditional type.
- `ReturnType`, `Parameters`, `Awaited`, and `InstanceType` are all short `infer` conditionals.
- Recursive conditional types walk structures; 4.5's tail-call optimisation made deep recursion practical.
- Multiple inference sites for one variable produce a union (or intersection in contravariant position).
- The strong use cases are library seams: schema-derived types, route-derived clients, reducer state.
- Deep recursion costs compile time and editor responsiveness, and users feel it as slow autocomplete.
- Prefer an explicit type in application code; save this for where duplication would otherwise drift.
