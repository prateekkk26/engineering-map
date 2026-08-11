---
title: Micro-Frontends
summary: Splitting a frontend across independently deployable teams — when the organisational problem justifies the technical cost.
level: deep
minutes: 25
order: 9
tags: [architecture, micro-frontends, scale]

related:
  - frontend/architecture/monorepos-for-frontend
  - frontend/browser-platform/shadow-dom-and-web-components
  - frontend/architecture/large-scale-migrations

resources:
  - title: Micro Frontends
    url: https://martinfowler.com/articles/micro-frontends.html
    source: Martin Fowler
    type: article
    minutes: 30
    primary: true
  - title: Module Federation
    url: https://module-federation.io/guide/start/index.html
    source: Module Federation
    type: docs
    minutes: 25
  - title: Micro Frontends in Action
    url: https://www.manning.com/books/micro-frontends-in-action
    source: Manning
    type: book
---

## In one line

Micro-frontends solve an organisational problem — many teams blocked on one release train — at a technical cost most organisations do not need to pay.

## What it is

The premise: independently deployable frontend pieces owned by separate teams, composed into one experience. It is Conway's law applied deliberately, and the honest justification is autonomy — a team shipping without coordinating a release with five others.

**Composition happens at one of three points.** *Build-time* composition is just packages, and is not really micro-frontends. *Server-side* composition assembles fragments into one response — fast first paint, good SEO, and the most operationally sane option. *Client-side* composition loads remotes at runtime via Module Federation or import maps, which gives the strongest independence and the largest runtime cost.

**The costs are consistently underestimated.** Duplicate dependencies mean multiple React copies unless sharing is configured precisely — and version skew between remotes then becomes a runtime failure rather than a build error. Bundle size grows because deduplication is partial. Styles leak across boundaries without shadow DOM or strict conventions. Shared state needs an explicit contract, usually events or a URL, because direct imports defeat the point. Debugging spans deployments owned by different teams. And a genuinely consistent user experience requires exactly the shared design system whose absence motivated the split.

**When it is justified**: many teams (roughly five or more) with genuinely separate domains, different release cadences, an existing organisational boundary, or a legacy migration where a new stack must coexist with an old one incrementally. That last case is the most defensible use.

**When it is not**: a small team, a single cohesive product, or a desire for "microservices but frontend". A monorepo with clear module boundaries gives most of the code-organisation benefit at a fraction of the runtime cost, and is the right answer far more often.

Two mitigations if you do adopt it. **Route-level splitting** is dramatically simpler than page-level composition — each team owns whole routes, the shell handles navigation, and cross-team runtime coupling nearly disappears. And a **shared design system with a strict version policy** is not optional; without it the product looks assembled rather than designed.

## Why it matters

It appears in JDs at larger companies and in system design discussions, and the valuable answer is the trade-off — including saying no.

Knowing that route-level ownership captures most of the benefit is a more useful position than knowing Module Federation's configuration.

## Key points

- The justification is organisational autonomy, not technical elegance.
- Server-side composition is operationally simpler; client-side gives more independence at higher runtime cost.
- Duplicate framework copies, version skew, and style leakage are the recurring technical costs.
- Cross-app state needs an explicit contract — events or the URL — because shared imports defeat independence.
- Consistency still requires a shared design system, which was often the original problem.
- Justified for many teams with separate domains, or for incremental legacy migration.
- Route-level ownership captures most of the benefit at a fraction of the cost; a monorepo is usually the right answer.
