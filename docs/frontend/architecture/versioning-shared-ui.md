---
title: Versioning Shared UI
summary: Shipping changes to a component library many teams depend on, without breaking them or freezing yourself.
level: deep
minutes: 20
order: 4
tags: [architecture, versioning, design-systems]

related:
  - frontend/architecture/design-systems
  - frontend/tooling/publishing-a-frontend-package
  - frontend/architecture/large-scale-migrations

resources:
  - title: Semantic Versioning
    url: https://semver.org/
    source: semver.org
    type: docs
    minutes: 15
    primary: true
  - title: Changesets
    url: https://github.com/changesets/changesets
    source: changesets
    type: repo
  - title: Keep a Changelog
    url: https://keepachangelog.com/en/1.1.0/
    source: Keep a Changelog
    type: docs
    minutes: 15
---

## In one line

Every consumer of a shared component is a contract you did not write down, so the versioning question is really "how do I change this without a coordinated release across the company?"

## What it is

**Semver is necessary and insufficient.** Major-minor-patch communicates intent, but for UI the definition of "breaking" is broader than the type signature. Renaming a prop is obviously breaking. Changing a component's default padding, altering its DOM structure so a consumer's CSS selector stops matching, or changing focus order are all breaking in practice and pass a type check. Visual regression tests are what turn those into detectable changes.

**Deprecate before removing.** Mark the old prop with a JSDoc `@deprecated` so editors flag it, log a development-only warning naming the replacement, keep both working for a stated period, and then remove in a major. Removing without that cycle is how a design system loses trust.

**Codemods do the migration you would otherwise ask for.** Shipping a jscodeshift or ts-morph transform alongside a breaking change turns a hundred-file update into a command. Teams that ship codemods can make breaking changes; teams that do not accumulate deprecated APIs forever.

**Changesets** is the practical tooling answer in a monorepo: contributors declare the nature of each change in a small file, and release automation aggregates them into version bumps and a changelog. It replaces the argument about what number to bump with a decision made at PR time by the person who knows.

The **monorepo versus registry** split matters here. In a monorepo with everything on the same version, a breaking change can be made atomically across every consumer, so the versioning problem largely disappears and the cost moves to build tooling. With published packages, consumers upgrade on their own schedule — which means supporting multiple versions and, eventually, a long tail on a version you would like to delete.

Two practices keep the tail short. **Support a defined window** — the current major and the previous one, stated publicly — rather than indefinitely. And **track adoption**: know which teams are on which version, so a deprecation deadline is a conversation with three teams rather than an announcement into the void.

## Why it matters

A shared library that cannot change is dead, and one that changes carelessly gets forked. Versioning discipline is what keeps it alive and used.

It is also a good staff-level interview topic — "how would you rename a prop used by forty teams?" — where codemods, deprecation windows, and adoption tracking are the expected answer.

## Key points

- Semver's "breaking" is narrower than reality: DOM structure, default spacing, and focus order all break consumers silently.
- Visual regression tests are what make non-API breaking changes detectable.
- Deprecate with `@deprecated`, a dev-only warning naming the replacement, and a stated removal window.
- Ship a codemod with a breaking change — it is the difference between being able to evolve and not.
- Changesets moves the version decision to the PR, where the knowledge is.
- A monorepo lets you change atomically; published packages mean supporting several versions.
- Define a support window and track per-team adoption so deprecations are actionable.
