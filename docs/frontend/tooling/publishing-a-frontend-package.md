---
title: Publishing a Frontend Package
summary: Shipping a library others can consume — build outputs, exports maps, types, and the release process.
level: deep
minutes: 20
order: 7
tags: [tooling, publishing, libraries]

related:
  - frontend/tooling/module-resolution-and-exports-maps
  - frontend/tooling/tree-shaking-and-side-effects
  - frontend/architecture/versioning-shared-ui

resources:
  - title: Creating and publishing packages
    url: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
    source: npm
    type: docs
    minutes: 25
    primary: true
  - title: tsup
    url: https://tsup.egoist.dev/
    source: tsup
    type: docs
    minutes: 20
  - title: Are the types wrong?
    url: https://arethetypeswrong.github.io/
    source: arethetypeswrong
    type: docs
    minutes: 15
---

## In one line

A publishable package is judged by its `package.json`: the entry points, the conditions, the types, and whether it declares itself side-effect free.

## What it is

**Ship ESM.** CJS output is still worth including for the Node consumers who need it, but ESM is what enables tree shaking, and an ESM-only package is increasingly acceptable. Dual output means an `exports` map with `import` and `require` conditions — and awareness of the dual-package hazard, where both copies load and any internal state exists twice.

**The `package.json` fields that matter**: `exports` with `types` listed first in each condition, `main` and `module` as fallbacks for old tooling, `types` at the top level, `files` to limit what is published, `sideEffects` to enable consumer tree shaking, and `peerDependencies` for anything the host provides — React above all, because bundling it produces two Reacts and broken hooks.

**Types must resolve under the same conditions as the code.** A `.d.ts` that only resolves for CJS while the runtime is ESM is a common and confusing failure, and `arethetypeswrong` exists precisely to catch it before consumers do. Ship declaration maps too, so consumers' editors can jump to your source.

**Build tooling** for a library is a smaller problem than for an app: tsup wraps esbuild for the common case and emits both formats plus types in one command; unbuild and Rollup cover more complex needs. Do not minify library output — the consumer's bundler will, and minified code makes their debugging worse.

**Externalise dependencies.** Bundling React, or any peer, into your output is the classic mistake: it duplicates the library in every consumer and breaks anything relying on singleton identity.

**Release process**: Changesets for version and changelog generation, provenance attestation on publish so consumers can verify the artifact came from your CI, `npm publish --dry-run` to inspect the tarball before it is permanent, and a release automated from CI rather than run from a laptop with a personal token.

Two things that decide whether people adopt it: a **README that starts with a working example**, and a **CHANGELOG that explains migrations** rather than listing commits.

## Why it matters

Internal shared packages are near-universal past a few teams, so publishing well is a common task, and the failure modes are opaque from the consumer side — a broken `exports` map produces an error nobody can act on.

The peer-dependency and duplicate-React failure in particular is one people hit repeatedly and rarely diagnose quickly.

## Key points

- Ship ESM for tree shaking; add CJS deliberately and know the dual-package hazard.
- `exports` with `types` first per condition, plus `files`, `sideEffects`, and correct `peerDependencies`.
- Verify types resolve under every condition with `arethetypeswrong`, and ship declaration maps.
- Use tsup or similar; do not minify library output.
- Externalise peers — bundling React duplicates it and breaks hook identity in consumers.
- Automate releases from CI with Changesets and publish provenance.
- A working first example in the README and a migration-oriented changelog drive adoption.
