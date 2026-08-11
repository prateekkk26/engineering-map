---
title: Template Literal Types & Key Remapping
summary: Building and parsing string types at the type level, and renaming keys while mapping — the basis of typed event names and route params.
level: deep
minutes: 20
order: 6
tags: [typescript, type-system, advanced]

related:
  - frontend/typescript/conditional-and-mapped-types
  - frontend/typescript/infer-and-type-level-programming
  - frontend/typescript/branded-types-and-domain-modelling

resources:
  - title: Template Literal Types
    url: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
    source: TypeScript
    type: docs
    minutes: 25
    primary: true
  - title: Key Remapping via as
    url: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as
    source: TypeScript
    type: docs
    minutes: 15
  - title: TypeScript 4.1 release notes
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html
    source: TypeScript
    type: docs
    minutes: 20
---

## In one line

Template literal types let the type system build and destructure string literals, which turns conventions like `onClick` or `/users/:id` into things the compiler can check.

## What it is

The syntax mirrors runtime template strings: `` type Greeting = `hello ${string}` ``. Combined with unions it multiplies out — `` `${'get'|'set'}${Capitalize<'name'|'age'>}` `` produces four literal types. That cross-product is the mechanism behind typed event names, CSS property unions, and generated API surfaces.

Four intrinsic helpers come with it: `Uppercase`, `Lowercase`, `Capitalize`, and `Uncapitalize`. They exist precisely because naming conventions in JavaScript are case transformations.

**Key remapping** is the other half. A mapped type can rename as it iterates using an `as` clause: `{ [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] }` turns a data shape into a getter interface. Returning `never` from the `as` clause **removes** the key, which is how conditional filtering of properties is done — "all the string-valued keys" is a one-liner.

Parsing is where it gets genuinely useful. With `infer` inside a template pattern, the type system can pull structure out of a string: extracting `:id` and `:slug` from `/users/:id/posts/:slug` gives you typed route parameters derived from the route itself, with no duplication and no drift. The same technique types query-string keys, i18n message placeholders, and CSS-in-JS property names.

Two limits are worth respecting. **Combinatorial explosion** is real — a template over three unions of ten members each is a thousand-member union, and the compiler will slow down or refuse. And **error messages** on a failed template match are unhelpful, often listing an enormous union of candidates, so keep the patterns shallow.

The practical judgement: use these where a string convention already exists and the alternative is manual duplication. Do not invent a convention just to encode it in types.

## Why it matters

This is the machinery behind the type safety in modern routing libraries, tRPC, and typed i18n — reading their types requires it, and diagnosing a failure requires it more.

For interviews it is a depth signal rather than a daily tool: being able to explain how a router infers `{ id: string }` from a path string shows you understand the type system as a language.

## Key points

- Template literal types build string types, and unions inside them produce the cross-product.
- `Uppercase`, `Lowercase`, `Capitalize`, and `Uncapitalize` cover the case conventions JavaScript relies on.
- Key remapping with `as` renames keys during a mapped type; returning `never` deletes them.
- `infer` inside a template pattern parses structure out of a string — this is how typed route params work.
- Combinatorial blowup is a real limit; keep unions small in template positions.
- Failed matches produce poor errors, so prefer shallow patterns and named helpers.
- Encode conventions that already exist; do not create one for the sake of the type trick.
