---
title: Heaps and priority queues
summary: The structure that answers "what's the smallest right now?" in constant time and keeps answering it as data changes.
level: core
minutes: 20
order: 5
tags: [data-structures, fundamentals]

related:
  - cs-fundamentals/data-structures/choosing-a-data-structure
  - cs-fundamentals/algorithms/sorting-and-comparators
  - cs-fundamentals/concurrency/backpressure-and-bounded-queues

resources:
  - title: Binary heap
    url: https://en.wikipedia.org/wiki/Binary_heap
    source: Wikipedia
    type: docs
    minutes: 20
    primary: true
  - title: Heapsort
    url: https://en.wikipedia.org/wiki/Heapsort
    source: Wikipedia
    type: docs
    minutes: 15
  - title: heapq — heap queue algorithm
    url: https://docs.python.org/3/library/heapq.html
    source: Python
    type: docs
    minutes: 15
  - title: Dijkstra's algorithm
    url: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
    source: Wikipedia
    type: docs
    minutes: 25
---

## In one line

A binary heap is a complete tree stored in a flat array where every parent beats its children, giving `O(1)` peek at the extreme element and `O(log n)` insert and extract.

## What it is

The heap property is deliberately weak: in a min-heap every node is ≤ its children, and that is all. Siblings are unordered, the array is not sorted, and only the root is guaranteed to be the minimum. That weakness is the point — maintaining it costs one path up or down the tree rather than a full reorder.

Because the tree is *complete* (filled left to right, no gaps), it needs no pointers at all. Store it in an array: node `i` has children at `2i+1` and `2i+2`, and parent at `⌊(i-1)/2⌋`. Contiguous memory, no allocation per node, excellent cache behaviour. Insert appends at the end and **sifts up** while it beats its parent. Extract-min takes the root, moves the last element into its place, and **sifts down**. Both are `O(log n)` because the height of a complete tree is `log n`. Building a heap from an existing array is `O(n)`, not `O(n log n)` — a result worth remembering because it is counterintuitive and gets asked.

A **priority queue** is the abstract interface — insert with a priority, remove the highest priority — and a binary heap is its usual implementation. The distinction matters when someone asks what else could implement it: a sorted array (fast peek, slow insert), a balanced BST (same bounds, plus ordering you don't need), or a Fibonacci heap (better amortised decrease-key, worse constants, rarely worth it).

Where it earns its place: **top-k**. Finding the k largest of n items with a size-k min-heap is `O(n log k)` time and `O(k)` space — better than sorting when k is small, and the only option when the input is a stream you cannot hold. It is also the core of Dijkstra's and A*, of task schedulers and timer wheels, of merging k sorted lists, and of the running-median trick with two heaps facing each other. JavaScript has no built-in heap, so in a live-coding round you may need to write the sift-up/sift-down pair or argue explicitly for sorting instead.

## Why it matters

"Top k frequent elements" and "merge k sorted lists" are staples of the technical screen, and both have a clean heap answer and an obvious sorting answer — the interesting part is being able to compare them out loud. The streaming case is the real-world one: any time you must maintain an extreme over data too large or too live to sort, a heap is the answer.

## Key points

- The heap property orders parents against children only, never siblings, which is why maintenance is one root-to-leaf path.
- A complete binary tree maps to a flat array with arithmetic index math, so a heap needs no pointers and stays cache-friendly.
- Peek is `O(1)`; insert and extract are `O(log n)`; heapifying an existing array is `O(n)`.
- Top-k with a size-k heap is `O(n log k)` time and `O(k)` space, which beats sorting whenever k is much smaller than n.
- Arbitrary search inside a heap is `O(n)` — it is not a lookup structure, and deleting a non-root element needs an index map.
- Priority queue is the interface, binary heap is the implementation; naming both is the precise answer.
- Two heaps facing opposite directions maintain a running median in `O(log n)` per element.
- JavaScript ships no heap, so know the ~20 lines of sift-up and sift-down or justify sorting instead.
