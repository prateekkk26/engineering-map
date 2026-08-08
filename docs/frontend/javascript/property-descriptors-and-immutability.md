---
title: Property Descriptors & Immutability
summary: What a property actually is beneath the syntax, and why `Object.freeze` protects less than people assume.
level: deep
minutes: 20
order: 11
tags: [language, objects, immutability]

related:
  - frontend/javascript/prototypes-and-classes
  - frontend/javascript/proxies-and-reflection
  - frontend/state-and-data/client-state-libraries

resources:
  - title: Object.defineProperty
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
    source: MDN
    type: docs
    minutes: 15
    primary: true
  - title: Object.freeze
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
    source: MDN
    type: docs
    minutes: 8
  - title: Immer — Introduction
    url: https://immerjs.github.io/immer/
    source: Immer
    type: docs
    minutes: 12
---

## In one line

Every property is a descriptor record with configurable flags, and "immutable" in JavaScript means shallow unless you did something extra.

## What it is

A property is not just a key and a value. It is a **descriptor**: either a data descriptor (`value`, `writable`) or an accessor descriptor (`get`, `set`), plus two flags both kinds share — `enumerable` (does it appear in `Object.keys`, `for...in`, and spread?) and `configurable` (can the descriptor be changed or the property deleted?).

Assignment (`obj.x = 1`) creates a property with all flags `true`. `Object.defineProperty` defaults them all to `false`, which is a genuine gotcha: define a property without specifying `writable` and you have silently created a read-only one. Class methods are non-enumerable by design, which is why they don't show up in `Object.keys(instance)` or get copied by spread.

**Accessors** are how getters and setters work, and they're the mechanism behind Vue 2's reactivity and older MobX. They're also invisible at the call site: `user.fullName` may be a computed getter doing real work, which matters when it appears inside a render loop.

**Immutability comes in levels**, and conflating them is the common error:

- `Object.preventExtensions` — no new properties; existing ones stay writable and deletable.
- `Object.seal` — the above plus non-configurable, so nothing can be deleted or redefined. Values still change.
- `Object.freeze` — the above plus non-writable. Values cannot change.

**`Object.freeze` is shallow.** Freeze an object holding a nested object and the nested one is untouched. A deep freeze means recursing yourself. Worse, in sloppy mode a write to a frozen property fails *silently*; in strict mode and ES modules it throws, which is one small reason strict mode is worth having.

In practice most "immutability" in React and Redux isn't enforced at all — it's a convention maintained by spread and by never mutating in place, because the comparison that decides whether to re-render is a reference check. Break the convention and components stop updating; the object changed but its identity didn't.

**Structural sharing** is the idea that makes this affordable: an update copies only the path from the root to the changed node and reuses every untouched subtree. Immer implements it with a Proxy that records your "mutations" and produces a new structurally-shared object, which is why Redux Toolkit lets you write `state.items.push(x)` safely.

## Why it matters

Reference identity is the engine behind React re-rendering, `useMemo`, `useEffect` dependencies, and every `memo` comparison. "Why does this re-render every time?" is usually a new object literal created during render; "why doesn't this update?" is usually a mutation that preserved identity. Both are this topic.

Descriptors are the lower-frequency half, but they explain why spread drops class methods and getters, and why `structuredClone` and `JSON.parse(JSON.stringify(x))` lose things — which comes up whenever someone tries to deep-clone state.

## Key points

- Every property carries `enumerable` and `configurable` flags plus either `value`/`writable` or `get`/`set`; plain assignment sets all flags true, `defineProperty` defaults them all false.
- Class methods are non-enumerable, so they are invisible to `Object.keys`, `for...in`, and object spread.
- `preventExtensions`, `seal`, and `freeze` are three distinct levels — only `freeze` makes existing values unwritable.
- `Object.freeze` is shallow; nested objects remain fully mutable unless you recurse.
- A write to a frozen property fails silently in sloppy mode and throws in strict mode and ES modules.
- React's re-render decision is a reference comparison, so mutating an object in place keeps its identity and prevents the update from being seen.
- Structural sharing copies only the path to the changed node, which is what makes immutable updates cheap enough to use everywhere.
- Immer wraps your object in a Proxy and records mutations to produce a new structurally-shared value — the reason Redux Toolkit's "mutating" syntax is safe.
