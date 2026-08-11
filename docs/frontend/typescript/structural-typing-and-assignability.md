---
title: Structural Typing & Assignability
summary: TypeScript compares shapes, not names — the rule behind excess property checks, surprising compatibility, and most "why does this assign?" questions.
level: core
minutes: 25
order: 1
tags: [typescript, type-system, fundamentals]

related:
  - frontend/typescript/branded-types-and-domain-modelling
  - frontend/typescript/any-unknown-never-and-satisfies
  - frontend/typescript/generics-and-constraints

resources:
  - title: Type Compatibility
    url: https://www.typescriptlang.org/docs/handbook/type-compatibility.html
    source: TypeScript
    type: docs
    minutes: 25
    primary: true
  - title: Object Types
    url: https://www.typescriptlang.org/docs/handbook/2/objects.html
    source: TypeScript
    type: docs
    minutes: 30
  - title: Type Compatibility — TypeScript Deep Dive
    url: https://basarat.gitbook.io/typescript/type-system/type-compatibility
    source: Basarat Ali Syed
    type: book
---

## In one line

Two types are compatible if their shapes are compatible — names are irrelevant — so a `Dog` is assignable to a `Person` if it happens to have the right properties.

## What it is

This is the deepest design decision in the language and the source of most early confusion. In a nominal system (Java, C#), `class Meters` and `class Feet` are distinct because they are declared distinct. In TypeScript they are the same type if their members match. That is what makes the language work with JavaScript's object-literal culture, and it is why type safety in a domain sense needs branding rather than declaration.

Assignability is **directional**: a value is assignable to a target if it has *at least* the target's members. Extra properties are fine, which is what makes composition and duck typing pleasant.

The exception is **excess property checking** on fresh object literals. Assigning `{ name: 'x', typo: 1 }` directly to a variable of type `{ name: string }` errors, even though the same object stored in a variable first assigns cleanly. This is a deliberate heuristic to catch typos at the point of creation, not a change to the assignability rule — and knowing that explains the workaround where assigning through a variable silently succeeds.

**Function compatibility** has its own asymmetries. Parameters are checked bivariantly for method syntax and contravariantly under `strictFunctionTypes` for function-property syntax — meaning a handler taking a broader parameter is safely assignable where one taking a narrower parameter is not. Fewer parameters are always fine, which is why `arr.map(x => x)` works when the callback signature offers three. Return types are covariant.

Two structural consequences worth internalising. **Optional versus missing** differ under `exactOptionalPropertyTypes`: `{ a?: string }` and `{ a: string | undefined }` are not the same type. And **private members make a class nominal** — two classes with identical shapes are incompatible if either has a private field, which is the one nominal escape hatch built into the language.

## Why it matters

Nearly every confusing assignability error resolves once you think in shapes: why an interface satisfies a type it never mentions, why an excess property errors in one position and not another, why a callback with fewer parameters is accepted.

It is also a standard interview question, usually phrased as "what's the difference between structural and nominal typing?", with the follow-up being how to get nominal behaviour when you need it.

## Key points

- Compatibility is by shape, not by name — a type satisfies another it has never heard of.
- Extra properties are allowed; the target's members are a minimum, not an exact match.
- Excess property checking applies only to fresh object literals, which is why assigning via a variable bypasses it.
- `strictFunctionTypes` makes function-property parameters contravariant; method syntax stays bivariant.
- A callback may declare fewer parameters than the signature provides.
- `exactOptionalPropertyTypes` distinguishes an absent property from one explicitly set to `undefined`.
- A private class member makes the class nominal — the only built-in escape from structural comparison.
