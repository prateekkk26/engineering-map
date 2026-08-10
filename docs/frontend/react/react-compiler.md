---
title: React Compiler
summary: A build-time optimiser that inserts memoisation for you, what it requires of your code, and what it does not fix.
level: deep
minutes: 20
order: 24
tags: [react, performance, tooling, react-19]

related:
  - frontend/react/memoisation-usememo-usecallback-memo
  - frontend/react/react-mental-model
  - frontend/tooling/how-bundlers-work

resources:
  - title: React Compiler
    url: https://react.dev/learn/react-compiler
    source: react.dev
    type: docs
    minutes: 25
    primary: true
  - title: react-compiler
    url: https://github.com/facebook/react/tree/main/compiler
    source: facebook/react
    type: repo
  - title: Rules of React
    url: https://react.dev/reference/rules
    source: react.dev
    type: docs
    minutes: 20
---

## In one line

React Compiler is a Babel plugin that analyses components at build time and inserts memoisation automatically, so hand-written `useMemo`, `useCallback`, and `memo` largely stop being necessary.

## What it is

Manual memoisation has always been a bad deal: you have to identify the right places, write dependency arrays by hand, keep them correct as the code changes, and accept a cost everywhere you guessed wrong. Getting it right is mechanical work — which is what compilers are for.

The compiler reads each component and hook, works out which values depend on which, and rewrites the function to cache results in a hidden slot per component instance. Rather than the coarse-grained "did any prop change?" of `memo`, it caches at the granularity of individual expressions, so a component can skip recomputing one derived value while still re-rendering for another.

It can only do this because React's rules give it guarantees to lean on: components are pure functions of props and state, values are not mutated after being used in render, and hooks are called unconditionally at the top level. Where the compiler cannot prove the rules hold — a mutation it cannot follow, a ref read during render, a dynamic hook call — it bails out for that component and leaves it untouched. Silent bail-outs are the normal failure mode, and the ESLint rule plus the compiler's own diagnostics are how you find them.

Adoption is incremental. It is a build-step plugin, can be scoped to a directory, and existing `useMemo` calls keep working — the compiler generally leaves correct manual memoisation in place. There is no runtime and no change to how you write components; the output is ordinary React.

What it does not do is worth stating plainly. It does not make a genuinely expensive computation cheaper, only run less often. It does not fix a context re-rendering its consumers, an over-long list that needs virtualisation, or a slow network waterfall. And it does not excuse impure code — it makes purity load-bearing, because a component that breaks the rules now silently misses optimisation or, in the worst case, behaves differently than the author expected.

## Why it matters

This is the current direction of the ecosystem, and it shifts what good React code looks like: less memoisation noise, more emphasis on following the rules. Interviewers ask about it to see whether you understand *why* the rules of React exist, now that a tool depends on them.

Practically, it also means reflexive `useCallback` in new code is even harder to justify — the compiler will do it better, and only where it pays.

## Key points

- The compiler is a build-time Babel plugin that inserts fine-grained memoisation; there is no runtime component.
- It caches per expression rather than per component, which is more precise than `memo` plus manual hooks.
- Its correctness depends on the Rules of React — purity, no mutation of rendered values, unconditional hooks.
- When it cannot prove a component is safe it silently skips it; the lint rule and compiler diagnostics are how you notice.
- Adoption is incremental and directory-scoped, and existing correct memoisation keeps working.
- It reduces re-render frequency; it does not fix expensive computations, context fan-out, huge lists, or network waterfalls.
