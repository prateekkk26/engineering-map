---
title: Choosing a data structure
summary: The decision procedure that turns a vague problem into a structure choice you can defend in one sentence.
level: core
minutes: 20
order: 8
tags: [data-structures, fundamentals, interview]

related:
  - cs-fundamentals/data-structures/hash-tables
  - cs-fundamentals/data-structures/heaps-and-priority-queues
  - cs-fundamentals/problem-practice/solving-a-problem-out-loud

resources:
  - title: Know Your Data Structures
    url: https://www.bigocheatsheet.com/#data-structure-operations
    source: Big-O Cheat Sheet
    type: docs
    minutes: 10
    primary: true
  - title: Collections comparison — Map, Set, WeakMap, WeakSet
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections
    source: MDN
    type: docs
    minutes: 15
  - title: Sorted containers and why JavaScript lacks them
    url: https://github.com/tc39/proposal-collection-methods
    source: TC39
    type: repo
    minutes: 10
  - title: Data structures in the standard library
    url: https://docs.python.org/3/tutorial/datastructures.html
    source: Python
    type: docs
    minutes: 20
---

## In one line

Pick the structure by listing the operations the problem performs most, then choosing whichever structure makes those `O(1)` or `O(log n)` and pushes the cost onto operations you rarely do.

## What it is

The procedure is mechanical. Write down every operation the problem needs — lookup by key, membership test, insert, delete, iterate in order, find min or max, range query, prefix query, group or connect. Estimate the frequency of each. Then match.

- Lookup or membership by exact key → hash map or hash set.
- Index by position, iterate a lot, mutate mostly at the end → array.
- Both ends cheap, no random access → deque or linked list.
- Need the extreme element repeatedly while data changes → heap.
- Need sorted order, ranges, or nearest key → sorted array if writes are rare, balanced tree if not.
- Prefix matching → trie.
- "Are these two connected", incrementally → union-find.
- Entities and relationships, questions about reaching or ordering → graph.
- Cheap, bounded, recency-aware storage → hash map plus doubly linked list, i.e. an LRU.

Two combinations cover a surprising number of problems. **Hash map + array** gives `O(1)` lookup and `O(1)` random selection — the "insert, delete, getRandom in O(1)" question. **Hash map + heap** or **hash map + doubly linked list** covers top-k with updates and LRU respectively. When one structure can't give you two properties at once, the answer is usually two structures kept in sync, and saying that explicitly is the senior move.

Know your language's gaps. JavaScript has `Map`, `Set`, `WeakMap`, `WeakSet`, and arrays — and no heap, no sorted map, no deque, no built-in tuple key. That is a real constraint in a 45-minute screen: either write the 20 lines, encode composite keys as strings (`` `${x},${y}` ``), or argue for the simpler `O(n log n)` approach and move on. `WeakMap` deserves a specific mention — keys are held weakly, so it is the right structure for attaching metadata to DOM nodes or objects without leaking them.

Finally, weigh in the things complexity tables omit: how much code it is, whether you can get it right under time pressure, and whether it is readable by the next person. A well-argued `O(n log n)` sort that ships beats a half-remembered balanced tree that doesn't compile.

## Why it matters

This is the actual skill the data-structures round tests. Nobody asks you to implement a red-black tree; they hand you a problem and watch which structure you reach for and whether you can say why in one sentence. Naming the operation profile before choosing is also the habit that catches the wrong choice early, when it costs a sentence rather than fifteen minutes of rewriting.

## Key points

- Enumerate the required operations and their frequency first; the structure falls out of that list rather than from intuition.
- Hash structures buy equality and membership; ordered structures buy ranges and neighbours — no structure gives both for free.
- When you need two properties at once, keep two structures in sync — hash map plus list, plus heap, plus array.
- LRU cache is hash map plus doubly linked list; `O(1)` insert/delete/getRandom is hash map plus array with swap-and-pop.
- JavaScript ships no heap, deque, or sorted map, so plan around the gap rather than discovering it mid-problem.
- `WeakMap` and `WeakSet` attach data to objects without preventing garbage collection, which is the fix for metadata-on-DOM-node leaks.
- Composite keys in JS are usually stringified tuples; that works and is worth flagging as a deliberate shortcut.
- Simplicity is a real criterion — choose the structure you can implement correctly in the time available, and say that you are doing so.
