---
title: Shadow DOM & Web Components
summary: Real style and DOM encapsulation in the platform, what it costs in practice, and where it beats a React component.
level: deep
minutes: 25
order: 9
tags: [browser, components, encapsulation]

related:
  - frontend/architecture/design-systems
  - frontend/browser-platform/dom-and-cssom-as-apis
  - frontend/css/styling-architecture-tradeoffs

resources:
  - title: Web Components
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
    source: MDN
    type: docs
    minutes: 30
    primary: true
  - title: Using shadow DOM
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM
    source: MDN
    type: docs
    minutes: 25
  - title: Lit
    url: https://lit.dev/docs/
    source: Lit
    type: docs
    minutes: 30
---

## In one line

Custom elements plus shadow DOM give you a component the platform understands, with style encapsulation no CSS convention can match — and an interop cost that decides whether it is worth it.

## What it is

Three pieces make up the standard. **Custom elements** register a class against a tag name, with lifecycle callbacks (`connectedCallback`, `attributeChangedCallback`). **Shadow DOM** attaches a separate tree to an element whose internals are hidden from the outer document. **Templates** (`<template>`, `<slot>`) provide inert markup and content projection.

Shadow DOM is the substantive part. Styles inside do not leak out, and page styles do not leak in — genuine encapsulation enforced by the browser, not by a naming convention or a hashed class name. `querySelector` from outside does not find shadow content. Slots project light DOM children into the shadow tree, which is `children` at the platform level.

The controlled boundary is the point: only what you allow crosses. CSS custom properties inherit through, so themes work. `::part()` exposes named internals for external styling. Everything else is sealed.

Where this genuinely wins is a **design system consumed by applications you do not control** — several frameworks, several versions, or an embeddable widget dropped into a customer's page where their CSS would otherwise wreck yours. That is a real problem with no good CSS-only solution, which is why Salesforce, Adobe, GitHub and others ship web components.

The costs are equally real. Server rendering is awkward (Declarative Shadow DOM helps but is not universal). Forms need `ElementInternals` to participate properly. Accessibility across the boundary is fiddly, because `aria-labelledby` cannot reference an id in another tree. React support only became clean in React 19, which finally passes properties and handles custom events sensibly. And global styling — including Tailwind — does not reach inside, by design.

For an application team using one framework, a React component is simpler and better integrated. The judgement is about audience: many consumers, or one.

## Why it matters

This appears in JDs at companies with a platform or design-system team, and "when would you use a web component instead of a React component?" is a clean architecture question with a clear right answer about framework-independent consumers.

Knowing the mechanics also demystifies the React 19 changelog and explains why some third-party widgets behave oddly inside your app.

## Key points

- Custom elements, shadow DOM, and templates are three separable standards — you can use custom elements without shadow DOM.
- Shadow DOM gives browser-enforced style encapsulation in both directions, which no class-naming convention achieves.
- Slots are the platform's `children`; CSS custom properties and `::part()` are the deliberate holes in the wall.
- The strong case is a design system or widget consumed by codebases and frameworks you do not control.
- Costs: awkward SSR, form participation via `ElementInternals`, cross-boundary ARIA, and no global CSS reach.
- React 19 fixed the long-standing interop problems with properties and custom events.
