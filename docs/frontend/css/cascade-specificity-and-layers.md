---
title: Cascade, Specificity & Layers
summary: How the browser picks a winning declaration, and how @layer finally makes that predictable at scale.
level: core
minutes: 25
order: 1
tags: [css, cascade, fundamentals]

related:
  - frontend/css/styling-architecture-tradeoffs
  - frontend/css/css-at-scale
  - frontend/browser-platform/dom-and-cssom-as-apis

resources:
  - title: Cascade, specificity, and inheritance
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts
    source: MDN
    type: docs
    minutes: 30
    primary: true
  - title: "@layer"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
    source: MDN
    type: docs
    minutes: 25
  - title: CSS Cascade Layers
    url: https://css-tricks.com/css-cascade-layers/
    source: CSS-Tricks
    type: article
    minutes: 25
---

## In one line

When several rules target the same element, the cascade decides in a fixed order — origin and importance, then layer, then specificity, then source order — and `@layer` inserts a step you control before specificity ever matters.

## What it is

The resolution order is worth memorising because every "why isn't my style applying?" is a step in it. First **origin and importance**: author styles beat user-agent defaults, and `!important` inverts the whole ordering, which is why an `!important` in a library is so hard to override. Then **cascade layers**, in declaration order. Then **specificity**. Then **source order**, last one wins.

**Specificity** is three numbers — ids, then classes/attributes/pseudo-classes, then elements/pseudo-elements — compared left to right, and it does not carry: eleven classes never beat one id. Inline styles sit above all of it, and `!important` above that. The practical consequence is that specificity wars are unwinnable, which is why the historic answer was BEM-style flat class naming and near-zero nesting.

**`@layer` changes the calculus.** Declaring `@layer reset, base, components, utilities;` fixes the priority order up front; a rule in a later layer beats a rule in an earlier one **regardless of specificity**. A single class in `utilities` overrides a three-selector rule in `components`. Unlayered styles win over all layers, which is a deliberate design so incremental adoption works.

That solves the two long-standing problems: third-party CSS can be quarantined into an early layer where your own styles reliably win, and utility classes can override components without `!important`.

Three related tools. **`:where()`** contributes zero specificity, so `:where(.card) p` is easy to override — libraries use it for defaults. **`:is()`** takes the specificity of its most specific argument, which is occasionally a surprise. And **native nesting** now works without a preprocessor, with the same caution as always: nesting generates specificity, and deep nesting recreates the problem layers exist to solve.

Finally, `!important` is not always wrong — in a utility layer or a user stylesheet it is the correct tool. It is wrong as a way of winning a fight you created.

## Why it matters

Every CSS bug that starts "this should be overriding" ends in the cascade, and most large-codebase CSS pain is specificity escalation over time.

Layers are also a currency signal: they are widely supported now and reframe an argument the ecosystem had for a decade.

## Key points

- Resolution order: origin and importance, then layer, then specificity, then source order.
- Specificity is ids / classes / elements compared in order and never carries — no number of classes beats an id.
- `@layer` makes layer order beat specificity, so a later layer wins regardless of selector weight.
- Unlayered styles outrank all layers, which is what makes incremental adoption safe.
- Put third-party CSS in an early layer to make your overrides reliable without `!important`.
- `:where()` adds zero specificity; `:is()` takes its most specific argument's.
- Native nesting still generates specificity — nest shallowly.
