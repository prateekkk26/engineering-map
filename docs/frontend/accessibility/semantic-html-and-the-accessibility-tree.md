---
title: Semantic HTML & the Accessibility Tree
summary: What assistive technology actually consumes, and why the right element is worth more than any amount of ARIA.
level: core
minutes: 25
order: 1
tags: [accessibility, html, semantics]

related:
  - frontend/accessibility/aria-and-when-not-to-use-it
  - frontend/accessibility/building-accessible-components
  - frontend/testing/component-testing-with-rtl

resources:
  - title: Accessibility tree
    url: https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree
    source: MDN
    type: docs
    minutes: 20
    primary: true
  - title: HTML — A good basis for accessibility
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML
    source: MDN
    type: docs
    minutes: 30
  - title: The A11Y Project checklist
    url: https://www.a11yproject.com/checklist/
    source: The A11Y Project
    type: docs
    minutes: 25
---

## In one line

Browsers build a parallel accessibility tree from your markup — each node carrying a role, a name, a value and a state — and that tree, not the DOM, is what a screen reader reads.

## What it is

Every element maps to an accessibility node with four properties. **Role** is what the thing is (button, link, heading, checkbox). **Name** is how it is identified — usually its text content, or a label. **Value** is its current content where applicable. **State** covers checked, expanded, disabled, selected, invalid.

Native elements populate all four automatically. `<button>Save</button>` produces role `button`, name "Save", and states for disabled and pressed, along with keyboard activation via Enter and Space, focusability, and platform-appropriate announcement. A `<div onClick>` produces a node with no role and no name, is not focusable, and cannot be activated from a keyboard — and reproducing what the button gave you free takes a `role`, a `tabindex`, key handlers for two keys, and an `aria-disabled` you must also enforce.

That is the whole argument for semantic HTML: **the right element is the accessible implementation**, already tested across every browser and assistive technology combination.

**Structure is navigation.** Screen reader users move by landmark and by heading far more than they read linearly. `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>` create landmarks; a correct heading hierarchy — one `h1`, no skipped levels — creates an outline they can jump through. Headings chosen for font size instead of level break that outline, which is why the visual size should come from CSS.

**Lists, tables and forms** carry structure too: a list announces its item count, a table with `<th>` and `scope` lets a user query which column a cell belongs to, and `<fieldset>` with `<legend>` groups related controls. Replacing any of these with styled divs discards information that cannot be recovered with ARIA alone.

Two details worth knowing. **`display: none` and `visibility: hidden` remove an element from the tree**, while `opacity: 0` and off-screen positioning do not — which is why a "hidden" element can still be read out and focused. And **inspect the tree** rather than guessing: Chrome DevTools' Accessibility pane shows the computed role, name and state for any element, and is the fastest way to check what you actually built.

## Why it matters

Most accessibility failures are markup failures, and the cheapest fix in the field is replacing a div with the element that already does the job.

It also has a direct testing dividend: a component queryable by role and accessible name is one that assistive technology can find, which is why Testing Library's query priority doubles as an accessibility check.

## Key points

- Assistive technology reads the accessibility tree — role, name, value, state — not the DOM.
- Native elements populate all four plus keyboard behaviour; a div requires you to rebuild each part.
- Landmarks and a correct heading hierarchy are how screen reader users navigate, not decoration.
- Choose heading level for structure and set size in CSS.
- Lists, tables with proper headers, and fieldsets convey structure ARIA cannot fully replace.
- `display: none` and `visibility: hidden` remove elements from the tree; `opacity: 0` does not.
- Inspect the computed role and name in DevTools rather than assuming.
