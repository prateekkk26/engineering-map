---
title: Conditional & Mapped Types
summary: Types that branch and types that transform — the two constructs behind every utility type in the standard library.
level: deep
minutes: 25
order: 5
tags: [typescript, type-system, advanced]

related:
  - frontend/typescript/infer-and-type-level-programming
  - frontend/typescript/utility-types-in-practice
  - frontend/typescript/template-literal-types-and-key-remapping

resources:
  - title: Conditional Types
    url: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
    source: TypeScript
    type: docs
    minutes: 30
    primary: true
  - title: Mapped Types
    url: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
    source: TypeScript
    type: docs
    minutes: 25
  - title: Type-Level TypeScript
    url: https://type-level-typescript.com/
    source: Gabriel Vergnaud
    type: course
    minutes: 60
---

## In one line

A conditional type is a ternary over types (`T extends U ? X : Y`) and a mapped type is a loop over keys — together they generate the entire utility-type library.

## What it is

**Mapped types** iterate: `{ [K in keyof T]: T[K] }` reproduces a type, and modifying the value or the modifiers transforms it. Adding `?` gives you `Partial`, `-?` gives `Required`, `readonly` and `-readonly` do the same for mutability. That is literally how those utilities are defined.

**Conditional types** branch. `T extends string ? A : B` chooses a type based on a relationship. The subtlety that trips everyone is **distribution**: when the checked type is a naked type parameter and the input is a union, the conditional applies to each member separately and the results union back. `ToArray<string | number>` becomes `string[] | number[]`, not `(string | number)[]`. When you do *not* want that, wrapping both sides in a tuple — `[T] extends [U] ? ... : ...` — turns it off. This is the single most common source of confusion in advanced types.

Distribution is also a tool. `Exclude<T, U>` is defined as `T extends U ? never : T`, relying on distribution plus the fact that `never` disappears from a union.

The two combine constantly. A mapped type whose value is a conditional gives you "make every function-valued property optional"; a mapped type with a `as` clause in the key position gives you renaming (covered under key remapping).

Two practical cautions. **Error messages degrade fast** — a deeply nested conditional produces output that names intermediate types nobody can trace, so keep helpers small and named. And **compile time is real**: recursive conditional types over large unions can make an editor sluggish, and TypeScript enforces a recursion depth limit that a naive implementation will hit.

The judgement call is when to stop. Type-level programming is genuinely powerful and genuinely a maintenance liability; a library that infers a route's parameters from its path string is worth it, a business object with five layers of conditional transformation usually is not.

## Why it matters

Reading these is required to use any well-typed library — React Query, tRPC, Zod, and the standard utilities are all built from them, and an error message will eventually make you read the definition.

They also come up in senior interviews as a depth probe: implementing `Partial` or `Pick` from scratch is a five-line answer that demonstrates real understanding of the type system.

## Key points

- Mapped types loop over `keyof T`; modifier changes (`?`, `-?`, `readonly`, `-readonly`) produce the standard utilities.
- Conditional types branch on assignability and are the other half of every derived type.
- A naked type parameter distributes over unions — often what you want, occasionally surprising.
- Wrap both sides in tuples (`[T] extends [U]`) to disable distribution.
- `Exclude` works by distributing and letting `never` vanish from the resulting union.
- Keep helpers small and named; nested conditionals produce unreadable errors.
- Watch compile time — recursive types over big unions slow the editor and hit depth limits.
