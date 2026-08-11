---
title: When complexity lies
summary: Constants, cache locality, and small n routinely make the asymptotically worse algorithm the faster one on real hardware.
level: core
minutes: 25
order: 4
tags: [complexity, performance, fundamentals]

related:
  - cs-fundamentals/complexity/big-o-and-asymptotic-analysis
  - cs-fundamentals/operating-systems/virtual-memory-and-the-memory-hierarchy
  - cs-fundamentals/data-structures/arrays-and-dynamic-arrays

resources:
  - title: Latency Numbers Every Programmer Should Know
    url: https://gist.github.com/jboner/2841832
    source: Jeff Dean / Peter Norvig
    type: docs
    minutes: 5
  - title: What Every Programmer Should Know About Memory
    url: https://people.freebsd.org/~lstewart/articles/cpumemory.pdf
    source: Ulrich Drepper
    type: article
    minutes: 120
  - title: Why physics makes linked lists slow
    url: https://www.youtube.com/watch?v=YQs6IC-vgmo
    source: Bjarne Stroustrup, GoingNative
    type: video
    minutes: 45
    primary: true
  - title: Premature optimization is the root of all evil — in context
    url: https://ubiquity.acm.org/article.cfm?id=1513451
    source: ACM Ubiquity
    type: article
    minutes: 20
---

## In one line

Big-O throws away exactly the constants that dominate at realistic input sizes, so the notation tells you how something scales and a profiler tells you how fast it is.

## What it is

The first lie is **small n**. Asymptotic bounds describe behaviour as `n` grows without bound, and most real inputs are not large. Insertion sort beats quicksort below roughly 10–20 elements, which is why production sort implementations are hybrids that switch to insertion sort for small partitions. If your array holds 8 items, the `O(n²)` nested loop is fine and the hash map you built to avoid it cost more to allocate than it saved.

The second lie is **the memory hierarchy**, and it is the big one. Big-O counts operations as if all memory access were equal. It is not: an L1 hit is around a nanosecond, main memory around 100ns, and an SSD read is tens of microseconds. A contiguous array walked in order is prefetched and cached; a linked list of the same length is a chain of unpredictable pointer chases, each risking a cache miss. Both are `O(n)`. The array is commonly an order of magnitude faster. This is why `Array` beats `LinkedList` for almost everything despite the textbook table, and why binary search over a sorted array often beats a tree with the same bound.

The third lie is **the hidden constant**. Two `O(n log n)` sorts can differ by 5×. Allocation, pointer indirection, branch misprediction, boxing, and dynamic dispatch all live inside the constant factor. In JavaScript specifically, a megamorphic property access, a deoptimised function, or a shape change in a hot loop can cost more than an algorithmic improvement gains.

The fourth is **what you are actually measuring**. In most application code the bottleneck is not CPU at all — it is a network round trip, a database query without an index, a synchronous disk read, or a layout thrash. Turning an `O(n²)` in-memory loop over 50 items into `O(n)` while the function makes 50 sequential HTTP calls is optimising the wrong thing by a factor of a thousand.

None of this makes complexity useless. It makes it a screening tool: use it to reject the algorithm that will fall over at 10× the data, then measure to decide between the survivors.

## Why it matters

Reaching for asymptotics on every problem regardless of scale is a recognisable junior tell, and so is dismissing them. The senior version is holding both — naming the complexity, then saying "but n is 40 here, so the simple version wins" or "this is linear but it's pointer-chasing, so I'd expect the array to win anyway." That reasoning is also what stops you from shipping an unreadable optimisation that no profiler asked for.

## Key points

- Asymptotic bounds describe growth, not speed, and say nothing about behaviour below the crossover point.
- Real sort implementations switch to insertion sort for small partitions because the constant factor wins there.
- Contiguous memory beats pointer chasing at the same complexity, because cache misses cost roughly 100× an L1 hit.
- Allocation, indirection, branch misprediction, and deoptimisation all hide inside the discarded constant.
- Most application bottlenecks are I/O — a missing database index or a sequential fetch loop dwarfs any in-memory constant.
- Use complexity to eliminate algorithms that will not survive 10× growth, then profile to choose among the rest.
- Know the input size before optimising; "n is at most a few hundred" is a legitimate and complete justification for the simple approach.
