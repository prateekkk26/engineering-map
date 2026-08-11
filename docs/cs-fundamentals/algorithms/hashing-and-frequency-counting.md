---
title: Hashing and frequency counting
summary: The single highest-yield pattern in a live-coding screen — trade memory for a lookup table and a nested loop collapses to one pass.
level: core
minutes: 20
order: 1
tags: [algorithms, patterns, hashing]

related:
  - cs-fundamentals/data-structures/hash-tables
  - cs-fundamentals/complexity/time-space-and-the-tradeoff
  - cs-fundamentals/algorithms/two-pointers-and-sliding-window

resources:
  - title: Two Sum — the canonical hash-map problem
    url: https://leetcode.com/problems/two-sum/
    source: LeetCode
    type: article
    minutes: 15
    primary: true
  - title: Object.groupBy()
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
    source: MDN
    type: docs
    minutes: 10
  - title: collections.Counter
    url: https://docs.python.org/3/library/collections.html#collections.Counter
    source: Python
    type: docs
    minutes: 10
  - title: Set operations in JavaScript
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    source: MDN
    type: docs
    minutes: 15
---

## In one line

Whenever a solution needs "have I seen this before" or "how many of these are there", build a map in one pass instead of searching in a nested one.

## What it is

The pattern has three recurring shapes.

**Seen-set.** Walk the input once, and for each element ask whether its complement, pair, or duplicate is already in a set. Two-sum is the archetype: for each `x`, check whether `target - x` is in the map, then add `x`. One pass, `O(n)` time, `O(n)` space, replacing the obvious `O(n²)` double loop. The same move solves duplicate detection, first non-repeating character, intersection of arrays, and cycle detection over object references.

**Frequency map.** Count occurrences into a `Map`, then answer questions from the counts. Anagram checking compares two count maps. Top-k frequent elements builds counts then takes the k largest — with a heap for `O(n log k)`, or with bucket sort by count for `O(n)`, since no count can exceed `n`. Majority element, character histograms, and "does this string have all unique characters" are all this.

**Grouping by a computed key.** Derive a canonical key from each item and bucket by it. Group anagrams by sorted letters. Group by day, by user, by normalised email. `Object.groupBy` and `Map.groupBy` do this natively now, and `reduce` into a `Map` is the portable version. The important discipline is not spreading the accumulator into a new object each iteration — `{...acc, [k]: v}` inside a reduce is quadratic and it is one of the most common accidental complexity bugs in real React and Node code.

Three practical cautions. Object keys stringify, so `map[1]` and `map["1"]` collide and `map[{a:1}]` becomes `"[object Object]"` — use `Map` when key type matters. Composite keys need explicit encoding, usually a delimiter-joined string, and the delimiter must not appear in the values. And `Set` membership uses SameValueZero, so it works for primitives and object identity but never for structural equality — two distinct objects with identical fields are two entries.

## Why it matters

If a live-coding problem involves finding, counting, deduplicating, or pairing, this pattern is the answer more often than everything else combined. It is also the fastest legitimate improvement to announce out loud: recognising the nested loop, naming the `O(n)` space cost, and writing the one-pass version is exactly the sequence an interviewer is scoring.

## Key points

- A hash lookup turns "search the rest of the array" into `O(1)`, collapsing the standard `O(n²)` scan into a single `O(n)` pass.
- Two-sum's insight is checking for the complement *before* inserting the current element, which handles the self-pairing edge case for free.
- Frequency maps answer anagram, majority, top-k, and histogram questions from one pass of counting.
- Top-k is `O(n log k)` with a heap, or `O(n)` with bucket-by-count, because a count can never exceed the input length.
- Group by a *canonical* key — sorted letters, a normalised date, a rounded bucket — and the grouping problem disappears.
- Spreading an accumulator inside `reduce` is `O(n²)`; mutate a `Map` or object accumulator instead.
- Plain-object keys coerce to strings, so `Map` is required whenever key type or object identity matters.
- Sets compare by identity, not structure, so deduplicating objects needs a derived string key.
