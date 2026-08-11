---
title: ARIA & When Not to Use It
summary: The attributes that fill genuine gaps, the ones that cause harm, and the first rule that says to avoid them.
level: core
minutes: 25
order: 2
tags: [accessibility, aria]

related:
  - frontend/accessibility/semantic-html-and-the-accessibility-tree
  - frontend/accessibility/building-accessible-components
  - frontend/accessibility/live-regions-and-dynamic-content

resources:
  - title: ARIA Authoring Practices Guide
    url: https://www.w3.org/WAI/ARIA/apg/
    source: W3C
    type: docs
    minutes: 40
    primary: true
  - title: Using ARIA
    url: https://www.w3.org/TR/using-aria/
    source: W3C
    type: docs
    minutes: 30
  - title: ARIA
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
    source: MDN
    type: docs
    minutes: 30
---

## In one line

The first rule of ARIA is not to use ARIA — it changes only how an element is described, never how it behaves, so a wrong attribute makes things worse than none at all.

## What it is

ARIA overrides the accessibility tree. `role="button"` on a div makes a screen reader announce "button" and changes nothing else: it does not make the element focusable, does not make Enter or Space activate it, and does not add a disabled state. Every behaviour is still yours to implement.

That asymmetry is why **incorrect ARIA is worse than none**. A `role="button"` that cannot be reached by keyboard has promised an interaction the user cannot perform. Data consistently shows pages using ARIA averaging more detected errors than pages without it — not because ARIA is bad, but because it is usually applied instead of fixing the markup.

**Where it is genuinely needed**, three categories:

**Relationships the DOM cannot express.** `aria-labelledby` and `aria-describedby` connect a control to text elsewhere in the document — an error message below a field, a heading that labels a region. `aria-controls` and `aria-owns` link controls to what they affect.

**State that has no native attribute.** `aria-expanded` on a disclosure, `aria-selected` on a tab, `aria-current="page"` on the active nav item, `aria-pressed` on a toggle button. These describe states native HTML has no element for.

**Live regions**, which are the only way to announce dynamic content changes.

**Labelling** has a precedence order worth knowing: `aria-labelledby` beats `aria-label`, which beats the element's own content. Prefer visible text via `labelledby` — an `aria-label` that differs from the visible label breaks voice control users, who say what they see.

Two rules from the specification that catch people out. **Do not change the role of a semantic element** — `role="button"` on an `<a>` removes link semantics and the behaviours that came with it. And **do not put `aria-hidden` on a focusable element**: it is removed from the accessibility tree but still in the tab order, so a keyboard user lands on something a screen reader will not describe.

For patterns beyond the basics — combobox, tabs, tree — the **APG** is the reference, and it specifies keyboard interaction alongside the attributes, because the two are inseparable.

## Why it matters

ARIA misuse is the most common cause of accessibility regressions in component libraries, and the mistakes are systematic rather than random — the same wrong patterns recur.

"When would you use ARIA?" is also a standard interview question where the expected answer starts with "as little as possible".

## Key points

- ARIA changes description only — focusability, keyboard handling, and behaviour remain your responsibility.
- Incorrect ARIA is worse than none because it promises interactions the user cannot perform.
- Use it for relationships (`labelledby`, `describedby`), for states with no native equivalent, and for live regions.
- Labelling precedence: `aria-labelledby`, then `aria-label`, then content — prefer visible text.
- An `aria-label` that differs from visible text breaks voice control users.
- Never override the role of a semantic element, and never `aria-hidden` something focusable.
- Follow the APG for complex widgets — it specifies keyboard behaviour, not just attributes.
