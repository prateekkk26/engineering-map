---
title: Amortised and average-case analysis
summary: Why a dynamic array push is "O(1)" despite occasionally copying everything, and when that averaged promise is not the one you need.
level: deep
minutes: 20
order: 3
tags: [complexity, fundamentals]

related:
  - cs-fundamentals/complexity/big-o-and-asymptotic-analysis
  - cs-fundamentals/data-structures/arrays-and-dynamic-arrays
  - cs-fundamentals/data-structures/hash-tables

resources:
  - title: Amortized analysis
    url: https://en.wikipedia.org/wiki/Amortized_analysis
    source: Wikipedia
    type: docs
    minutes: 15
    primary: true
  - title: Dynamic array — geometric expansion and amortized cost
    url: https://en.wikipedia.org/wiki/Dynamic_array
    source: Wikipedia
    type: docs
    minutes: 15
  - title: How NOT to Measure Latency
    url: https://www.youtube.com/watch?v=lJ8ydIuPFeU
    source: Gil Tene
    type: video
    minutes: 60
---

## In one line

Amortised analysis averages the cost of an expensive operation over the cheap ones that must precede it, giving a per-operation bound that is honest about totals but silent about any single call.

## What it is

Three different "not the worst case" claims get muddled, and keeping them apart is most of the value here.

**Amortised** is a guarantee about a *sequence*. A dynamic array doubles capacity when full: that one push costs `O(n)` to copy, but doubling means it can only happen after `n` cheap pushes, so any sequence of `n` pushes costs `O(n)` total — `O(1)` amortised. This is not probabilistic. It is arithmetic, and it holds for every sequence, which is why growth must be geometric: growing by a fixed 10 elements gives `O(n)` amortised cost and quietly turns list building quadratic.

**Average case** is a claim about a *distribution of inputs*. Quicksort is `O(n log n)` average and `O(n²)` worst; hash table lookup is `O(1)` average and `O(n)` worst when everything collides. The bound holds if your inputs look like the assumed distribution — which is exactly the assumption an attacker attacks. Algorithmic-complexity denial of service works by crafting keys that all hash to one bucket, turning an average-case structure into its worst case. Randomised pivots and hash seeds exist to make that infeasible.

**Best case** is almost never useful; mention it only to note that an already-sorted input makes insertion sort linear.

The gap that matters operationally is between amortised and worst-case *latency*. Amortised `O(1)` means the total is fine and one unlucky request wore the whole cost. For a batch job, totals are all that matter. For a request served under a p99 latency SLO, or a frame that must render in 16ms, the occasional `O(n)` pause is precisely the thing that breaks — the same reason a stop-the-world garbage collector is fine on average and unacceptable at the tail.

## Why it matters

This is the concept that lets you answer "you said push is `O(1)`, but doesn't it resize?" without hand-waving, and it is the bridge between algorithmic analysis and real latency work. It also explains a whole class of production incidents — the p99 that looks nothing like the mean, and the endpoint that fell over because a single user's input was adversarial rather than large.

## Key points

- Amortised cost is a worst-case guarantee over a sequence of operations, not an average over random inputs — the two are different claims and get conflated constantly.
- Geometric growth is what makes dynamic array append amortised `O(1)`; growing by a constant amount makes building a list quadratic.
- Average-case bounds depend on an input distribution, so they are void against an adversary who chooses the input.
- Hash-collision denial of service is the standard exploit of an average-case bound, and randomised hash seeds are the standard defence.
- Amortised `O(1)` still permits one operation to take `O(n)`, which is fatal under a tail-latency SLO or a frame budget even though the total is fine.
- Measure the distribution, not the mean — a mean latency figure hides exactly the resize, rehash, and GC pauses this analysis predicts.
- The banker's and physicist's methods are the formal tools, but "the expensive step pays for itself with the cheap steps it required" is the whole idea.
