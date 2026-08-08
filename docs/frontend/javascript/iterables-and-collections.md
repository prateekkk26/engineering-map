---
title: Iterables, Maps, Sets & Cloning
summary: The protocol that makes `for...of` and spread work, and when a Map genuinely beats an object.
level: core
minutes: 20
order: 12
tags: [language, collections]

related:
  - frontend/javascript/generators-and-async-iteration
  - frontend/javascript/memory-and-garbage-collection

resources:
  - title: Iteration protocols
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
    source: MDN
    type: docs
    minutes: 15
    primary: true
  - title: Keyed collections
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections
    source: MDN
    type: docs
    minutes: 12
  - title: structuredClone()
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
    source: MDN
    type: docs
    minutes: 8
---

## In one line

Anything with a `[Symbol.iterator]` method works with `for...of`, spread, and destructuring — including objects you write yourself.

## What it is

The **iterable protocol** is one method: `[Symbol.iterator]()` returning an iterator, which is any object with a `next()` that returns `{ value, done }`. Arrays, strings, `Map`, `Set`, `NodeList`, and `arguments` all implement it. Plain objects do not, which is why `for...of` over an object throws and you need `Object.entries` first.

Everything that "just works" on arrays is this protocol: `for...of`, array spread, destructuring, `Array.from`, `Promise.all`'s argument. Implement `[Symbol.iterator]` on your own class — most easily with a generator method — and all of it works on your type too.

**`Map` vs object** is a real decision, not a style preference. `Map` accepts any value as a key, including objects and functions; object keys are coerced to strings, so `obj[1]` and `obj["1"]` collide. `Map` preserves insertion order for all key types and exposes `.size` directly. It has no prototype chain, so there's no `"constructor"` or `"__proto__"` key hazard and no need for `hasOwnProperty` guards. Use `Map` when keys are dynamic, non-string, or when you're inserting and deleting frequently; use an object for fixed, known-shape records — and note that objects serialise to JSON while Maps do not.

**`Set`** gives O(1) membership and deduplication: `[...new Set(arr)]` is the idiomatic unique. It uses SameValueZero, so `NaN` deduplicates correctly — unlike `indexOf`.

**`WeakMap` and `WeakSet`** hold keys weakly: an entry disappears when its key is garbage collected. This makes them the correct tool for attaching metadata to objects you don't own — caching a computed value per DOM node, tracking which objects a library has already processed — without preventing those objects from being collected. They aren't iterable and have no `.size`, precisely because their contents can vanish at any time.

**Cloning** has three levels worth distinguishing. Spread and `Object.assign` are shallow — nested objects stay shared. `JSON.parse(JSON.stringify(x))` is deep but lossy: it drops `undefined`, functions, and `Symbol`s, turns `Date` into a string, and throws on cycles. `structuredClone` is the built-in correct answer — deep, handles `Date`, `Map`, `Set`, `ArrayBuffer`, and cyclic references, and fails loudly on functions and DOM nodes rather than silently mangling them.

## Why it matters

Choosing `Map` over an object for a lookup keyed by ID, or a `Set` for membership checks instead of `array.includes` inside a loop, is the difference between O(1) and O(n²) — and it's exactly the kind of thing a reviewer flags in a take-home with a large list.

`WeakMap` shows up whenever you need per-object state without a leak, and being able to name it as the answer is a small but real senior signal. Cloning comes up constantly and `structuredClone` is still under-known.

## Key points

- The iterable protocol is a single `[Symbol.iterator]` method, and implementing it — usually as a generator — makes your own type work with `for...of`, spread, and destructuring.
- Plain objects are not iterable; `for...of` requires `Object.keys`, `Object.values`, or `Object.entries` first.
- `Map` keys can be any value and preserve insertion order, while object keys are coerced to strings — so `obj[1]` and `obj["1"]` are the same property.
- `Map` has no prototype chain, avoiding the inherited-key hazards that make `hasOwnProperty` guards necessary on objects.
- Objects serialise to JSON and Maps do not, which is usually the deciding factor when the value crosses a network or storage boundary.
- `Set` provides O(1) membership; replacing `array.includes` inside a loop with a `Set` turns O(n²) into O(n).
- `WeakMap` holds keys weakly, making it the right way to attach metadata to objects you don't own without preventing their collection.
- `structuredClone` is the correct deep clone — the `JSON.parse(JSON.stringify(x))` idiom silently drops `undefined`, functions, and `Symbol`s and destroys `Date` objects.
