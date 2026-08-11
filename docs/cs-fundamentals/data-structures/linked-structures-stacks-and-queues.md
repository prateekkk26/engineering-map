---
title: Linked structures, stacks, and queues
summary: The two access disciplines that show up everywhere in real systems, and the honest case for and against linked lists.
level: core
minutes: 20
order: 3
tags: [data-structures, fundamentals]

related:
  - cs-fundamentals/data-structures/arrays-and-dynamic-arrays
  - cs-fundamentals/algorithms/graph-traversal-bfs-and-dfs
  - cs-fundamentals/concurrency/backpressure-and-bounded-queues

resources:
  - title: Linked list
    url: https://en.wikipedia.org/wiki/Linked_list
    source: Wikipedia
    type: docs
    minutes: 20
  - title: Stack (abstract data type)
    url: https://en.wikipedia.org/wiki/Stack_(abstract_data_type)
    source: Wikipedia
    type: docs
    minutes: 10
    primary: true
  - title: Double-ended queue
    url: https://en.wikipedia.org/wiki/Double-ended_queue
    source: Wikipedia
    type: docs
    minutes: 10
  - title: Call stack
    url: https://developer.mozilla.org/en-US/docs/Glossary/Call_stack
    source: MDN
    type: docs
    minutes: 5
---

## In one line

A stack is last-in-first-out, a queue is first-in-first-out, and a linked list is the node-and-pointer structure that gives both `O(1)` ends at the cost of everything arrays are good at.

## What it is

**Stacks** are the discipline behind function calls, undo history, expression parsing, iterative DFS, and matching brackets. Push and pop at one end, both `O(1)`. In JavaScript a plain array *is* a stack: `push` and `pop` are exactly the operations, and the JS call stack itself is why deep recursion throws `RangeError: Maximum call stack size exceeded` — converting recursion to an explicit stack is the standard fix.

**Queues** are the discipline behind BFS, task scheduling, request buffering, the event loop's task queues, and every message broker. Enqueue at one end, dequeue at the other. The trap is implementing one with `array.shift()`, which is `O(n)` per dequeue and quadratic overall. Two correct fixes: keep a read index and advance it (`arr[head++]`, discarding the prefix lazily), or use a ring buffer / linked list. A **deque** allows both ends and covers both disciplines, which is why sliding-window maximum and similar problems reach for it.

**Linked lists** store each element in its own node with a pointer to the next (and, doubly linked, the previous). That gives `O(1)` insert and delete *given a reference to the node* — no shifting — and `O(1)` splicing of whole segments. It costs `O(n)` random access, a pointer per element in memory overhead, and terrible cache behaviour, since consecutive nodes can live anywhere in the heap.

Be honest about the tradeoff: in application code, a linked list is almost never the right answer. Arrays win on locality even where the complexity table says they shouldn't. The real uses are narrow and specific — an LRU cache, where a doubly linked list plus a hash map gives `O(1)` move-to-front; intrusive lists in allocators and kernels; and interviews, where reversal and cycle detection are testing pointer discipline rather than structure choice.

## Why it matters

BFS and DFS both come down to "which end do you take work from", and getting the queue implementation wrong turns a linear traversal quadratic. The LRU cache — hash map plus doubly linked list — is one of the most frequently asked design-a-structure questions, and it exists precisely because it forces you to combine two structures to get `O(1)` on both operations.

## Key points

- Stack is LIFO, queue is FIFO, and a deque does both — DFS uses a stack, BFS uses a queue, and that is the only structural difference between them.
- `array.push`/`pop` is a correct `O(1)` stack; `array.shift` is `O(n)`, so a naive array queue is quadratic.
- A head index or ring buffer gives an `O(1)` array-backed queue without allocating nodes.
- Linked lists give `O(1)` insert and delete *only* when you already hold the node — finding it is still `O(n)`.
- Pointer chasing defeats the CPU cache, so an array usually beats a linked list even where their complexities match.
- LRU cache is the canonical legitimate use: a hash map for lookup plus a doubly linked list for recency, both `O(1)`.
- Deep recursion is a stack in disguise; rewriting it with an explicit stack trades stack-overflow risk for heap allocation.
- Floyd's cycle detection finds a loop in `O(n)` time and `O(1)` space with a slow and a fast pointer.
