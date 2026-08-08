---
title: "`this` and Function Binding"
summary: The four rules that decide what `this` refers to, and why arrow functions ignore all of them.
level: core
minutes: 20
order: 2
tags: [language, scope]

related:
  - frontend/javascript/execution-model-and-closures
  - frontend/javascript/prototypes-and-classes

resources:
  - title: "You Don't Know JS Yet: Objects & Classes — this"
    url: https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/objects-classes
    source: Kyle Simpson
    type: book
    primary: true
  - title: this
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
    source: MDN
    type: docs
    minutes: 12
  - title: Arrow function expressions
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
    source: MDN
    type: docs
    minutes: 10
---

## In one line

`this` is not decided by where a function is defined — it is decided by how the function is called, with arrow functions being the one exception that has no `this` of its own at all.

## What it is

For a normal function, `this` is bound at call time by four rules, checked in order of precedence:

1. **`new`** — `new Fn()` creates a fresh object and binds `this` to it.
2. **Explicit binding** — `fn.call(obj)`, `fn.apply(obj)`, or a function produced by `fn.bind(obj)`. `bind` is permanent: a bound function cannot be rebound.
3. **Implicit binding** — `obj.fn()` binds `this` to `obj`. Only the call site matters, not where `fn` was defined.
4. **Default** — everything else. `undefined` in strict mode and in ES modules, the global object in sloppy mode.

Rule 3 is where the classic bug lives. `const f = obj.method; f()` loses the binding entirely, because the call site no longer has a receiver. Passing a method as a callback — `setTimeout(obj.method, 0)`, `arr.map(obj.method)` — is the same thing, which is why `this is undefined` used to be the single most common error in React class components.

**Arrow functions are not part of this system.** They have no `this` binding, so `this` inside one resolves lexically, exactly like any other variable — up the scope chain to the nearest enclosing normal function. That makes them the right default for callbacks and the wrong choice for object methods and prototype methods, because there `this` needs to be the receiver. `call`, `apply`, and `bind` cannot change an arrow function's `this`; they silently do nothing.

Class fields (`handleClick = () => {}`) work by defining an arrow function per instance in the constructor, which is why they capture the instance correctly and why they cost one function object per instance rather than one per class.

In the DOM, `addEventListener` binds `this` to the element the listener is attached to — unless you pass an arrow function, in which case it doesn't, and you need `event.currentTarget` instead.

## Why it matters

This is the second-most-common source of "works in isolation, breaks when passed around" bugs after closures, and it comes up directly in interviews: implement `bind` from scratch, or explain why a callback lost its receiver. The implementation question is a real one — writing `myBind` requires you to state the rules precisely rather than gesture at them.

It also decides everyday API design. Whether a library takes a callback or a method changes whether consumers have to think about binding at all.

## Key points

- `this` is determined by the call site, not the definition site — the exact inverse of how variable scope works.
- Precedence is `new` → explicit (`call`/`apply`/`bind`) → implicit (`obj.fn()`) → default, and a `bind`-produced function cannot be rebound afterwards.
- Extracting a method from its object (`const f = obj.m`) drops the receiver, because implicit binding is a property of the call expression, not of the function.
- Arrow functions have no `this` of their own; it resolves lexically through the scope chain, and `call`/`apply`/`bind` cannot override it.
- Use arrows for callbacks, normal functions for object and prototype methods — an arrow method gets the module or class-body `this`, never the instance.
- In strict mode and ES modules the default binding is `undefined`, not the global object, so a lost binding throws instead of silently mutating globals.
- Class fields assigned arrow functions create one function per instance; prototype methods create one per class. That's a real memory tradeoff when instances number in the thousands.
