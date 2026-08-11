---
title: Arrays and dynamic arrays
summary: Contiguous memory with constant-time indexing, and the resize-and-shift costs that make it the wrong shape for queues.
level: core
minutes: 20
order: 1
tags: [data-structures, fundamentals]

related:
  - cs-fundamentals/complexity/amortised-and-average-case-analysis
  - cs-fundamentals/data-structures/linked-structures-stacks-and-queues
  - cs-fundamentals/complexity/when-complexity-lies

resources:
  - title: Dynamic array
    url: https://en.wikipedia.org/wiki/Dynamic_array
    source: Wikipedia
    type: docs
    minutes: 15
  - title: Array — JavaScript reference
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
    source: MDN
    type: docs
    minutes: 20
    primary: true
  - title: Elements kinds in V8
    url: https://v8.dev/blog/elements-kinds
    source: V8
    type: article
    minutes: 25
  - title: Typed arrays
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays
    source: MDN
    type: docs
    minutes: 15
---

## In one line

An array is a contiguous block of memory where element `i` lives at a computable offset, which buys `O(1)` random access and charges `O(n)` for anything that changes the middle.

## What it is

The whole structure follows from that one property. Because elements are the same size and laid out end to end, the address of index `i` is `base + i × size` — one multiply and one add, no search. Reading and writing by index are constant time. Insertion or deletion anywhere but the end is linear, because everything after the touched index has to shift.

A **dynamic array** — JavaScript's `Array`, Python's `list`, Java's `ArrayList`, Rust's `Vec` — adds automatic growth. It holds a capacity larger than its length; appending is `O(1)` until capacity runs out, at which point it allocates a bigger buffer (typically 1.5–2×) and copies. That copy is `O(n)` but geometric growth makes appends `O(1)` amortised. The practical consequence in JS: `push` and `pop` are fast, and `shift` and `unshift` are `O(n)` because every element moves. A "queue" built from `push` and `shift` is quadratic over `n` items, and it is one of the most common accidental performance bugs in application code.

JavaScript arrays are not really arrays. They are objects with integer-ish keys and the engine optimises them into real contiguous storage when it can. V8 tracks "elements kinds" — packed small integers are fastest, then packed doubles, then packed elements, then the holey variants. Transitions only go one way: writing a string into an integer array, or creating a hole with `delete` or `arr[1000] = x` on a short array, permanently downgrades it and can push it into slow dictionary mode. Keep arrays dense and monomorphic in hot paths.

When you need real contiguous binary memory — pixel data, audio samples, WASM interop, network framing — use a `TypedArray` over an `ArrayBuffer`. Fixed length, fixed element type, no holes, no boxing.

## Why it matters

This is the structure you use for almost everything, so its costs set the baseline for every other choice. In a live-coding round the specific payoff is knowing that `shift` in a loop is quadratic and reaching for an index pointer or a deque instead — the difference between a solution that scales and one the interviewer immediately probes.

## Key points

- Constant-time indexing comes from contiguous layout and uniform element size; lose contiguity and you lose the property.
- Insert or delete anywhere but the tail is `O(n)` because the suffix shifts.
- Geometric resizing makes append amortised `O(1)`; a single append can still pay `O(n)` to copy.
- `push`/`pop` are `O(1)` and `shift`/`unshift` are `O(n)` — building a queue from `push` and `shift` is accidentally quadratic.
- Cache locality makes array iteration far faster than an equally-`O(n)` pointer walk, which is why arrays win in practice more often than the complexity table suggests.
- V8 element kinds degrade one way only — mixing types or creating holes deoptimises the array for its whole lifetime.
- Prefer `TypedArray` for binary or numeric bulk data; it removes boxing and guarantees contiguity.
- `splice` looks like one call and is a linear shift plus an allocation, which makes it a poor choice inside a loop.
