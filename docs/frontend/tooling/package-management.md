---
title: Package Management
summary: Lockfiles, hoisting, and why pnpm's strict layout catches bugs the others hide.
level: core
minutes: 20
order: 6
tags: [tooling, npm, dependencies]

related:
  - frontend/security/dependency-supply-chain
  - frontend/architecture/monorepos-for-frontend
  - frontend/tooling/module-resolution-and-exports-maps

resources:
  - title: pnpm — Motivation
    url: https://pnpm.io/motivation
    source: pnpm
    type: docs
    minutes: 20
    primary: true
  - title: npm ci
    url: https://docs.npmjs.com/cli/v10/commands/npm-ci
    source: npm
    type: docs
    minutes: 10
  - title: Semantic Versioning
    url: https://semver.org/
    source: semver.org
    type: docs
    minutes: 15
---

## In one line

The lockfile is the actual dependency specification — `package.json` is a set of ranges — and the layout the installer produces determines which mistakes you can make.

## What it is

**Ranges versus locks.** `^1.2.3` means "any compatible 1.x", so two installs a week apart can produce different trees. The lockfile pins every transitive version and hash, which is what makes builds reproducible. It must be committed, and CI must use `npm ci` or `pnpm install --frozen-lockfile` — a plain `install` may update the lock, which silently defeats the point.

**Hoisting** is the difference between the managers. npm and Yarn flatten `node_modules`, so a transitive dependency ends up importable even though you never declared it. Code works locally, then breaks when that package updates and drops the dependency — a phantom dependency. **pnpm** uses a content-addressed store with symlinks: only declared dependencies are visible, disk usage is a fraction because packages are hard-linked rather than copied, and installs are faster. Strictness catching an undeclared import as an error is the main reason to prefer it.

**Version ranges deserve a policy.** Caret ranges plus a lockfile is the normal choice: reproducible builds with easy upgrades. Exact pinning gives maximum determinism at the cost of manual security patching. Whichever you pick, apply it consistently, because a mix is the worst of both.

**`peerDependencies`** express "I need the host to provide this" — React for a component library — and prevent the duplicate-copies problem. `optionalDependencies` tolerate install failure. `overrides` (npm) and `resolutions` (Yarn/pnpm) force a transitive version, which is the escape hatch for patching a vulnerable nested dependency before its parent updates.

Then the operational habits. **Automate updates** with Dependabot or Renovate, grouped and scheduled so it is a routine rather than an annual crisis; small frequent upgrades are dramatically cheaper than a year's accumulation. **Audit regularly** but triage — many advisories do not apply to a browser context. **Disable install scripts by default**, since `postinstall` runs arbitrary code before any review. And **know `npm ls`** and the equivalent `why` commands for answering "what pulled this in?".

## Why it matters

Dependency problems consume a lot of engineering time and are the entry point for supply-chain attacks, so the manager's guarantees are a security property as well as an ergonomic one.

pnpm's strictness in particular converts a class of latent bugs into immediate errors, which is why it has become the default in monorepos.

## Key points

- The lockfile is the real specification; commit it and install with `ci` or `--frozen-lockfile` in CI.
- Hoisting makes undeclared transitive dependencies importable — a bug waiting for an upgrade.
- pnpm's symlinked store is faster, far smaller on disk, and errors on phantom dependencies.
- Choose caret-plus-lockfile or exact pinning deliberately and apply it consistently.
- `peerDependencies` prevent duplicate copies of a framework in consumers' trees.
- `overrides`/`resolutions` force a transitive version when you need to patch ahead of upstream.
- Automate small frequent updates, triage audit output, and disable install scripts by default.
