---
title: Containing Blocks, Stacking & Formatting Contexts
summary: The invisible boxes that decide where position:fixed anchors, what z-index compares against, and why margins collapse.
level: deep
minutes: 25
order: 3
tags: [css, layout, positioning]

related:
  - frontend/css/flexbox-and-grid-layout-models
  - frontend/react/portals-and-rendering-outside-the-tree
  - frontend/browser-platform/compositing-and-gpu-layers

resources:
  - title: Layout and the containing block
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Containing_block
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Stacking context
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context
    source: MDN
    type: docs
    minutes: 25
  - title: Block formatting context
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_formatting_context
    source: MDN
    type: docs
    minutes: 20
---

## In one line

Three separate invisible mechanisms — the containing block, the stacking context, and the formatting context — explain most CSS behaviour that looks like a browser bug.

## What it is

**The containing block** is what percentages and offsets resolve against. For a static element it is the nearest block ancestor's content box. For `position: absolute` it is the nearest ancestor with a `position` other than `static`. For `position: fixed` it is normally the viewport — **except** that a `transform`, `filter`, `perspective`, `backdrop-filter`, `will-change`, or `contain: paint` on any ancestor makes that ancestor the containing block instead. That exception is why a fixed header suddenly scrolls with a container: someone added a transform three levels up. It is one of the most-encountered and least-understood behaviours in CSS.

**A stacking context** is a self-contained z-ordering group. Inside it, `z-index` values compete; between contexts, only the contexts' own order matters — so a child with `z-index: 9999` can never escape a parent whose context sits below another. Contexts are created by the root element, by positioned elements with a `z-index`, and — the surprising ones — by `opacity` less than 1, `transform`, `filter`, `mix-blend-mode`, `isolation: isolate`, and by flex or grid children with a `z-index`. Escalating z-index numbers is the symptom; the fix is finding the context boundary, and `isolation: isolate` is the tool for deliberately creating one.

**A block formatting context** is an independent layout region. Inside one, floats are contained, margins do not collapse with the outside, and the box does not overlap floats. `overflow` other than `visible`, `display: flow-root`, flex and grid containers, and `contain: layout` all create one. `display: flow-root` exists specifically to create a BFC without the side effects of the old `overflow: hidden` clearfix.

**Margin collapsing** is the last of the three: adjacent vertical margins between siblings, and between a parent and its first or last child, merge into the larger of the two rather than summing. It does not happen in flex or grid containers, or across a BFC boundary — which is why the behaviour seems to disappear in modern layouts and reappears in a plain block one.

## Why it matters

These four mechanisms account for the majority of CSS behaviour that gets reported as inexplicable — the fixed element that isn't fixed, the z-index that does nothing, the margin that vanished.

They are also why portals exist: escaping a stacking or containing context is not possible with CSS, so the element has to move in the DOM.

## Key points

- `position: fixed` anchors to the viewport unless an ancestor has a transform, filter, or containment — then it anchors there.
- Percentages and absolute offsets resolve against the containing block, not the visual parent.
- `z-index` only competes within a stacking context; a child cannot escape its parent's position in the parent's context.
- `opacity`, `transform`, `filter`, and `isolation` all create stacking contexts, often unintentionally.
- A block formatting context contains floats and stops margin collapsing; `display: flow-root` creates one cleanly.
- Vertical margins collapse between siblings and through parent edges — but not in flex or grid.
