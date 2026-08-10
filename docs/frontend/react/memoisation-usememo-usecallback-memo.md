---
title: Memoisation — useMemo, useCallback & memo
summary: What each of the three actually caches, when memoising pays for itself, and why it so often does nothing.
level: core
minutes: 25
order: 11
tags: [react, performance, hooks]

related:
  - frontend/react/when-components-rerender
  - frontend/react/react-compiler
  - frontend/react/profiling-react-performance

resources:
  - title: Before You memo()
    url: https://overreacted.io/before-you-memo/
    source: Dan Abramov
    type: article
    minutes: 15
    primary: true
  - title: memo
    url: https://react.dev/reference/react/memo
    source: react.dev
    type: docs
    minutes: 20
  - title: useMemo
    url: https://react.dev/reference/react/useMemo
    source: react.dev
    type: docs
    minutes: 20
  - title: Understanding useMemo and useCallback
    url: https://www.joshwcomeau.com/react/usememo-and-usecallback/
    source: Josh W. Comeau
    type: article
    minutes: 25
---

## In one line

`useMemo` caches a value, `useCallback` caches a function identity, and `memo` skips a child's render when its props are shallow-equal — and all three are useless unless the thing they protect is genuinely expensive or the identity genuinely propagates.

## What it is

`memo` wraps a component and adds a shallow props comparison before rendering it. If every prop is `Object.is`-equal to last time, the render is skipped along with the whole subtree beneath it. The catch is that shallow comparison fails on any prop created inline during the parent's render — an object literal, an array, an arrow function — which is why an unaccompanied `memo` so often does nothing at all.

That is where the other two come in. `useCallback(fn, deps)` keeps the same function identity while deps are unchanged; `useMemo(() => value, deps)` does the same for a computed value. Their purpose in this context is to keep a memoised child's props stable, not to make the parent faster.

`useMemo` has a second, independent use: skipping an expensive computation. Sorting ten thousand rows, parsing a large payload, building an index. Here it pays for itself regardless of what is downstream — but "expensive" means measured, not assumed. Memoising `a + b` costs more than recomputing it: every hook allocates, stores a dependency array, and compares it every render.

The failure mode nobody counts is memory and complexity. A memoised value pins its dependencies for the component's lifetime, and a codebase where everything is wrapped becomes hard to read and easy to get subtly wrong — one forgotten dependency and you are debugging a stale closure instead of a slow render.

Structural fixes usually beat memoisation. Moving state down so fewer components re-render, and passing `children` through so a parent's state change cannot invalidate a subtree, both remove the work rather than caching around it — Dan Abramov's point in *Before You memo()*.

There is one hard guarantee worth knowing: `useMemo` is a performance hint, not a semantic one. React may discard the cache. Code that depends on the identity being stable for correctness is broken; use a ref or state.

## Why it matters

Reflexive memoisation is one of the clearest mid-level tells, and its cost is real: slower renders, more memory, and dependency arrays that go stale. The senior position is to profile first, fix the slow render, and memoise only where the measurement says it helps.

React Compiler shifts this — it inserts memoisation automatically and correctly — but knowing what it is doing on your behalf is what lets you read a compiled build and trust it.

## Key points

- `memo` compares props shallowly; a single inline object, array, or arrow prop defeats it entirely.
- `useCallback` and `useMemo` exist mainly to keep those props stable — they do nothing for a child that is not memoised.
- `useMemo` also skips expensive computation, but "expensive" has to be measured; wrapping cheap work is a net loss.
- Every memo hook costs an allocation, a dependency array, and a comparison on every render, plus retained memory.
- Moving state down and passing `children` as a prop remove re-renders structurally and are usually the better fix.
- `useMemo` is not a semantic guarantee — React may throw the cache away, so never rely on it for correctness.
