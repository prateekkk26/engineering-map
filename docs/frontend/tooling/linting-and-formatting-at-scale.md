---
title: Linting & Formatting at Scale
summary: Separating formatting from correctness, enforcing architecture with lint rules, and keeping the feedback fast.
level: core
minutes: 20
order: 8
tags: [tooling, linting, quality]

related:
  - frontend/architecture/module-boundaries-and-folder-structure
  - frontend/tooling/ci-cd-for-frontend
  - frontend/tooling/developer-experience

resources:
  - title: ESLint
    url: https://eslint.org/docs/latest/use/getting-started
    source: ESLint
    type: docs
    minutes: 25
    primary: true
  - title: Biome
    url: https://biomejs.dev/guides/getting-started/
    source: Biome
    type: docs
    minutes: 20
  - title: eslint-plugin-react-hooks
    url: https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
    source: React
    type: repo
---

## In one line

Formatting should be automatic and unarguable; linting should catch real defects and enforce architecture — and conflating the two produces noisy reviews about nothing.

## What it is

**Formatting is settled.** Prettier or Biome, run on save and in CI, with no per-file overrides. The value is not the style itself but the elimination of the conversation — a diff should show what changed, not who has opinions about line breaks. Disable ESLint's stylistic rules entirely so the two tools do not fight.

**Linting is for correctness and architecture.** The rules worth having:
`eslint-plugin-react-hooks` catches conditional hooks and missing dependencies, and its exhaustive-deps warning is right far more often than developers assume.
`@typescript-eslint` with type-aware rules finds floating promises, unnecessary conditionals, and unsafe `any` propagation — genuinely valuable, and slow, which is why they often run separately from the fast pass.
`eslint-plugin-jsx-a11y` catches the mechanical accessibility defects at authoring time.
And **import boundary rules** are the underused category: `eslint-plugin-boundaries` or `no-restricted-imports` turns your architecture into a build failure rather than a code review comment.

**Custom rules pay for themselves** for repeated review feedback — "don't import from that internal path", "use the design system button" — because a rule scales and a comment does not.

**Speed matters, because a slow lint gets skipped.** ESLint's flat config plus caching keeps incremental runs fast; type-aware rules are the expensive part and belong in a separate CI job. Biome is dramatically faster as a Rust-based single tool covering both lint and format, at the cost of a smaller rule ecosystem — a reasonable choice for a new project, a harder migration for one with many plugins.

**Enforce where it does not annoy**: format on save in the editor, a pre-commit hook via lint-staged on changed files only, and the full run in CI. A pre-commit hook that lints the whole repository is how teams learn to use `--no-verify`.

Two adoption rules. **Introduce new rules as warnings first**, fix the existing violations, then promote to error — turning on a rule with two hundred failures produces a blanket disable. And **keep the config small and explain the non-obvious entries**: a config nobody understands is one nobody maintains.

## Why it matters

Lint and format configuration determines whether code review is about design or about semicolons, and boundary rules are one of the few mechanisms that keep an architecture from decaying under deadline pressure.

Every project has this, and doing it badly costs the whole team daily.

## Key points

- Formatting is automated and non-negotiable; disable stylistic lint rules so tools do not conflict.
- Lint for correctness: hooks rules, type-aware TypeScript rules, and jsx-a11y.
- Import boundary rules turn architecture into a build failure instead of a review comment.
- Write custom rules for feedback you find yourself repeating in reviews.
- Type-aware rules are slow — run them in a separate CI job so the fast pass stays fast.
- Format on save, lint changed files pre-commit, run everything in CI.
- Introduce rules as warnings, fix, then promote — or they get blanket-disabled.
