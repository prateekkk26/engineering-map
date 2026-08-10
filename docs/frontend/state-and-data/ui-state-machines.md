---
title: UI State Machines
summary: Modelling a screen as explicit states and legal transitions so the impossible combinations cannot be represented at all.
level: core
minutes: 25
order: 7
tags: [state, patterns, modelling]

related:
  - frontend/react/usereducer-and-ui-state-machines
  - frontend/state-and-data/forms-and-validation
  - frontend/typescript/branded-types-and-domain-modelling

resources:
  - title: Statecharts
    url: https://statecharts.dev/
    source: statecharts.dev
    type: docs
    minutes: 30
    primary: true
  - title: XState
    url: https://stately.ai/docs/xstate
    source: Stately
    type: docs
    minutes: 30
  - title: No, disabling a button is not app logic
    url: https://dev.to/davidkpiano/no-disabling-a-button-is-not-app-logic-598i
    source: David Khourshid
    type: article
    minutes: 15
---

## In one line

Four booleans give you sixteen combinations and about four legal ones; a state machine names the legal states and the transitions between them, so the other twelve stop existing.

## What it is

The everyday version of this bug: `isLoading`, `isError`, `hasData`, `isEmpty`. Each was added for a good reason, and together they permit a spinner on top of an error next to stale data. Nobody wrote that combination deliberately; the type system allowed it, so eventually a code path produced it.

Replace them with one value — `'idle' | 'loading' | 'success' | 'error'` — and attach the data to the state that owns it: `{ status: 'success', data }`, `{ status: 'error', error }`. Now `data` cannot be read in the error branch, because it is not there. As a TypeScript discriminated union, the compiler enforces the model rather than a convention doing it.

That is the modelling half. The machine half adds transitions: from `idle` you may `FETCH`; from `loading` you may `RESOLVE` or `REJECT`; a second `FETCH` while loading is not a legal transition and is ignored. That single rule removes the double-submit class of bug without a disabled flag and without a guard in the handler.

Statecharts extend this with the parts real UIs need: hierarchical states, so `editing` can contain `clean` and `dirty`; parallel regions, so upload progress and connection status coexist without multiplying; and guards and entry/exit actions, so side effects attach to transitions rather than being scattered through handlers.

Reach for the full apparatus when the interaction is genuinely stateful — multi-step forms, uploads with cancel and retry, drag and drop, video players, anything with optimistic updates and rollback. A library like XState buys visualisation and formal guarantees; for most screens a discriminated union plus a reducer captures the value with no dependency.

The underrated benefit is communication. A statechart is a diagram a designer or PM can read and correct, which surfaces the "what should happen if they click retry while it is still loading?" question during design rather than in QA.

## Why it matters

Frontend design rounds — autocomplete, uploader, checkout — are graded partly on whether you handle the awkward states, and a machine is the fastest way to demonstrate you have enumerated them.

In real work it converts a category of flaky, hard-to-reproduce bugs into transitions that simply do not exist.

## Key points

- Independent booleans multiply into impossible states; one status value with data attached removes them by construction.
- A discriminated union makes the compiler enforce the model instead of relying on discipline.
- Defining legal transitions per state kills double-submit and stray-event bugs without ad-hoc guards.
- Statecharts add hierarchy, parallel regions, and guards for interactions that need them.
- A union plus a reducer covers most screens; reach for a machine library when visualisation or formal rigour pays.
- The diagram is a design artifact — it surfaces edge-case questions before they become bugs.
