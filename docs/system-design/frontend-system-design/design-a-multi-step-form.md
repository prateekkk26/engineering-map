---
title: Design a Multi-Step Form
summary: Wizard state as a machine, validation on both sides, resumable drafts, and submitting exactly once.
level: core
minutes: 25
order: 7
tags: [frontend-system-design, design-problem, forms]

related:
  - frontend/state-and-data/forms-and-validation
  - frontend/state-and-data/ui-state-machines
  - frontend/accessibility/accessible-forms-and-errors
  - system-design/distributed-systems/idempotency-and-delivery-semantics

resources:
  - title: Question Pages — One Thing per Page
    url: https://design-system.service.gov.uk/patterns/question-pages/
    source: GOV.UK Design System
    type: docs
    minutes: 20
    primary: true
  - title: React Hook Form — Advanced Usage
    url: https://react-hook-form.com/advanced-usage
    source: React Hook Form
    type: docs
    minutes: 20
  - title: WAI Tutorials — Form Notifications
    url: https://www.w3.org/WAI/tutorials/forms/notifications/
    source: W3C
    type: docs
    minutes: 15
---

## In one line

Checkout, onboarding, KYC — one long form split across screens, where the real problems are resumability, conditional steps, and not charging the card twice.

## What it is

**Requirements.** How many steps, and are they fixed or conditional on earlier answers? Can the user leave and come back — same device or any device? Is any step server-validated (address lookup, payment authorisation, coupon)? Is there a review step? Are files involved? Is it regulated (consent, audit trail, data residency)?

**Model the wizard as a state machine, not a step counter.** Steps are states, `next`/`back`/`skip` are transitions, and guards decide which transitions are legal given the data so far. This kills the class of bug where someone deep-links to step 4 with an empty step 2, and it makes conditional branching ("business account → two extra steps") declarative instead of a thicket of `if`s. Keep a derived `canProceed` per step rather than a boolean you set by hand.

**Where the data lives.** One form object at the wizard level, not per-step component state — steps unmount and you must not lose answers when going back. Put the current step in the **URL** so back and forward work like a user expects and refresh doesn't restart the flow; guard entry so an out-of-order URL redirects to the furthest legal step.

**Persistence.** Autosave the draft on step transition, debounced. Local storage is the cheap version and is enough for a form that doesn't cross devices; a server-side draft with a `draftId` is the real one, and it's what lets someone resume on a phone after starting on a laptop. Never persist card numbers, and be deliberate about what else you're writing to disk — this is where a GDPR follow-up lands.

**Validation, twice.** Per-field on blur and per-step on submit, from a single schema shared with the server so rules can't drift. Validate on the server for anything the client can't be trusted with. On error, focus the first invalid field, describe the error with `aria-describedby`, mark it `aria-invalid`, and put a summary at the top of the step — a submit that silently fails scrolls nowhere and is a common a11y complaint.

**The final submit.** Send the whole payload once with a **client-generated idempotency key** so a retry, a double-click, or a flaky network can't create two orders. Disable the button and show progress on the first click. On a 5xx, retry with the same key. On success, replace the history entry so back doesn't re-submit.

**Optimisations.** Lazy-load the code for later steps, especially heavy ones (a payment SDK, a map, an ID scanner). Prefetch the next step's chunk when the current step becomes valid. Preserve scroll to the top of each step and move focus to the step heading on transition.

## Why it matters

It's the standard prompt for testing state modelling rather than rendering, and it contains the one mistake that costs real money in production — a double submit. Raising idempotency and resumable drafts unprompted is a strong senior signal in a prompt most candidates treat as "just a form".

## Key points

- Model steps as a state machine with guarded transitions; a numeric step counter can't express conditional branching safely.
- Hold form data at the wizard level, not in step components, so going back doesn't lose answers.
- Put the current step in the URL and guard deep links to the furthest legal step.
- Autosave drafts on transition; a server-side `draftId` is what makes the flow resumable across devices.
- Share one validation schema between client and server so the rules cannot drift.
- Focus the first invalid field, wire `aria-describedby` and `aria-invalid`, and render an error summary per step.
- Send a client-generated idempotency key on final submit — double submission is the failure that costs money.
- Replace the history entry after success so the back button can't resubmit.
- Code-split later steps and prefetch the next chunk once the current step validates.
