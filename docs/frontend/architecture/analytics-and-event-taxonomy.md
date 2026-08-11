---
title: Analytics & Event Taxonomy
summary: Designing a tracking plan that answers product questions, rather than accumulating events nobody can interpret.
level: deep
minutes: 20
order: 13
tags: [architecture, analytics, product]

related:
  - frontend/architecture/frontend-observability
  - frontend/security/privacy-consent-and-gdpr
  - frontend/architecture/feature-flags-and-progressive-delivery

resources:
  - title: Analytics
    url: https://segment.com/academy/collecting-data/naming-conventions-for-clean-data/
    source: Segment
    type: article
    minutes: 20
    primary: true
  - title: Consent Mode
    url: https://developers.google.com/tag-platform/security/guides/consent
    source: Google
    type: docs
    minutes: 25
  - title: sendBeacon
    url: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
    source: MDN
    type: docs
    minutes: 10
---

## In one line

Analytics fails when events are added ad hoc, so the discipline is a tracking plan — a small, named, documented set of events derived from the questions the product actually needs answered.

## What it is

The common state is a few hundred events with names like `button_click`, `clicked_button`, and `Button Clicked` — three conventions, overlapping meanings, half of them firing from code nobody owns. Nobody trusts the numbers, so decisions get made on intuition anyway and the whole apparatus is cost without benefit.

**Start from the questions.** "What fraction of signups complete onboarding?" defines the events you need and, more usefully, the ones you do not. An event without a question behind it is noise.

**Fix a naming convention and enforce it.** `object_action` in past tense — `checkout_completed`, `document_shared` — is the common choice; which convention matters far less than having exactly one. Properties carry the detail (`plan: 'pro'`, `source: 'email'`) rather than multiplying into event names like `checkout_completed_pro`.

**Type the events.** A TypeScript union of event names with per-event property types turns a typo into a compile error and makes the tracking plan discoverable in the editor. This single step does more for data quality than any amount of documentation.

**Identity** needs a decision before launch: an anonymous id from first visit, aliased to a user id at signup so the pre-signup journey is not orphaned. Retrofitting that is painful.

Two frontend mechanics matter. **Send reliably** with `sendBeacon` or `keepalive`, since events fired during navigation away are otherwise dropped — and those are frequently the interesting ones. And **batch** rather than firing a request per event, to limit main-thread and network cost.

**Privacy is a design constraint, not a footnote.** Non-essential analytics must not fire before consent; personal data does not belong in event properties; URLs often contain identifiers, so referrer and page properties need scrubbing. This is a legal requirement in the EU and UK, not a preference.

Finally, **maintain the plan**: review events quarterly, delete the ones nobody queries, and treat adding one as a small design decision rather than a line in a PR.

## Why it matters

Product decisions get made from this data, and bad taxonomy means either wrong decisions or — more often — expensive infrastructure everyone ignores.

Frontend engineers are usually the ones implementing it, and pushing back on an untyped, unplanned event request is a visible seniority behaviour.

## Key points

- Derive events from the questions the product needs answered; an event with no question is noise.
- One naming convention, enforced — `object_action` in past tense is a fine default.
- Put detail in properties rather than multiplying event names.
- Type the event catalogue so typos fail to compile and the plan is discoverable in the editor.
- Decide anonymous-to-identified aliasing before launch; retrofitting loses the pre-signup journey.
- Use `sendBeacon`/`keepalive` and batch, or you lose the events fired as users leave.
- Gate non-essential tracking on consent and keep personal data out of properties and URLs.
