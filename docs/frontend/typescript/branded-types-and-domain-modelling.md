---
title: Branded Types & Domain Modelling
summary: Making the type system distinguish a UserId from an OrderId, and encoding invariants so illegal values cannot be constructed.
level: deep
minutes: 20
order: 9
tags: [typescript, modelling, correctness]

related:
  - frontend/typescript/structural-typing-and-assignability
  - frontend/state-and-data/ui-state-machines
  - frontend/typescript/runtime-validation-and-parse-dont-validate

resources:
  - title: Branded Types
    url: https://www.learningtypescript.com/articles/branded-types
    source: Learning TypeScript
    type: article
    minutes: 15
    primary: true
  - title: Parse, don't validate
    url: https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
    source: Alexis King
    type: article
    minutes: 25
  - title: Type Compatibility
    url: https://www.typescriptlang.org/docs/handbook/type-compatibility.html
    source: TypeScript
    type: docs
    minutes: 25
---

## In one line

Structural typing makes every id a `string`, so passing an order id where a user id belongs compiles fine — branding adds a phantom property that makes them distinct without changing the runtime value.

## What it is

The technique is an intersection with a marker that exists only at the type level:

```ts
type Brand<T, B> = T & { readonly __brand: B }
type UserId = Brand<string, 'UserId'>
```

At runtime a `UserId` is just a string — no wrapper, no cost. At compile time it is incompatible with `OrderId` and with plain `string`, so the argument-order mistake becomes an error. Using a unique symbol as the brand key avoids collisions between two libraries that both brand.

Because a branded value cannot be created by assignment, you need a **constructor** — and that is the real benefit rather than a side effect. `function toUserId(s: string): UserId` is the single place validation happens, and the type then carries the guarantee onward. That is "parse, don't validate" in miniature: convert unknown input into a type whose existence proves the check ran, once, at the edge.

The natural applications: identifiers of different kinds, validated formats (`Email`, `Url`, `NonEmptyString`), units (`Meters` versus `Feet` — the Mars Climate Orbiter class of bug), and safety-critical distinctions like `SanitizedHtml` versus `RawHtml`, where the type makes it impossible to render the unsanitised one by accident.

Domain modelling more broadly uses the same instinct: **make illegal states unrepresentable**. A discriminated union instead of four booleans. A non-empty array type instead of a runtime length check. An optional field that only exists on the variant that owns it, rather than `null` everywhere.

Two costs to weigh. **Ceremony**: every branded value needs a constructor and the boundaries need explicit conversion, which is friction. And **over-application**: branding every string in the codebase makes it hostile. Brand the values where confusion is plausible and the consequence is real — ids, money, units, sanitised content — and leave the rest alone.

Zod and similar libraries have a `.brand()` that produces the same type from a schema, which is the least-ceremony way to get both the runtime check and the branded type from one declaration.

## Why it matters

Passing the wrong id is a real bug class that structural typing cannot catch, and it is silent — the code runs, it just queries the wrong record.

It is also a strong design-round answer: "how would you prevent that at compile time?" answered with a brand and a parsing constructor demonstrates thinking about correctness rather than tests.

## Key points

- Structural typing makes all ids interchangeable; branding adds a phantom property to separate them.
- The brand exists only in the type — no runtime wrapper, no performance cost.
- A branded type forces a constructor, which becomes the single place validation happens.
- Good candidates: id kinds, validated formats, units, and sanitised-versus-raw content.
- The broader goal is making illegal states unrepresentable — unions over boolean combinations.
- Brand selectively; branding everything adds ceremony without proportionate benefit.
- Schema libraries can emit branded types directly, giving the runtime check and the type together.
