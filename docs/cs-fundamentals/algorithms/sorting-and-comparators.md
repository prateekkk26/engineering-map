---
title: Sorting and comparators
summary: You will not implement a sort, but you will be asked which one runs, whether it is stable, and why your comparator produced nonsense.
level: core
minutes: 20
order: 3
tags: [algorithms, patterns, sorting]

related:
  - cs-fundamentals/algorithms/binary-search-and-search-on-answer
  - cs-fundamentals/data-structures/heaps-and-priority-queues
  - cs-fundamentals/complexity/when-complexity-lies

resources:
  - title: Array.prototype.sort()
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    source: MDN
    type: docs
    minutes: 15
    primary: true
  - title: Timsort
    url: https://en.wikipedia.org/wiki/Timsort
    source: Wikipedia
    type: docs
    minutes: 20
  - title: Comparison sorting visualisations
    url: https://www.cs.usfca.edu/~galles/visualization/ComparisonSort.html
    source: David Galles, USF
    type: docs
    minutes: 15
  - title: Getting things sorted in V8
    url: https://v8.dev/blog/array-sort
    source: V8
    type: article
    minutes: 20
---

## In one line

Comparison sorts cannot beat `O(n log n)`, every language ships a good one, and the interesting questions are about stability, comparator correctness, and when you can exploit structure to go faster.

## What it is

The `O(n log n)` lower bound for comparison sorting is an information-theoretic result: there are `n!` possible orderings and each comparison yields one bit, so you need at least `log₂(n!) ≈ n log n` comparisons. Any claim to sort faster must not be comparing — counting sort, radix sort, and bucket sort exploit bounded integer keys to reach `O(n + k)` or `O(nk)`. That is the honest answer to "can you beat n log n": only by knowing something about the values.

Know three algorithms by behaviour rather than implementation. **Merge sort** is `O(n log n)` always, stable, and needs `O(n)` extra space — it is also the one that generalises to external sorting of data too big for memory, and to merging k sorted streams. **Quicksort** is `O(n log n)` average, `O(n²)` worst on bad pivots, in-place, unstable, and has excellent constants, which is why it is the usual default with randomised or median-of-three pivots. **Heapsort** is `O(n log n)` worst case and in-place but unstable with poor locality. Production libraries are hybrids: V8 and Python use **Timsort**, which detects existing sorted runs and merges them, making already-mostly-sorted input close to `O(n)`.

**Stability** means equal elements keep their input order. It matters concretely: sorting a table by date and then by status gives you "grouped by status, date-ordered within group" only if the second sort is stable. `Array.prototype.sort` is guaranteed stable in modern JavaScript.

The comparator is where real bugs live. `sort()` with no argument converts elements to strings, so `[10, 9, 1].sort()` gives `[1, 10, 9]` — this is a genuine production bug, not a trivia question. A comparator must return a negative number, zero, or a positive number, and must be consistent: `(a, b) => a.score > b.score` returns a boolean, which coerces to 0 or 1 and never signals "less than", producing a silently wrong order. Multi-key sorting is `a.x - b.x || a.y.localeCompare(b.y)`. Use `localeCompare` for user-visible strings, since raw code-unit ordering puts uppercase before lowercase and mangles accented characters.

Finally: sorting is often the *setup*, not the answer. Sorting first is what makes two pointers, binary search, interval merging, and greedy scheduling work, and paying `O(n log n)` up front to make the rest linear is usually the right trade.

## Why it matters

Getting asked to implement quicksort is rare; being asked "what's the complexity of that `.sort()` you just called" is close to guaranteed, and it is where an otherwise `O(n)` answer quietly becomes `O(n log n)`. The default-string-comparison bug and the boolean-returning comparator are both things that ship to production regularly, which makes them fair game in code review rounds too.

## Key points

- `O(n log n)` is the comparison-sort floor; beating it requires exploiting key structure, as counting and radix sort do.
- Merge sort is stable and predictable at `O(n)` extra space; quicksort is in-place and faster in practice but has an `O(n²)` worst case.
- Timsort is what actually runs in V8 and Python, and it exploits pre-existing sorted runs, so nearly-sorted input is close to linear.
- Stability is what makes multi-pass sorting by successive keys work; `Array.prototype.sort` is stable by spec.
- A bare `.sort()` compares stringified values, so numeric arrays sort wrong — always pass a comparator for numbers.
- A comparator must return a signed number, not a boolean; `a > b` is a silent correctness bug.
- Chain multi-key comparators with `||` so ties fall through to the next key, and use `localeCompare` for human-facing text.
- Sorting as a preprocessing step is frequently the whole insight — it unlocks two pointers, binary search, and interval merging.
