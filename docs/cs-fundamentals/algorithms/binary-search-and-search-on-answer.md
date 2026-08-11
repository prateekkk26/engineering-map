---
title: Binary search and search on answer
summary: Halving a space per step gives `O(log n)`, and the powerful version searches a range of possible answers rather than an array.
level: core
minutes: 20
order: 4
tags: [algorithms, patterns, search]

related:
  - cs-fundamentals/algorithms/sorting-and-comparators
  - cs-fundamentals/complexity/big-o-and-asymptotic-analysis
  - cs-fundamentals/data-structures/trees-and-traversal

resources:
  - title: Binary search algorithm
    url: https://en.wikipedia.org/wiki/Binary_search_algorithm
    source: Wikipedia
    type: docs
    minutes: 25
    primary: true
  - title: Extra, Extra — Read All About It — Nearly All Binary Searches Are Broken
    url: https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/
    source: Google Research
    type: article
    minutes: 15
  - title: bisect — array bisection algorithm
    url: https://docs.python.org/3/library/bisect.html
    source: Python
    type: docs
    minutes: 10
  - title: Koko Eating Bananas
    url: https://leetcode.com/problems/koko-eating-bananas/
    source: LeetCode
    type: article
    minutes: 20
---

## In one line

If you can cheaply test a candidate and that test is monotone — true for everything above some threshold and false below it — you can find the threshold in `O(log n)` by halving the range.

## What it is

The array version is familiar: on a sorted array, compare the middle element to the target and discard half. Twenty steps handle a million elements, thirty handle a billion. Writing it correctly under pressure is the harder part, and the reliable recipe is to fix the invariant first. Use a half-open range `[lo, hi)`, loop while `lo < hi`, compute `mid = lo + ((hi - lo) >> 1)` — which also avoids the integer overflow Google's post is famous for — and set either `lo = mid + 1` or `hi = mid`. Every branch must strictly shrink the range or you get an infinite loop.

Most real uses are not "find the element" but **find the boundary**: the first index ≥ target (lower bound) or the first index > target (upper bound). Those two give you insertion points, range counts, and "the closest value", and they are what `bisect_left` and `bisect_right` are. Get in the habit of writing the boundary version, because plain equality search is a special case of it and the boundary version handles duplicates correctly.

The more interesting variant is **binary search on the answer**. The thing being searched is not an array at all — it is a range of candidate answers, and the test is a predicate you can evaluate. "What is the minimum ship capacity to deliver all packages in D days?" Capacity is monotone: if capacity `c` works, every larger capacity works. So binary search over capacities from `max(weights)` to `sum(weights)`, and for each candidate run an `O(n)` feasibility check. Total: `O(n log range)`. The same shape solves minimum eating speed, splitting an array to minimise the largest sum, and any "minimise the maximum" or "maximise the minimum" phrasing — those exact words are the tell.

Related shapes worth recognising: binary search on a rotated sorted array (one half is always properly sorted, decide which and recurse into it), and searching a 2D matrix with sorted rows and columns by starting at a corner where one direction increases and the other decreases.

## Why it matters

Binary search is the most common way to move a solution from `O(n)` to `O(log n)`, and "search on the answer" is a genuine differentiator — many candidates only recognise binary search when handed a sorted array. It is also a classic implementation trap, so writing the boundary version cleanly, with a stated invariant, is visible competence.

## Key points

- Binary search needs monotonicity, not literally a sorted array — any predicate that flips once over the range qualifies.
- Fix the range convention before writing anything; a half-open `[lo, hi)` with `while (lo < hi)` avoids most off-by-one errors.
- Compute the midpoint as `lo + (hi - lo) / 2` rather than `(lo + hi) / 2` to avoid overflow in fixed-width languages.
- Every iteration must strictly shrink the range, or the loop never terminates.
- Prefer the lower-bound/upper-bound formulation over equality search — it handles duplicates and gives insertion points for free.
- "Minimise the maximum" or "maximise the minimum" is the signature of binary search on the answer.
- Cost is `O(log range × cost of the feasibility check)`, so the check being cheap is what makes the technique work.
- On a rotated sorted array, at least one half is always sorted; identify which and the standard search applies.
