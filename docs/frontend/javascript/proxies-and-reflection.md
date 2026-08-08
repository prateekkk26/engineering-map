---
title: Proxies & Reflection
summary: Intercepting the fundamental operations on an object — the mechanism behind Immer, Vue reactivity, and most mocking libraries.
level: deep
minutes: 20
order: 13
tags: [language, objects, metaprogramming]

related:
  - frontend/javascript/property-descriptors-and-immutability
  - frontend/state-and-data/client-state-libraries

resources:
  - title: Proxy
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
    source: MDN
    type: docs
    minutes: 20
    primary: true
  - title: Reflect
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect
    source: MDN
    type: docs
    minutes: 12
  - title: "Proxy and Reflect"
    url: https://javascript.info/proxy
    source: javascript.info
    type: article
    minutes: 20
---

## In one line

A `Proxy` wraps an object and lets you intercept the primitive operations performed on it — reads, writes, deletes, `in`, function calls — while `Reflect` gives you the default behaviour for each one.

## What it is

`new Proxy(target, handler)` returns an exotic object that forwards every operation to `target` unless the handler defines a **trap** for it. The traps map one-to-one onto the internal methods in the spec: `get`, `set`, `has`, `deleteProperty`, `ownKeys`, `apply`, `construct`, and several more.

`Reflect` is the companion: `Reflect.get(target, prop, receiver)` performs exactly what a normal property read would. Traps are almost always written as "do my extra thing, then delegate to `Reflect`," which is both shorter and more correct than reimplementing the default. Passing `receiver` through matters when the target has getters — without it, `this` inside a getter points at the raw target rather than the proxy, and the interception silently stops working one level down.

Proxies are shallow. Reading a nested object returns the raw nested object, unproxied. Libraries that need deep interception wrap on access: the `get` trap returns a new proxy for object values, building the tree lazily as it's touched. That's how Immer and Vue 3's `reactive` cover a whole state tree without walking it up front.

Three uses account for most real proxies. **Change tracking** — Immer records writes against a draft proxy and produces a structurally-shared next state, which is why Redux Toolkit's mutating syntax is safe. **Reactivity** — Vue 3 records which proxy properties were read during a render and re-runs it when one is written. **Test doubles and dev-time guards** — auto-mocking objects, or throwing on reads of undefined config keys instead of returning `undefined`.

There are hard limits. Proxies cannot be made fully transparent: `===` compares proxy to target as different objects, and any code holding the raw object bypasses the proxy entirely. Private `#` fields don't work through a proxy because they're keyed on the actual instance. Invariants are enforced — a `get` trap must return the real value for a non-configurable, non-writable property, or it throws. And there is a genuine cost: proxied property access is meaningfully slower than direct access, so proxies belong at boundaries, not inside hot loops.

## Why it matters

You rarely write a proxy, but you use several every day, and "how does Immer let me mutate state safely?" or "how does Vue know what to re-render?" are real interview questions with a real answer. Being able to give it — rather than "it's magic" — reads as someone who has looked inside their tools.

It's also the honest answer to a class of design questions: how would you audit every access to an object, or build a dev-only strict mode for your config?

## Key points

- A `Proxy` intercepts the object's internal operations via traps, and any operation without a trap forwards to the target unchanged.
- `Reflect` supplies each trap's default behaviour, so the correct trap body is "do the extra work, then delegate to `Reflect`."
- Forward the `receiver` argument to `Reflect.get`/`set`, or getters on the target run with `this` bound to the raw object and the interception breaks.
- Proxies are shallow — deep interception requires returning a new proxy from the `get` trap, which is how Immer and Vue cover nested state lazily.
- Immer records writes to a draft proxy and emits a structurally-shared next state, which is what makes Redux Toolkit's mutating syntax correct.
- A proxy is never `===` its target, and any reference to the raw object bypasses it entirely — so transparency is not achievable.
- Private `#` fields are keyed on the real instance and are not accessible through a proxy wrapper.
- Proxied access carries real overhead; use proxies at boundaries and dev-time tooling, not in hot rendering paths.
