---
title: Keyboard Navigation & Focus Management
summary: Making everything reachable and operable without a mouse, and moving focus deliberately when the UI changes.
level: core
minutes: 25
order: 3
tags: [accessibility, keyboard, focus]

related:
  - frontend/accessibility/building-accessible-components
  - frontend/react/portals-and-rendering-outside-the-tree
  - frontend/accessibility/semantic-html-and-the-accessibility-tree

resources:
  - title: Keyboard navigation
    url: https://webaim.org/techniques/keyboard/
    source: WebAIM
    type: article
    minutes: 25
    primary: true
  - title: Managing focus
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets
    source: MDN
    type: docs
    minutes: 25
  - title: Dialog (Modal) Pattern
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
    source: W3C ARIA APG
    type: docs
    minutes: 25
---

## In one line

Everything interactive must be reachable by Tab and operable by keyboard, and whenever the UI changes structurally, focus has to be moved somewhere sensible on purpose.

## What it is

**Tab order follows the DOM**, so the visual order should match the source order — a CSS reorder that puts a control visually first while it remains last in the DOM produces a confusing sequence. `tabindex="0"` adds a non-native element to the natural order, `tabindex="-1"` makes something focusable programmatically but not by tabbing, and **positive `tabindex` values are an anti-pattern**: they jump ahead of the entire natural order and are nearly impossible to maintain.

**Focus indicators are not optional.** `outline: none` without a replacement is the single most common accessibility defect on the web. `:focus-visible` gives the modern behaviour — an indicator for keyboard focus, none for mouse clicks — and the indicator needs sufficient contrast against both the element and its background.

**Focus management** is the part frameworks make easy to forget, because the DOM changes without the user acting on the element that changed. The recurring cases: **opening a dialog** moves focus into it, traps it while open, and returns it to the trigger on close; **route changes** in a single-page app should move focus to the new page's heading or main landmark, or a screen reader user hears nothing and stays where they were; **deleting a list item** should move focus to a sibling rather than letting it fall to the body; and **revealing content** should either move focus to it or announce it.

**Escape hatches for keyboard users** matter as much as the mechanics. A skip link as the first focusable element lets someone bypass a long navigation. Escape should close anything transient. And nothing should trap focus except a modal dialog — a widget you cannot tab out of is a dead end.

**Composite widgets** use a different model. Inside a tab list, a menu, or a grid, arrow keys move between items and Tab moves in and out of the whole widget, with a single tab stop — the roving tabindex pattern. Tabbing through twenty menu items is a failure of the pattern, not an implementation detail.

Two practical notes. The **`inert` attribute** is now the clean way to make background content unreachable while a modal is open, replacing hand-rolled focus traps. And **test by unplugging the mouse** — five minutes of keyboard-only use finds more than an hour of reading specifications.

## Why it matters

Keyboard access is the foundation that screen reader use, switch access, and voice control all build on — if it does not work by keyboard, it does not work for any of them.

It is also heavily represented in WCAG level A, which makes it the baseline for legal compliance rather than an enhancement.

## Key points

- Tab order follows DOM order; keep visual order aligned and never use positive `tabindex`.
- Never remove focus outlines without a replacement — use `:focus-visible` with adequate contrast.
- Move focus deliberately on dialog open and close, route change, item deletion, and content reveal.
- Provide a skip link, make Escape close transient UI, and trap focus only in modal dialogs.
- Composite widgets use arrow keys internally with one tab stop — the roving tabindex pattern.
- `inert` makes background content unreachable and replaces hand-rolled traps.
- Unplug the mouse and use the product — it finds more than reading the spec.
