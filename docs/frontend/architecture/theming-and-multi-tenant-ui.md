---
title: Theming & Multi-Tenant UI
summary: One codebase rendering as many brands — token layering, per-tenant configuration, and the isolation that keeps them apart.
level: deep
minutes: 20
order: 6
tags: [architecture, theming, multi-tenant]

related:
  - frontend/css/design-tokens-and-theming
  - frontend/architecture/design-systems
  - frontend/architecture/feature-flags-and-progressive-delivery

resources:
  - title: Using CSS custom properties
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: prefers-color-scheme
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
    source: MDN
    type: docs
    minutes: 10
  - title: Style Dictionary
    url: https://styledictionary.com/
    source: Style Dictionary
    type: docs
    minutes: 25
---

## In one line

Multi-tenant theming works when tenants can only change values you decided are variable — the moment they can change structure, you have as many applications as tenants.

## What it is

Start by separating two problems that get conflated. **Theming** is switching a known set of values — light and dark, a density mode, a brand palette. **White-labelling** is a tenant supplying their own values, at runtime, possibly at their own domain, and it adds configuration delivery, validation, and isolation on top.

The mechanism for both is the same: **semantic tokens as CSS custom properties**, overridden on a wrapper element or the root. Because custom properties cascade and are live, one component renders correctly under any tenant with no props and no re-render. That is the whole reason this is a CSS problem rather than a React one.

**Where the values come from** is the tenant-specific part. Resolve the tenant from the hostname or path — usually in `proxy.ts` — fetch its token set server-side, and inline it as a style block in the initial HTML so the first paint is already branded. Fetching tokens client-side produces a visible flash of the default brand, which for a white-label product is a serious defect.

**Constrain what is themeable.** Publish a schema of the tokens a tenant may set, validate against it, and reject anything outside. Two reasons: an unvalidated colour value is a CSS injection vector, and an unconstrained theme makes every future layout change a per-tenant regression risk. Contrast is the other constraint — check tenant colour pairs against WCAG ratios and refuse combinations that fail, or accessibility becomes their problem and your bug report.

Beyond colour, real multi-tenant products vary **logos and assets**, **copy and terminology**, **locale and currency defaults**, and **feature availability** — which is a flag system, not a theme system, and should stay separate.

Two operational notes. **Testing** multiplies: run visual regression against a representative set of themes, not just the default, and include the extreme ones — longest brand name, darkest palette. And **caching** must key on tenant; a CDN serving one tenant's themed HTML to another is both a branding incident and a data-leak risk.

## Why it matters

B2B and platform products almost always need this, and it appears in JDs as white-labelling or multi-brand support.

The architecture question — what is themeable versus what is configurable — is a good design-round discussion, because the answer determines whether the product stays maintainable.

## Key points

- Separate theming (a known set of values) from white-labelling (tenant-supplied configuration).
- Semantic tokens as custom properties let one component render under any brand with no props.
- Resolve the tenant server-side and inline its tokens in the initial HTML to avoid a brand flash.
- Publish and validate a token schema — unvalidated values are both an injection risk and a maintenance one.
- Enforce contrast ratios on tenant colour pairs rather than trusting the tenant.
- Keep feature availability in a flag system, separate from theming.
- Run visual regression across representative themes, and key caches by tenant.
