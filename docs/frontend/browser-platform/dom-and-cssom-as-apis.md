---
title: The DOM & CSSOM as APIs
summary: What the DOM actually is, which operations are cheap, and the reading APIs that quietly force the browser to do work.
level: core
minutes: 20
order: 2
tags: [browser, dom, performance]

related:
  - frontend/browser-platform/layout-thrashing-and-forced-reflow
  - frontend/react/react-mental-model
  - frontend/browser-platform/the-event-model

resources:
  - title: Document Object Model
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
    source: MDN
    type: docs
    minutes: 30
    primary: true
  - title: CSSOM
    url: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model
    source: MDN
    type: docs
    minutes: 20
  - title: DocumentFragment
    url: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
    source: MDN
    type: docs
    minutes: 10
---

## In one line

The DOM is a live tree of objects with a language-agnostic API, and its cost is not the objects — it is that reading certain properties forces the browser to finish work it was deferring.

## What it is

The DOM is not HTML and it is not JavaScript. It is a specified interface onto the parsed document, exposed to JavaScript in a browser but defined independently. That is why its APIs feel unlike JavaScript's own: `NodeList` is not an array, `HTMLCollection` is *live* and updates as the document changes, and iterating one while mutating the document is a classic infinite loop.

"The DOM is slow" is a folk belief that misplaces the cost. Creating an element or setting `textContent` is a cheap object operation. What is expensive is **synchronous layout**: the browser batches style and layout work, and reading a property that depends on geometry — `offsetWidth`, `getBoundingClientRect()`, `scrollTop`, `getComputedStyle()` — forces it to flush everything pending right now, in the middle of your function.

Which is why the two useful habits are batching and separating. Build a subtree in a `DocumentFragment` and insert it once, so one reflow instead of fifty. And separate reads from writes: do all the measuring, then all the mutating, rather than alternating.

The CSSOM is the same idea for styles: `document.styleSheets`, `CSSStyleDeclaration`, and the rules the cascade produced. `element.style` reads and writes inline styles only, while `getComputedStyle()` returns the resolved value after the cascade — and forces layout to do it. CSS custom properties are the modern lever here: setting one property on a container can restyle a whole subtree without touching individual elements, which is how theming is done efficiently.

Two APIs worth knowing because they replace hand-rolled versions: `element.closest()` for ancestor matching, and `matches()` for delegation checks.

Frameworks exist largely to spare you this: React's diff produces a batch of mutations applied in one commit, which is the same batching discipline enforced by the architecture. Knowing the underlying cost is what lets you understand why the commit phase is synchronous and why measuring in `useLayoutEffect` is expensive.

## Why it matters

Every framework sits on this, and the moment you write a canvas interaction, a drag handler, a virtualised list, or integrate a non-React library, you are back here directly.

"Why is the DOM slow?" is also a common interview question where the expected answer is about forced synchronous layout, not about object allocation.

## Key points

- The DOM is a specified interface onto the document, not part of JavaScript — hence the non-array collections.
- `HTMLCollection` is live and `NodeList` from `querySelectorAll` is static; mutating while iterating a live one is a real bug.
- Creating and inserting nodes is cheap; reading geometry is expensive because it forces pending layout to flush.
- Batch insertions with `DocumentFragment` and group reads separately from writes.
- `getComputedStyle` resolves the cascade and triggers layout; `element.style` only sees inline styles.
- CSS custom properties let one write restyle a subtree, which is the efficient way to theme.
