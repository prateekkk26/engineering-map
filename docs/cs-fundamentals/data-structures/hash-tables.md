---
title: Hash tables
summary: Average-case constant lookup bought with a hash function, spare capacity, and a collision strategy — plus the worst case everyone forgets.
level: core
minutes: 25
order: 2
tags: [data-structures, fundamentals]

related:
  - cs-fundamentals/algorithms/hashing-and-frequency-counting
  - cs-fundamentals/complexity/amortised-and-average-case-analysis
  - cs-fundamentals/data-structures/choosing-a-data-structure

resources:
  - title: Hash table
    url: https://en.wikipedia.org/wiki/Hash_table
    source: Wikipedia
    type: docs
    minutes: 30
    primary: true
  - title: Map — JavaScript reference
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    source: MDN
    type: docs
    minutes: 15
  - title: Hash flooding and SipHash in V8
    url: https://v8.dev/blog/hash-code
    source: V8
    type: article
    minutes: 15
  - title: Open addressing
    url: https://en.wikipedia.org/wiki/Open_addressing
    source: Wikipedia
    type: docs
    minutes: 15
---

## In one line

A hash table turns a key into an array index by hashing it, giving expected `O(1)` insert, lookup, and delete at the cost of extra memory and a worst case that degrades to a linear scan.

## What it is

Three moving parts. A **hash function** maps a key to an integer, ideally spreading keys uniformly and cheaply. A **bucket array** of size `m` where the slot is `hash(key) mod m`. And a **collision strategy**, because two keys will land in the same slot — with only 23 people in a room the odds of a shared birthday pass 50%, and buckets are far fewer than possible keys.

Collisions are handled one of two ways. **Chaining** puts a list (or, in some implementations, a tree) in each bucket; simple, tolerates high load factors, costs pointer indirection. **Open addressing** probes for the next free slot instead — linear probing, quadratic probing, or double hashing; better cache behaviour, but deletion needs tombstones and performance collapses as the table fills. Either way the table tracks a **load factor** (entries ÷ buckets) and rehashes everything into a bigger array when it crosses a threshold, typically around 0.75. That rehash is `O(n)`, amortised away over the inserts that caused it.

The worst case is `O(n)`: if every key collides, lookup is a scan of one bucket. This is not hypothetical. Hash-flooding attacks send keys chosen to collide — as query parameters, JSON fields, or headers — and turn a linear endpoint quadratic. Modern runtimes defend with a per-process random seed and a stronger hash such as SipHash, which is why hash order is not something you may rely on.

In JavaScript, use `Map` and `Set` rather than plain objects when keys are dynamic. `Map` accepts any value as a key, preserves insertion order, has a real `size`, and does not collide with `Object.prototype` — the last of which is a genuine security issue, since a user-controlled key of `__proto__` on a plain object is the entry point for prototype pollution. Objects are still the right choice for fixed, known-shape records.

## Why it matters

Hash-based counting and lookup is how most `O(n²)` interview solutions become `O(n)`, so this is the single highest-leverage structure to have automatic. Beyond the screen, the average-versus-worst-case distinction and prototype pollution both show up in real security review, and knowing why hash iteration order is not a contract prevents a whole class of flaky tests.

## Key points

- Expected `O(1)` for insert, lookup, and delete; worst case `O(n)` when keys collide into one bucket.
- Load factor drives resizing, and a rehash is an `O(n)` operation hidden inside an amortised `O(1)` insert.
- Chaining tolerates a high load factor; open addressing is more cache-friendly but needs tombstones and degrades sharply when full.
- Hash-flooding denial of service exploits the worst case directly, which is why runtimes randomise the hash seed per process.
- Never depend on iteration order for correctness — `Map` guarantees insertion order, a plain object's integer-like keys sort numerically, and a hash set in most languages guarantees nothing.
- Prefer `Map`/`Set` over objects for dynamic keys: arbitrary key types, `size`, no prototype chain, and no prototype-pollution surface.
- Keys must be hashable and stable — mutating an object after using it as a key in a hashed-by-value structure loses the entry.
- A hash table gives you membership and equality, never ordering or range queries; for those you need a sorted structure.
