---
title: Engine Internals & Optimisation
summary: How V8 turns your code into machine code, and the small number of habits that keep it on the fast path.
level: deep
minutes: 25
order: 15
tags: [runtime, performance]

related:
  - frontend/javascript/memory-and-garbage-collection
  - frontend/performance/inp-and-long-tasks

resources:
  - title: JavaScript engines — how do they even?
    url: https://www.youtube.com/watch?v=p-iiEDtpy6I
    source: Franziska Hinkelmann, JSConf EU
    type: video
    minutes: 25
    primary: true
  - title: Sea of Nodes / Maglev — V8 blog
    url: https://v8.dev/blog
    source: V8
    type: article
    minutes: 20
  - title: "JavaScript engine fundamentals: Shapes and Inline Caches"
    url: https://mathiasbynens.be/notes/shapes-ics
    source: Mathias Bynens
    type: article
    minutes: 20
---

## In one line

Modern engines start interpreting immediately and progressively recompile hot code using assumptions about the shapes of your objects, so consistency matters more than cleverness.

## What it is

V8 parses to bytecode and runs it in **Ignition**, an interpreter, straight away — no waiting for compilation. While it runs, it collects type feedback. Functions that get hot are handed to optimising compilers (**Maglev**, then **TurboFan**) which generate machine code specialised to the types actually observed. If a later call violates those assumptions, the code **deoptimises** back to bytecode and the process starts over.

The key concept is **hidden classes** (V8 calls them Shapes, other engines call them Maps). Objects with the same properties added in the same order share one shape, and a property access compiles to a fixed memory offset rather than a hash lookup. Add properties in a different order and you get a different shape. Delete a property and the object may fall into dictionary mode, where every access is a hash lookup — permanently slower.

**Inline caches** build on this. A property access site remembers the shape it saw. One shape is *monomorphic* and fastest. A few shapes is *polymorphic* and slower. Beyond about four it goes *megamorphic* and gives up on the fast path entirely. This is why a function called with consistently-shaped objects outperforms the same function called with a grab bag of shapes.

The practical habits that follow are few and undramatic: initialise all properties in the constructor rather than adding them conditionally later; keep property order consistent; prefer `obj.x = undefined` over `delete obj.x`; and avoid mixing element types in an array — V8 tracks arrays as packed-small-int, packed-double, or packed/holey-element, and each transition is one-way and slower. Creating a hole with `arr[100] = x` on a short array is a real cliff.

There are things that *were* deoptimisation triggers and no longer are. `try`/`catch` is fine in modern V8. `let`/`const` are fine. Arrow functions are fine. Much of the folk wisdom is a decade out of date, and repeating it in an interview dates you.

The honest framing: **this is almost never your bottleneck.** Frontend performance is dominated by network, bundle size, layout, paint, and doing too much work at all. Micro-optimising object shapes before profiling is the wrong instinct, and saying so is the mature answer. Where it does matter is genuinely hot code — a tight loop over 100k records, a virtualised grid's row renderer, a parser — and there it can matter a lot.

## Why it matters

This is the follow-up after you've said "profile first": *what would you actually change?* Being able to explain why a polymorphic call site is slow, and why a `delete` in a hot loop is worse than it looks, distinguishes a real performance answer from a memorised list of tips.

It also inoculates you against cargo-cult advice, which is itself a senior signal — being able to say "that hasn't been true since Crankshaft was retired" is more useful than knowing another trick.

## Key points

- V8 interprets bytecode immediately and only optimises hot functions, using observed type feedback — which means the first runs are always slow and steady-state performance is what benchmarks should measure.
- Objects sharing property names in the same insertion order share a hidden class, letting property access compile to a fixed offset.
- Inline caches are fastest when a call site is monomorphic; beyond roughly four shapes it goes megamorphic and abandons the fast path.
- `delete` can drop an object into dictionary mode, making every subsequent access a hash lookup — assign `undefined` instead in hot code.
- Initialise every property in the constructor so instances share one shape rather than diverging as properties are added conditionally.
- Array element kinds transition one way only, from packed integers toward holey generic elements, and creating holes is an irreversible slowdown.
- `try`/`catch`, `let`/`const`, and arrow functions are no longer deoptimisation triggers — that advice is a decade stale.
- Engine-level optimisation is rarely the bottleneck in a frontend app; network, bundle size, and layout dominate, and saying so before reaching for shapes is the correct instinct.
