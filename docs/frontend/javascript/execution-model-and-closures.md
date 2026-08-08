---
title: Execution Contexts, Scope & Closures
summary: How JavaScript decides which variable a name refers to, and why a function keeps its birthplace alive long after that function has returned.
level: core
minutes: 25
order: 1
tags: [language, scope, memory]

related:
  - frontend/javascript/this-and-binding
  - frontend/javascript/memory-and-garbage-collection
  - frontend/javascript/utilities-from-scratch

resources:
  - title: "You Don't Know JS Yet: Scope & Closures"
    url: https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures
    source: Kyle Simpson
    type: book
    primary: true
  - title: Closures
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
    source: MDN
    type: docs
    minutes: 15
  - title: "JavaScript Visualized: Scope (Chain)"
    url: https://dev.to/lydiahallie/javascript-visualized-scope-chain-13pd
    source: Lydia Hallie
    type: article
    minutes: 10
  - title: Executable Code and Execution Contexts
    url: https://tc39.es/ecma262/#sec-executable-code-and-execution-contexts
    source: TC39, ECMA-262
    type: docs
    minutes: 20
---

## In one line

Scope is decided by where code is *written*, not where it runs, and a closure is a function holding a live reference to the scope it was created in.

## What it is

Every time a function is called, the engine creates an **execution context**: a record of its local bindings, plus a link to the scope it was defined in. Those links form the **scope chain**. Resolving a name walks that chain outward until it finds a binding or runs out and throws a `ReferenceError`.

The critical word is *defined*. JavaScript is lexically scoped: the chain is determined by the nesting of the source code, fixed before anything runs. Where a function is called from has no effect on which variables it can see. (`this` is the exception, and it is a separate mechanism — see the sibling topic.)

**Hoisting** is what falls out of the engine setting up bindings before executing statements. `var` declarations are created and initialised to `undefined` up front. `let` and `const` are created but left uninitialised, and touching one before its declaration throws — that gap is the **temporal dead zone**. Function declarations are fully hoisted, which is why you can call one written below the call site.

A **closure** is the consequence of two facts already stated: a function keeps a reference to its defining scope, and functions are values that can outlive the call that created them. Return an inner function and the outer call's bindings do not go away — the returned function still references them, so the garbage collector cannot reclaim them. That is the entire mechanism. There is no special "closure" object; there is a function that happens to have a live scope link.

The classic loop bug is the same fact seen from the other side. `var` creates one binding for the whole function, so every callback in the loop closes over the *same* variable and sees its final value. `let` creates a fresh binding per iteration, and the callbacks close over different ones.

Closures capture **variables, not values**. If the outer variable is reassigned after the closure is created, the closure sees the new value. This is what makes counters, memoisation, and module-pattern privacy work — and what makes stale-closure bugs in React effects possible.

## Why it matters

Closures are the substrate for a large amount of what you write daily: every event handler, every callback, every custom hook, every `debounce` or `memoize` implementation. Nearly every "why is my value stale?" bug in React — a `useEffect` reading an old `count`, an interval that never sees fresh state — is a closure capturing the binding from the render it was created in. Being able to say that out loud, rather than adding a dependency and hoping, is a direct senior signal.

It also shows up as the live-coding warm-up: implement `once`, `memoize`, or a private counter. Those questions are only checking whether you understand this.

## Key points

- Scope is lexical: it comes from where a function is written in the source, and calling it from somewhere else cannot change which variables it sees.
- A closure is not a distinct construct — it is a function still holding a reference to the scope it was defined in, which is why that scope survives the call that created it.
- Closures capture bindings, not snapshots. Reassign the outer variable and every closure over it observes the new value.
- `let` in a `for` loop creates one binding per iteration; `var` creates one for the whole function. That single difference is the entire classic loop-closure bug.
- The temporal dead zone is not a lint rule — `let` and `const` bindings genuinely exist but are uninitialised until the declaration executes, and reading one throws `ReferenceError`.
- A closure over a large object keeps that object alive indefinitely, which is a real and common source of memory leaks in long-lived SPA sessions.
- Stale-closure bugs in React are this mechanism, not a React quirk: the callback closed over the bindings from the render that created it.
