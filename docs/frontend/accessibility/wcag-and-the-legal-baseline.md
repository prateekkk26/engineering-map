---
title: WCAG & the Legal Baseline
summary: What the standard actually requires, which level applies, and the laws that make it enforceable in the US and Europe.
level: core
minutes: 20
order: 9
tags: [accessibility, wcag, compliance]

related:
  - frontend/accessibility/visual-accessibility
  - frontend/security/privacy-consent-and-gdpr
  - frontend/testing/accessibility-in-tests

resources:
  - title: WCAG 2.2 at a Glance
    url: https://www.w3.org/WAI/standards-guidelines/wcag/glance/
    source: W3C WAI
    type: docs
    minutes: 15
    primary: true
  - title: How to Meet WCAG (Quick Reference)
    url: https://www.w3.org/WAI/WCAG22/quickref/
    source: W3C WAI
    type: docs
    minutes: 40
  - title: European Accessibility Act
    url: https://ec.europa.eu/social/main.jsp?catId=1202
    source: European Commission
    type: docs
    minutes: 25
---

## In one line

WCAG 2.2 level AA is the operative standard nearly everywhere, and since June 2025 the European Accessibility Act has made it a legal requirement for most consumer digital products sold in the EU.

## What it is

The guidelines are organised under four principles — **Perceivable, Operable, Understandable, Robust** — with testable success criteria at three levels. **A** is the minimum and largely covers what makes a page usable at all. **AA** is the level every regulation cites: contrast ratios, resize, focus visibility, consistent navigation, error identification. **AAA** is aspirational and not expected as a blanket target; the W3C itself says it is not achievable for all content.

**WCAG 2.2** added criteria worth knowing because they are recent enough to be missed: focus appearance requirements, a 24×24 minimum target size, dragging alternatives (any drag interaction needs a non-drag path), consistent help placement, and reduced cognitive load in authentication — which effectively rules out puzzles and memory tests as the only login route.

**The legal picture** has two halves. In the **United States**, the ADA has been applied to websites through litigation for years, with thousands of suits filed annually; Section 508 binds federal agencies and their suppliers. In the **EU**, the **European Accessibility Act** applies from 28 June 2025 to a broad set of consumer products and services — e-commerce, banking, transport, e-books — with member-state enforcement and penalties. The EN 301 549 standard, which incorporates WCAG AA, is the technical reference. The UK has the Equality Act plus public-sector regulations.

For a company selling into Europe, that changes accessibility from a values question to a compliance requirement with a deadline that has already passed.

**What compliance actually involves** beyond code: an **accessibility statement** describing conformance and known gaps, a **feedback route** for users to report barriers, and evidence of ongoing testing rather than a single audit. A **VPAT** (or its European equivalent) is commonly requested in enterprise procurement, and not having one loses deals.

Two honest caveats. **Conformance is not usability** — a product can meet every AA criterion and still be painful to use, which is why testing with real users matters. And **an overlay widget is not compliance**: automated overlays have been the subject of litigation themselves and are widely opposed by disabled users' organisations.

## Why it matters

For US and EU-facing products this is now a legal obligation with real enforcement, and it appears in enterprise procurement as a hard requirement.

Knowing the level, the recent 2.2 additions, and the EAA date is a currency check that separates people who track this from people who remember a 2018 checklist.

## Key points

- WCAG organises criteria under Perceivable, Operable, Understandable, Robust at levels A, AA, AAA.
- AA is the operative target everywhere; AAA is aspirational and not expected wholesale.
- WCAG 2.2 added focus appearance, 24×24 targets, dragging alternatives, and accessible authentication.
- The ADA drives US litigation; Section 508 binds federal procurement.
- The European Accessibility Act applies from June 2025 to most consumer digital services, referencing EN 301 549.
- Compliance includes an accessibility statement, a feedback channel, ongoing testing, and often a VPAT.
- Conformance is not usability, and overlay widgets are not compliance.
