---
title: Designing a Class API
summary: What makes an interface pleasant to use and hard to misuse — naming, argument shape, error handling, and the versioning consequences of every public method.
level: core
minutes: 20
order: 2
tags: [lld, api-design, interfaces]

related:
  - frontend/architecture/component-api-design
  - system-design/low-level-design/object-oriented-design-in-an-interview
  - system-design/frontend-system-design/frontend-api-design

resources:
  - title: How to Design a Good API and Why It Matters
    url: https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/32713.pdf
    source: Joshua Bloch
    type: article
    minutes: 30
    primary: true
  - title: Semantic Versioning
    url: https://semver.org/
    source: semver.org
    type: docs
    minutes: 10
  - title: Parse, Don't Validate
    url: https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
    source: Alexis King
    type: article
    minutes: 25
---

## In one line

A good API is easy to use correctly, hard to use incorrectly, and small enough that you can keep supporting all of it.

## What it is

**Public surface is a permanent commitment.** Everything you expose has to keep working, so expose the minimum. Start with the smallest interface that satisfies the use cases and add on demand — removing a method is a breaking change, adding one is not. "When in doubt, leave it out" is the whole heuristic.

**Names carry the documentation.** A method whose name doesn't tell you what it does forces a trip to the source. Be consistent — if it's `getUser`, it isn't `fetchAccount` next door. Avoid abbreviations, and let the name state the effect: `save()` versus `saveIfChanged()` are genuinely different promises.

**Argument shape.** Two or three positional parameters is fine; beyond that, an options object, because `resize(400, 300, true, false)` is unreadable at the call site and a silent bug when the booleans get swapped. Never take a boolean that switches behaviour — that's two methods with one name. Take the narrowest type that works, and prefer a domain type over a primitive: a `UserId` instead of a `string` makes an entire class of mix-ups impossible.

**Parse, don't validate.** Do the check once at the boundary and return a type that carries the guarantee, so downstream code can't be handed something invalid. This is what "make illegal states unrepresentable" means concretely, and it removes defensive checks from every function below.

**Errors are part of the interface.** Decide and state: which failures are exceptions, which are return values, which are silent no-ops. Programmer errors (a null argument, an invalid state) should fail loudly and immediately. Expected failures (not found, conflict, rate limited) are a normal outcome and deserve a typed result rather than a generic exception. Whatever you choose, be consistent — an API where half the failures throw and half return `null` is exhausting.

**Hide the implementation.** No mutable internal state exposed, no leaked collection references the caller can mutate, no return types from a library you might want to replace. Every implementation detail visible from the outside becomes something you can't change without breaking someone.

**Symmetry and predictability.** If there's `subscribe`, there's `unsubscribe`. If there's `open`, there's `close`, and it's safe to call twice. Anything that acquires a resource says clearly who releases it. Consistency lets the reader guess correctly, which is the real measure of a good API.

**Then version it honestly.** Semantic versioning, deprecate before removing, and give a migration path. If you're publishing something others depend on, the deprecation cycle is part of the design, not an afterthought.

## Why it matters

This is the most transferable page in the subsection: it's the difference between a codebase that's pleasant to work in and one that isn't, and it's what code review is mostly about. In interviews it shows up whenever you're asked to build a module, a hook, or a component — and "here's the interface, here's what I deliberately left out" is a strong way to open.

## Key points

- Expose the minimum; adding is easy, removing is a breaking change.
- Names should make a trip to the source unnecessary, and stay consistent across the surface.
- Past two or three arguments use an options object; never take a behaviour-switching boolean.
- Prefer domain types over primitives so mismatched arguments can't compile.
- Parse at the boundary and return a type carrying the guarantee, instead of validating repeatedly.
- Decide deliberately which failures throw and which return, and be consistent about it.
- Fail loudly on programmer errors; return typed results for expected failures.
- Leak no internal state or third-party types — anything visible becomes unchangeable.
- Keep operations symmetric and idempotent where callers would expect it.
