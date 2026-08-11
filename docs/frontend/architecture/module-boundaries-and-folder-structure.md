---
title: Module Boundaries & Folder Structure
summary: Organising by feature rather than file type, and enforcing the boundaries so the structure survives contact with a deadline.
level: core
minutes: 20
order: 7
tags: [architecture, structure, maintainability]

related:
  - frontend/architecture/monorepos-for-frontend
  - frontend/tooling/linting-and-formatting-at-scale
  - frontend/architecture/large-scale-migrations

resources:
  - title: File Structure
    url: https://legacy.reactjs.org/docs/faq-structure.html
    source: React (legacy docs)
    type: docs
    minutes: 15
    primary: true
  - title: Feature-Sliced Design
    url: https://feature-sliced.github.io/documentation/
    source: Feature-Sliced Design
    type: docs
    minutes: 30
  - title: eslint-plugin-boundaries
    url: https://github.com/javierbrea/eslint-plugin-boundaries
    source: javierbrea
    type: repo
---

## In one line

Group by feature, not by file type, and encode the allowed dependency directions in a linter — because a convention nobody enforces is a convention that decays.

## What it is

The type-based layout — `components/`, `hooks/`, `utils/`, `types/` — looks tidy and scales badly. Working on checkout means touching five directories, none of which tells you what else uses the file you are editing, and deleting a feature means hunting its fragments across the tree.

**Feature-based** grouping puts everything a feature owns in one place: `features/checkout/` with its components, hooks, API calls, types and tests. The properties that follow are the point — a feature is deletable in one operation, its blast radius is visible, and a new contributor can read one directory to understand one thing.

Three layers cover most applications. `app/` or `routes/` for composition and routing. `features/` for domain slices. `shared/` for genuinely cross-cutting primitives — the design system, utilities, the API client. The rule that makes it work: **features may depend on shared, but never on each other**, and shared may never depend on a feature. Cross-feature needs go up to the composition layer or down into shared.

**Enforce it.** `eslint-plugin-boundaries` or an import-restriction rule turns the architecture into a build failure instead of a code review comment. Without enforcement, one deadline produces one cross-feature import, and within a year the graph is a mesh again.

**Public interfaces** are the other half. A feature exposes an `index.ts` barrel of what it supports; everything else is internal. Deep imports into another feature's internals defeat the boundary — restrict them with the same lint rule. The caveat is that barrel files can hurt tree-shaking and slow builds if they re-export enormous surfaces, so keep them narrow.

**Colocation beats a `tests/` mirror.** Tests, stories, and styles next to the component are found, updated, and deleted with it.

Two closing notes. Extract to `shared/` on the **third** use, not the second — premature sharing creates coupling between features that were only accidentally similar. And structure should be reviewable in a PR: if a change adds a cross-boundary import, that is the interesting part of the diff.

## Why it matters

Structure determines how expensive change is, and it is very hard to fix later — a mesh of cross-imports cannot be untangled incrementally without the boundaries you did not create.

Interviewers ask how you would organise a growing codebase, and the answer that lands is feature slices with enforced dependency rules, not a directory listing.

## Key points

- Type-based folders scatter a feature across the tree; feature-based folders make it deletable and legible.
- Three layers — app, features, shared — with features never importing each other.
- Enforce dependency direction with a lint rule; unenforced conventions decay under deadline pressure.
- Give each feature a narrow public barrel and forbid deep imports into internals.
- Keep barrels small — wide re-exports hurt tree-shaking and build times.
- Colocate tests, stories, and styles with the component.
- Promote to `shared/` on the third use, not the second.
