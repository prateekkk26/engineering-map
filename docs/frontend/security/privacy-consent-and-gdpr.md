---
title: Privacy, Consent & GDPR
summary: The legal constraints that shape European frontends — consent before tracking, data minimisation, and the rights users can exercise.
level: core
minutes: 25
order: 15
tags: [security, privacy, gdpr, compliance]

related:
  - frontend/security/client-side-data-exposure
  - frontend/security/third-party-scripts-and-tag-managers
  - frontend/ai-interfaces/cost-telemetry-and-feedback-capture

resources:
  - title: What is GDPR?
    url: https://gdpr.eu/what-is-gdpr/
    source: gdpr.eu
    type: article
    minutes: 30
    primary: true
  - title: Cookies, the GDPR, and the ePrivacy Directive
    url: https://gdpr.eu/cookies/
    source: gdpr.eu
    type: article
    minutes: 20
  - title: Global Privacy Control
    url: https://globalprivacycontrol.org/
    source: GPC
    type: docs
    minutes: 15
---

## In one line

In the EU and UK you need a lawful basis before processing personal data and freely-given consent before non-essential storage or tracking — which makes consent an architecture decision, not a banner.

## What it is

Two rules do most of the work. Under **ePrivacy**, storing or reading anything on a user's device that is not strictly necessary — analytics cookies, tracking pixels, fingerprinting, some `localStorage` — requires prior consent. Under **GDPR**, processing personal data at all requires a lawful basis, and "personal data" is broad: an IP address, a device id, a cookie id.

That has direct implementation consequences. **Nothing non-essential may load before consent.** A banner that appears while analytics is already running is not compliance, and it is the single most common failure. Tags must be gated on consent state, which is why a consent-mode integration in the tag manager matters more than the banner's design.

The banner itself has rules regulators enforce: reject must be as easy as accept — same prominence, same number of clicks — consent must be granular by purpose rather than all-or-nothing, pre-ticked boxes are invalid, and withdrawal must be as easy as giving it, meaning a persistent route back to the settings.

**Data minimisation** is the principle with the most engineering impact and the least attention: collect only what you need, keep it only as long as you need it. Session recording that captures form fields, analytics logging full URLs containing ids, and error reports carrying request bodies are all routine over-collection.

**User rights** need product surfaces, not just a policy page: access (export their data), erasure, rectification, and portability. Building those late is expensive; the storage design decides how hard they are.

Two more that catch teams out. **Self-host fonts** — a German court held that sending an IP address to Google Fonts without consent is a violation, and self-hosting is faster anyway. And **respect Global Privacy Control**, the `Sec-GPC` header, which some jurisdictions treat as a legally binding opt-out.

The Digital Markets Act and the EU AI Act add further obligations for larger platforms and AI features respectively — worth knowing exist, even if the detail is legal counsel's job.

## Why it matters

The target companies here are US **and** Europe, and privacy engineering is a routine JD line for European roles. Fines are real and enforcement has shifted toward consent implementation specifically.

In interviews it distinguishes candidates: "how would you add analytics?" answered with consent gating, minimisation, and self-hosted fonts is a visibly different answer from "add the script tag".

## Key points

- ePrivacy requires consent before non-essential storage or tracking; GDPR requires a lawful basis for any personal data.
- No non-essential tag may fire before consent — gating in the tag manager is the mechanism, not the banner.
- Reject as easy as accept, consent granular by purpose, no pre-ticked boxes, withdrawal always available.
- Minimise collection and retention; session recording and full-URL analytics routinely over-collect.
- Build surfaces for access, erasure, rectification, and portability — storage design determines their cost.
- Self-host fonts; sending IPs to a third-party font CDN without consent has been ruled a violation.
- Honour the `Sec-GPC` signal where it is legally binding.
