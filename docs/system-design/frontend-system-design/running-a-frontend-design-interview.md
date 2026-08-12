---
title: Running a Frontend Design Interview
summary: RADIO as a timeboxed structure for the 45 minutes, and the four things that separate a senior answer from a competent one.
level: core
minutes: 25
order: 1
tags: [frontend-system-design, interview, process]

related:
  - system-design/design-fundamentals/running-a-system-design-interview
  - system-design/design-fundamentals/how-design-rounds-are-failed
  - system-design/frontend-system-design/frontend-api-design
  - system-design/frontend-system-design/design-a-data-grid-dashboard
  - system-design/frontend-system-design/design-a-design-system
  - system-design/frontend-system-design/design-a-multi-step-form
  - system-design/frontend-system-design/design-an-analytics-sdk
  - system-design/frontend-system-design/frontend-caching-and-offline-architecture

resources:
  - title: Front End System Design Playbook — RADIO Framework
    url: https://www.greatfrontend.com/front-end-system-design-playbook/framework
    source: GreatFrontEnd
    type: article
    minutes: 25
    primary: true
  - title: Front End Interview Handbook — System Design
    url: https://www.frontendinterviewhandbook.com/front-end-system-design
    source: Front End Interview Handbook
    type: article
    minutes: 20 # unverified
  - title: Patterns.dev
    url: https://www.patterns.dev/
    source: Lydia Hallie & Addy Osmani
    type: article
    minutes: 45
---

## In one line

Same round as backend system design, but the interesting parts are the component tree, the client-side data layer, and the states a user can actually see.

## What it is

The framework in circulation is **RADIO**, and interviewers at these companies know it by name.

**Requirements — 5 to 8 minutes.** Functional: what can the user do? Non-functional: which devices, which network, how much data, does it need to work offline, does it need to be accessible, how many locales. Ask about the *rendering context* early — is this a page in an existing Next.js app, a standalone widget, or an embeddable third-party script? That single answer changes most of the design.

**Architecture — 10 minutes.** Draw the component tree and, next to it, the non-visual modules: a data layer, a store, a transport client. The mistake is drawing only components. Say which module owns server data, which owns UI state, and how they talk. If it's a widget or SDK, this is where you decide what's shipped as a bundle and what's loaded lazily.

**Data model — 5 minutes.** Two kinds of state, named separately: **server state** (fetched, cached, can be stale) and **client state** (ephemeral, owned by the UI). Give the entity shape and say whether it's normalised. Say where each piece lives — component, store, URL, or cache.

**Interface / API — 5 to 8 minutes.** The HTTP contract *and* the component props contract. Endpoint, params, response shape, pagination strategy, error shape. This is where a frontend round has its own substance and where most candidates are thinnest.

**Optimisations — the rest.** Performance, network, rendering, accessibility, i18n. Do not wait to be asked.

**Drive it.** Announce phases the same way as a backend round. The one frontend-specific move worth making early: enumerate the **states of the surface** — loading, empty, partial, error, success, offline, permission-denied. Interviewers are explicitly told to score for this and most candidates only design the success case.

## Why it matters

This is the round these loops actually schedule for senior frontend, and it is scored on breadth of concern, not depth of algorithm. The published rubrics all say the same thing: the differentiator is raising optimisation, performance, accessibility and i18n unprompted. A candidate who ships a correct component tree and never mentions a11y reads as mid-level.

## Key points

- RADIO is Requirements, Architecture, Data model, Interface, Optimisations — and running it out loud is itself scored.
- Ask what the rendering context is before designing anything; a widget, an app page, and an embeddable script are three different answers.
- Draw non-visual modules alongside the component tree — a data layer and a store are part of the architecture.
- Separate server state from client state by name; conflating them is the most common data-model error in this round.
- The interface section covers both the network contract and the component prop contract.
- Enumerate loading, empty, error, partial and offline states explicitly — designing only the success path is the classic mid-level tell.
- Raise performance, accessibility and i18n without being prompted; that is the stated senior signal.
- Park what you can't finish out loud rather than stalling on it.
