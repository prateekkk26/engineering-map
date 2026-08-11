---
title: Building Accessible Components
summary: What it actually takes to make a custom widget work, and why a headless library is usually the right answer.
level: core
minutes: 25
order: 7
tags: [accessibility, components, design-systems]

related:
  - frontend/accessibility/aria-and-when-not-to-use-it
  - frontend/accessibility/keyboard-navigation-and-focus-management
  - frontend/architecture/design-systems

resources:
  - title: ARIA Authoring Practices Guide — Patterns
    url: https://www.w3.org/WAI/ARIA/apg/patterns/
    source: W3C
    type: docs
    minutes: 40
    primary: true
  - title: React Aria
    url: https://react-spectrum.adobe.com/react-aria/index.html
    source: Adobe
    type: docs
    minutes: 30
  - title: Radix Primitives
    url: https://www.radix-ui.com/primitives/docs/overview/introduction
    source: Radix UI
    type: docs
    minutes: 25
---

## In one line

A custom widget needs role, name, state, full keyboard interaction, and focus management — which is weeks of work per component, and the reason headless libraries exist.

## What it is

Take a combobox as the honest example. It needs: `role="combobox"` with correct `aria-expanded`, `aria-controls` and `aria-activedescendant`; a listbox with `role="option"` and `aria-selected`; arrow keys to move through options; Enter to select; Escape to close and restore the input; Home and End; typeahead; focus kept on the input while the visual highlight moves; correct announcement of the option count and the highlighted option; and behaviour that is consistent across NVDA, JAWS and VoiceOver, which differ meaningfully. That is not a day's work, and every part of it has a subtle failure mode.

**The APG is the specification** for these patterns. It documents dialog, combobox, tabs, menu, tree, grid, disclosure, and the rest — including the exact keyboard interaction, which is the part most implementations get wrong. Reading the pattern before building is what turns a plausible-looking widget into a correct one.

**Which is why the right default is a headless library.** Radix, React Aria and Base UI implement the behaviour and accessibility and leave the styling entirely to you. They have been tested against real assistive technology across browsers, which is the expensive part. Building from scratch is justified when you have unusual requirements and the time to test properly — rarely otherwise.

**When you do build**, four things carry most of the weight. Start from **native elements** wherever one exists — `<details>`, `<dialog>`, `<select>` — because they bring platform behaviour for free. Get **focus management** right: into the widget, trapped where appropriate, and restored on close. Follow the **keyboard model** for composite widgets, which is arrow keys inside and one tab stop for the whole thing. And **announce state changes** through ARIA state attributes rather than by rewriting text.

**Test the thing, not the markup.** Automated checks confirm attributes are present, not that the interaction works. Use the widget with a keyboard only, then with a real screen reader, then check it at 200% zoom. Fifteen minutes of that finds what an hour of reading the spec does not.

Two cautions. A **component that is accessible in isolation can break in context** — duplicate ids, a nested landmark, a focus trap inside another trap. And **document the accessibility contract** for consumers: which props are required for a label, and what they must not remove.

## Why it matters

Shared components multiply everything: an accessible button makes every screen using it better, and an inaccessible one is a defect replicated across the product.

It is also a common practical-round task — "build a modal", "build an autocomplete" — where the accessibility work, not the rendering, is what separates answers.

## Key points

- A custom widget needs role, name, state, full keyboard support, and focus management — all of it manual.
- The APG specifies each pattern including keyboard interaction, which is what most implementations get wrong.
- Headless libraries provide the tested behaviour; styling is the part you should be writing.
- Start from a native element whenever one exists.
- Composite widgets use arrow keys internally with a single tab stop.
- Automated checks verify attributes, not interaction — test by keyboard and with a real screen reader.
- Components accessible in isolation can break in composition; document the contract for consumers.
