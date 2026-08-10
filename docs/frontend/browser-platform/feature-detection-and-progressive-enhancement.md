---
title: Feature Detection & Progressive Enhancement
summary: Building so the core works everywhere and the nice parts activate where supported — without shipping polyfills nobody needs.
level: core
minutes: 20
order: 20
tags: [browser, compatibility, architecture]

related:
  - frontend/browser-platform/device-and-permission-apis
  - frontend/tooling/transpilation-and-browser-targets
  - frontend/accessibility/semantic-html-and-the-accessibility-tree

resources:
  - title: Progressive enhancement
    url: https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement
    source: MDN
    type: docs
    minutes: 15
    primary: true
  - title: "@supports"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@supports
    source: MDN
    type: docs
    minutes: 15
  - title: Baseline
    url: https://web.dev/baseline
    source: web.dev
    type: article
    minutes: 20
---

## In one line

Detect the feature, never the browser; make the core function without JavaScript where it reasonably can; and treat everything beyond that as an enhancement that is allowed to be absent.

## What it is

**Feature detection** means asking whether a capability exists — `if ('showPicker' in HTMLInputElement.prototype)`, `@supports (view-transition-name: none)`, `CSS.supports()` — rather than inferring it from the user agent string. UA sniffing has always been fragile and is getting worse as browsers freeze and reduce what they report.

**Progressive enhancement** is the architectural version: start with something that works, then layer on capability. A form that posts natively and is enhanced with client-side validation; a link that navigates and is intercepted for a soft transition; a sortable table that renders sorted from the server. The payoff is not really about users with JavaScript disabled — it is that the same design survives a failed bundle, a slow connection during hydration, a browser you have never tested, and a crawler.

This is why server actions with `<form action>` are worth the attention: the mutation works before hydration because the browser's own form submission carries it. The same principle explains why anchor tags should be anchors and buttons should be buttons — the platform behaviour is the fallback layer.

**Baseline** is the newer vocabulary worth adopting: features are labelled *newly available* (in all major engines) or *widely available* (there for 30 months). It replaces "can I use this?" guesswork with a shared threshold, and MDN shows it inline.

For the gaps, choose deliberately. Polyfill only what you must, and prefer conditional loading so modern browsers pay nothing. Set your build's browser targets honestly — a modern baseline removes a surprising amount of transpiled output and polyfill weight, and Next 16 raised its own baseline for exactly that reason.

The failure mode on the other side is worth naming too: over-applying this to the point of building everything twice. A complex data-visualisation tool does not need a no-JavaScript mode. The judgement is which flows are core — sign up, browse, buy, submit — and making those robust.

## Why it matters

Cross-browser support is a recurring JD line, and the difference between UA sniffing and feature detection is a quick competence check.

It also underpins resilience: apps built this way degrade instead of breaking, which is exactly what an interviewer is probing when they ask what happens if your JavaScript fails to load.

## Key points

- Detect features, not browsers — UA strings are increasingly frozen and unreliable.
- `@supports` and `CSS.supports()` do the same job for CSS, enabling clean fallbacks.
- Progressive enhancement protects against failed bundles and slow hydration, not just disabled JavaScript.
- Native form submission and real anchors are the fallback layer that makes enhancement possible.
- Use Baseline's "newly" and "widely available" as the shared threshold for adoption decisions.
- Load polyfills conditionally and set honest browser targets — a modern baseline removes real weight.
- Apply the discipline to core flows; not every feature deserves a no-JavaScript path.
