---
title: Coercion, Equality & Number Precision
summary: The conversion rules behind JavaScript's most-mocked behaviour, and the floating-point limits that cause real money bugs.
level: core
minutes: 20
order: 10
tags: [language, types]

related:
  - frontend/javascript/property-descriptors-and-immutability
  - frontend/typescript/structural-typing-and-assignability

resources:
  - title: Equality comparisons and sameness
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
    source: MDN
    type: docs
    minutes: 18
    primary: true
  - title: "You Don't Know JS Yet: Types & Grammar"
    url: https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/types-grammar
    source: Kyle Simpson
    type: book
  - title: What Every Programmer Should Know About Floating-Point Arithmetic
    url: https://floating-point-gui.de/
    source: floating-point-gui.de
    type: article
    minutes: 15
---

## In one line

Coercion is a small set of deterministic conversion rules, not chaos — and the parts that genuinely bite are number precision and the `==` table, not the meme examples.

## What it is

Coercion happens through three abstract operations. **ToPrimitive** converts an object to a primitive by calling `Symbol.toPrimitive`, then `valueOf`, then `toString` (order depends on the requested hint). **ToNumber** and **ToString** then convert primitives. Every surprising result follows from these applied in order.

`[] + {}` producing `"[object Object]"` isn't arbitrary: `+` with a non-number operand converts both to primitives; `[]` stringifies to `""` and `{}` to `"[object Object]"`. Understanding the mechanism matters more than memorising the outputs, because the mechanism is what shows up in real code — `"5" - 2` is `3` while `"5" + 2` is `"52"`, and a template literal calling `toString` on an object you expected to be a string.

`==` applies coercion before comparing; `===` compares type and value directly. The `==` rules worth actually knowing: `null == undefined` is `true` and neither equals anything else, `NaN` never equals itself, and string/number comparison converts the string to a number. **Use `===` by default.** The one defensible `==` is `x == null` as a null-or-undefined check, and it's common enough in real code to be worth recognising.

`Object.is` differs from `===` in exactly two cases: it treats `NaN` as equal to itself, and distinguishes `+0` from `-0`. That's it. It's what `React.useState` and `Object.freeze`-adjacent comparison logic use internally.

**Truthiness** has a short falsy list: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy — including `[]`, `{}`, and `"0"`. The common bug is `if (count)` failing when `count` is `0`, which is what `??` and `?.` exist to fix. `??` falls back only on `null`/`undefined`, where `||` falls back on any falsy value — the distinction that keeps a legitimate `0` or `""` from being replaced by a default.

**Numbers are IEEE-754 doubles.** `0.1 + 0.2 !== 0.3` is not a JavaScript flaw; it's binary floating point, and every language with doubles does it. The consequences are practical: never store currency as a float — use integer minor units or a decimal library — and be aware that integers above `Number.MAX_SAFE_INTEGER` (2^53 − 1) lose precision, which silently corrupts 64-bit IDs coming from a backend. `BigInt` handles arbitrary-precision integers but doesn't mix with `Number` in arithmetic.

## Why it matters

The floating-point and `MAX_SAFE_INTEGER` parts cause genuine production bugs — a Twitter-style snowflake ID parsed as a `Number` is corrupted before it reaches your code, and totals that are off by a cent come from float arithmetic. Knowing to request IDs as strings is a real senior instinct.

The `==` and truthiness material is standard screen fodder, and the `??` versus `||` distinction is the kind of small correctness detail reviewers notice in a take-home.

## Key points

- Coercion is `ToPrimitive` → `ToNumber`/`ToString` applied in a defined order; every surprising result is derivable from those rules rather than special-cased.
- `===` compares type and value with no conversion; `==` converts first, and the only broadly defensible use is `x == null` to test for null-or-undefined together.
- `Object.is` differs from `===` in exactly two places: `NaN` equals itself, and `+0` is distinct from `-0`.
- The falsy list is `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN` — empty arrays and empty objects are truthy.
- `??` falls back only on `null`/`undefined` while `||` falls back on any falsy value, which is why `||` silently replaces a legitimate `0` or empty string.
- All JavaScript numbers are IEEE-754 doubles, so `0.1 + 0.2 !== 0.3` and currency must be handled as integer minor units or with a decimal library.
- Integers beyond `Number.MAX_SAFE_INTEGER` lose precision silently — 64-bit database IDs should cross the wire as strings, not numbers.
- `NaN` is the only value not equal to itself, which is why `Number.isNaN` exists and why `[NaN].includes(NaN)` is `true` while `indexOf` fails to find it.
