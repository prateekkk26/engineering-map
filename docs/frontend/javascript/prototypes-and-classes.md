---
title: Prototypes, Inheritance & Classes
summary: Why JavaScript objects delegate to other objects rather than copy from blueprints, and what `class` is actually doing underneath.
level: core
minutes: 25
order: 3
tags: [language, objects]

related:
  - frontend/javascript/this-and-binding
  - frontend/javascript/property-descriptors-and-immutability

resources:
  - title: Inheritance and the prototype chain
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain
    source: MDN
    type: docs
    minutes: 20
    primary: true
  - title: Classes
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
    source: MDN
    type: docs
    minutes: 15
  - title: Prototypal inheritance
    url: https://javascript.info/prototype-inheritance
    source: javascript.info
    type: article
    minutes: 15
---

## In one line

JavaScript objects don't copy structure from a blueprint — they hold a live link to another object and fall back to it when a property isn't found.

## What it is

Every JavaScript object has an internal link to another object — its **prototype**. When you read a property the engine checks the object itself, then its prototype, then that object's prototype, until it finds the property or reaches `null`. That chain is the entire inheritance mechanism.

The word "inheritance" is misleading. Nothing is copied. The object **delegates**: it holds a live reference, so adding a method to a prototype makes it immediately available on every existing object linked to it. Classical inheritance copies structure from a blueprint at construction time; JavaScript links objects at runtime.

Writes do not delegate. Assigning `obj.x = 1` always creates or updates a property on `obj` itself, even if `x` exists on the prototype — it **shadows** rather than mutates. This asymmetry between read and write is where most prototype confusion starts, and it is why mutating a shared array on a prototype affects every instance while assigning a number does not.

`Function.prototype` is a separate idea with an unfortunately similar name. A function's `.prototype` property is not that function's own prototype — it is the object that will become the prototype of instances built with `new`. `new Fn()` creates an object whose prototype is `Fn.prototype`, calls `Fn` with `this` bound to it, and returns it unless the constructor explicitly returns an object.

`class` is syntax over exactly this. Methods go on `Klass.prototype`, `extends` sets up the prototype chain between both the prototypes and the constructors themselves, and `super` walks it. What `class` genuinely adds beyond sugar: the body is always strict mode, the constructor throws if called without `new`, methods are non-enumerable, and `#private` fields are real hard privacy enforced by the engine — not a naming convention.

`Object.create(proto)` makes the mechanism explicit and is worth being able to reach for. `__proto__` is the legacy accessor for it; `Object.getPrototypeOf` and `Object.setPrototypeOf` are the supported API, and the setter is a genuine performance cliff because it invalidates the engine's optimisations for that object.

## Why it matters

You will not write raw prototype code often, but you will read stack traces, library internals, and polyfills that do — and any "how does `class` work in JS?" question is really this question. Interviewers use it because it separates people who learned the syntax from people who learned the language.

Practically, it explains why `instanceof` fails across iframes and bundled copies of a library, why `Object.keys` skips inherited properties, and why extending built-ins like `Array` is a trap.

## Key points

- Property lookup walks the prototype chain; property assignment never does, and always creates or shadows an own property on the receiving object.
- Prototypes delegate rather than copy, so mutating a prototype at runtime is visible immediately on every object already linked to it.
- A function's `.prototype` property is the prototype that its `new`-constructed instances receive — it is not the function's own prototype.
- `class` is syntax over prototypes, but it adds enforced strict mode, a `new` requirement, non-enumerable methods, and genuinely private `#` fields.
- `instanceof` tests whether a constructor's `.prototype` appears anywhere in the object's chain — which is why it breaks across realms and duplicate library copies, and why `Array.isArray` exists.
- `Object.setPrototypeOf` and `__proto__` assignment deoptimise the object in every major engine; build the chain at creation time with `Object.create` or `class` instead.
- `for...in` walks inherited enumerable properties while `Object.keys` returns own enumerable ones — the reason `hasOwnProperty` guards litter older code.
