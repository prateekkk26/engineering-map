---
title: Visual Accessibility
summary: Contrast, text sizing, motion and colour independence — the requirements that affect the largest number of users.
level: core
minutes: 20
order: 6
tags: [accessibility, visual, css]

related:
  - frontend/css/design-tokens-and-theming
  - frontend/css/animation-and-compositor-performance
  - frontend/accessibility/wcag-and-the-legal-baseline

resources:
  - title: Contrast and colour accessibility
    url: https://webaim.org/articles/contrast/
    source: WebAIM
    type: article
    minutes: 25
    primary: true
  - title: prefers-reduced-motion
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
    source: MDN
    type: docs
    minutes: 10
  - title: Understanding Contrast (Minimum)
    url: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
    source: W3C WAI
    type: docs
    minutes: 20
---

## In one line

Low vision, colour blindness and motion sensitivity affect far more people than total blindness, and the fixes are mostly CSS.

## What it is

**Contrast** has defined thresholds: 4.5:1 for normal text, 3:1 for large text (18pt, or 14pt bold) and for meaningful non-text elements like icons and input borders. AAA raises text to 7:1. The most-missed cases are placeholder text, disabled controls that still need to be readable, text over images, and focus indicators — which must contrast against both the element and its surroundings. WCAG 2's formula is known to be imperfect, particularly for dark themes; APCA is the research-based successor expected in WCAG 3, and is worth knowing about even though 2.x remains the legal standard.

**Colour must never be the only signal.** Around 8% of men have some colour vision deficiency, so a red-versus-green status is invisible to a substantial share of users. Pair colour with an icon, a text label, or a pattern. The quick check: convert the screen to greyscale and see whether it still communicates.

**Text must survive resizing.** Content should remain usable at 200% zoom, and text specifically should be resizable to 200% without loss — which means sizing in relative units, avoiding fixed heights on text containers, and never disabling zoom with a viewport meta tag. WCAG 1.4.12 adds requirements for user-set line height, paragraph spacing and letter spacing, which fixed-height containers break.

**Motion** matters more than it appears: parallax, large transitions and autoplaying animation can cause genuine nausea and dizziness for people with vestibular disorders. `prefers-reduced-motion` is the contract, and the right response is to reduce rather than remove — a cross-fade instead of a slide keeps the affordance without the movement. Anything that animates for more than five seconds needs a pause control.

**Target size** is the other physical constraint: 24×24 CSS pixels minimum under WCAG 2.2, with 44×44 the widely-used practical target for touch. Small controls near each other are a mis-tap generator for anyone with a motor impairment.

Finally, respect the other user preferences the platform exposes: `prefers-contrast`, `prefers-reduced-transparency`, and `prefers-color-scheme` all describe real needs, and honouring them costs a media query.

## Why it matters

These affect the largest population of any accessibility category — low vision and colour deficiency dwarf screen reader use — and they are also the cheapest to get right, because they are design-time decisions rather than engineering ones.

Contrast failures are the single most common issue found by automated tools, which makes them the most common finding in any audit.

## Key points

- 4.5:1 for body text, 3:1 for large text and meaningful non-text elements including focus indicators.
- Placeholders, disabled controls, and text over images are the usual contrast misses.
- Never encode meaning in colour alone — greyscale the screen as a quick check.
- Support 200% zoom and user-set text spacing; never disable zoom in the viewport tag.
- Honour `prefers-reduced-motion` by reducing rather than removing motion.
- Meet a 24×24 minimum target size, and aim for 44×44 on touch.
- Also respect `prefers-contrast`, `prefers-reduced-transparency`, and `prefers-color-scheme`.
