---
title: Monorepos for Frontend
summary: Several packages in one repository — what it buys, what it costs, and the tooling that makes it viable.
level: deep
minutes: 25
order: 8
tags: [architecture, monorepo, tooling]

related:
  - frontend/architecture/versioning-shared-ui
  - frontend/tooling/package-management
  - frontend/tooling/ci-cd-for-frontend

resources:
  - title: Turborepo
    url: https://turborepo.com/docs
    source: Turborepo
    type: docs
    minutes: 30
    primary: true
  - title: pnpm workspaces
    url: https://pnpm.io/workspaces
    source: pnpm
    type: docs
    minutes: 20
  - title: Nx
    url: https://nx.dev/getting-started/intro
    source: Nx
    type: docs
    minutes: 25
---

## In one line

A monorepo trades per-package independence for atomic cross-package change — you can rename a component and update every consumer in one commit, and in exchange you own the build tooling that makes that fast.

## What it is

The decisive benefit is **atomic changes**. In separate repositories, changing a shared component means publish, wait, bump, PR, per consumer — and until every consumer upgrades, several versions are in production. In a monorepo it is one commit and one review, which is why the versioning problem largely dissolves.

Secondary benefits follow: one dependency graph so version conflicts are visible rather than latent, shared tooling and CI configuration, and code sharing without the friction of publishing.

**The costs are real and mostly about scale.** CI must build only what changed, or every PR runs the whole repo. `node_modules` and the checkout get large. Ownership becomes ambiguous without `CODEOWNERS`. And the tooling itself is a maintained thing — the build configuration becomes a component of the system.

The tooling stack has settled. **Workspaces** — pnpm is the usual choice for its strict, symlinked, disk-efficient layout — handle linking and installation. **A task runner** on top does the work that matters: Turborepo or Nx build a task graph, run only what a change affects, and cache results locally and remotely so a second run of an unchanged package is instant. Remote caching in CI is the single largest win, since most PRs touch a small slice.

**TypeScript project references** with `composite: true` make type-checking incremental too, so `tsc --build` recompiles only the affected packages.

**Versioning** splits into two models. *Fixed* keeps everything on one version and is simple for internal-only code. *Independent* versions per package and is necessary when packages are published externally; Changesets is the standard tool.

Two rules keep it healthy. **`CODEOWNERS` per package**, so review routing survives growth. And **an explicit dependency policy** — which packages may depend on which — enforced by a lint rule, or the monorepo becomes a single tangled package with extra folders.

The judgement: a monorepo is worth it when packages genuinely change together. Two products sharing nothing but a lint config are better off apart.

## Why it matters

Most companies past a certain size run one, so working effectively in a monorepo — knowing why CI skipped your package, why the cache missed — is a practical daily skill.

"Monorepo or polyrepo?" is also a common architecture question where the expected answer is about coupling and release cadence rather than a preference.

## Key points

- The core benefit is atomic cross-package change, which removes most of the shared-library versioning problem.
- The core cost is build tooling: without affected-only builds and caching, CI time scales with repo size.
- pnpm workspaces for linking; Turborepo or Nx for the task graph and remote caching.
- Remote caching in CI is the biggest single performance win.
- TypeScript project references make type-checking incremental via `tsc --build`.
- Fixed versioning for internal code, independent plus Changesets for published packages.
- Enforce `CODEOWNERS` and a dependency policy, or the repo becomes one tangled package.
