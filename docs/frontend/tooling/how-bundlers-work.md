---
title: How Bundlers Work
summary: Dependency graph, transform, chunk, emit — and why the ecosystem moved from webpack to Vite, esbuild and Turbopack.
level: core
minutes: 25
order: 2
tags: [tooling, bundlers, build]

related:
  - frontend/tooling/tree-shaking-and-side-effects
  - frontend/tooling/code-splitting-strategy
  - frontend/tooling/transpilation-and-browser-targets

resources:
  - title: Why Vite
    url: https://vite.dev/guide/why.html
    source: Vite
    type: docs
    minutes: 20
    primary: true
  - title: Concepts
    url: https://webpack.js.org/concepts/
    source: webpack
    type: docs
    minutes: 30
  - title: esbuild
    url: https://esbuild.github.io/
    source: esbuild
    type: docs
    minutes: 20
---

## In one line

A bundler builds a graph from your entry points, transforms each module, groups them into chunks, and emits files — and the differences between tools are mostly about when that work happens.

## What it is

The pipeline is the same everywhere. **Resolve** each import to a file. **Load and transform** it — TypeScript to JavaScript, JSX to calls, CSS to something injectable. **Build the graph** by following imports transitively. **Optimise**: tree-shake unreachable exports, minify, hoist. **Chunk**: decide which modules go in which output file. **Emit**, with hashed filenames and a manifest.

**Development changed the most.** Webpack bundles the whole application before serving it, so startup grows with project size and a cold start on a large app is minutes. Vite exploits native ES modules in the browser: it serves source files individually and transforms them on request, so startup is near-instant regardless of size, and HMR touches only the changed module. Dependencies are pre-bundled with esbuild because thousands of tiny CommonJS files over HTTP would be slower than bundling them once.

**Speed came from changing language.** esbuild in Go and SWC, Turbopack and Rolldown in Rust are ten to a hundred times faster than JavaScript-based tooling, which is why they now sit under nearly every modern toolchain — including as the default in Next 16, where Turbopack builds both dev and production.

**The dev/production split** is a deliberate trade with a cost: Vite historically served unbundled in development and bundled with Rollup for production, so the two are different pipelines and a bug can appear in only one. Rolldown exists to close that gap by using the same bundler for both.

What still matters when configuring one: **entry points** (usually route-derived), **loaders and plugins** for non-JavaScript imports, **aliases** — which must be duplicated in `tsconfig` or the editor disagrees with the build — **externals** for anything provided by the host page, and the **target**, which decides how much down-levelling happens.

The most useful diagnostic habit: read the build output. A bundle analyzer answers "why is this large?" and the module graph answers "why is this included?" — usually a single import pulling in a whole library.

## Why it matters

Build configuration is where a lot of unexplained behaviour lives — the import that works in dev and fails in production, the dependency that appears in the bundle twice — and understanding the pipeline turns those into tractable questions.

The tooling shift is also a currency check: describing webpack as the default is dated in 2026.

## Key points

- Every bundler resolves, transforms, graphs, optimises, chunks, and emits — the differences are in timing.
- Vite serves native ES modules in development, so startup does not scale with project size.
- Dependencies are pre-bundled because many small CJS modules over HTTP is slower than one bundle.
- Go and Rust tooling — esbuild, SWC, Turbopack, Rolldown — is the reason builds got fast.
- A different dev and production pipeline means bugs that appear in only one; Rolldown addresses that.
- Keep bundler aliases and `tsconfig` paths in sync or the editor and build disagree.
- Read the analyzer and the module graph before optimising anything.
