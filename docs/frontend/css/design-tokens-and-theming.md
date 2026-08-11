---
title: Design Tokens & Theming
summary: Custom properties as a runtime theming layer, the two-tier token model, and switching themes without a flash.
level: core
minutes: 20
order: 5
tags: [css, design-systems, theming]

related:
  - frontend/architecture/design-systems
  - frontend/architecture/theming-and-multi-tenant-ui
  - frontend/css/styling-architecture-tradeoffs

resources:
  - title: Using CSS custom properties
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Design tokens
    url: https://www.designtokens.org/
    source: Design Tokens Community Group
    type: docs
    minutes: 20
  - title: prefers-color-scheme
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
    source: MDN
    type: docs
    minutes: 10
---

## In one line

CSS custom properties are the only styling mechanism that is both cascading and live at runtime, which makes them the right substrate for tokens and the only clean way to theme without rebuilding.

## What it is

The distinction from a preprocessor variable is the whole reason this works. A Sass variable is substituted at build time and is gone; a custom property exists in the CSSOM, inherits down the tree, can be overridden per subtree, and can be read and written from JavaScript. That is what allows one component to render differently inside a themed container without any knowledge of the theme.

**Two tiers** is the model that scales. *Primitive* tokens are raw values — `--blue-500: #3b82f6`. *Semantic* tokens name intent — `--color-action: var(--blue-500)`, `--color-danger`, `--surface-raised`. Components reference only semantic tokens. That indirection is what makes a rebrand a change to one file rather than a search across the codebase, and it is what lets dark mode redefine meaning rather than colour.

**Theming** then falls out. Redefine the semantic layer under a selector or attribute — `[data-theme='dark'] { --color-action: ... }` — and everything downstream updates with no re-render. Multi-tenant white-labelling works the same way with tenant tokens injected on a wrapper.

Two operational details decide whether it feels good.

**The flash of wrong theme** is the classic bug: the page renders light, then JavaScript reads the stored preference and switches. The fix is a small blocking inline script in the head that sets the attribute before first paint — one of the few legitimate uses of a synchronous script. Where the theme follows the OS with no override, `prefers-color-scheme` alone avoids the problem entirely.

**Fallbacks and typing.** `var(--x, fallback)` covers an undefined token. `@property` lets you declare a custom property's type, initial value, and inheritance — which is what makes gradients and numeric values animatable, since untyped custom properties cannot be interpolated.

Finally, tokens should come from one source. A JSON or DTCG token file that generates CSS variables, Tailwind config, and native platform values keeps design and code from drifting — Style Dictionary is the usual tool.

## Why it matters

Every design system reaches this, and the two-tier split is the difference between a system that survives a rebrand and one that gets rewritten.

Dark mode, white-labelling, and density modes are all common product requirements that this one mechanism covers.

## Key points

- Custom properties are runtime and cascading, unlike preprocessor variables — that is what enables theming.
- Split primitive values from semantic intent, and let components reference only the semantic layer.
- Theme by redefining semantic tokens under a selector or attribute; nothing re-renders.
- Prevent the theme flash with a blocking inline script that sets the attribute before first paint.
- `prefers-color-scheme` alone avoids the flash when there is no user override.
- `@property` types a custom property and is what makes it animatable.
- Generate CSS, Tailwind config, and platform values from one token source to prevent drift.
