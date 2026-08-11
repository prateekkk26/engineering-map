---
title: Big-O and asymptotic analysis
summary: A vocabulary for describing how work grows with input size, deliberately blind to constants — which is both its power and its trap.
level: core
minutes: 25
order: 1
tags: [complexity, fundamentals]

related:
  - cs-fundamentals/complexity/when-complexity-lies
  - cs-fundamentals/complexity/amortised-and-average-case-analysis
  - cs-fundamentals/data-structures/choosing-a-data-structure

resources:
  - title: Big-O Cheat Sheet
    url: https://www.bigocheatsheet.com/
    source: Eric Rowell
    type: docs
    minutes: 10
  - title: Asymptotic notation
    url: https://www.khanacademy.org/computing/computer-science/algorithms/asymptotic-notation/a/asymptotic-notation
    source: Khan Academy
    type: article
    minutes: 20
    primary: true
  - title: Introduction to Algorithms (6.006)
    url: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/
    source: MIT OpenCourseWare
    type: course
  - title: Time complexity
    url: https://en.wikipedia.org/wiki/Time_complexity
    source: Wikipedia
    type: docs
    minutes: 15
---

## In one line

Big-O describes the *shape* of a function's growth as input grows without bound, throwing away constants and lower-order terms so that two implementations can be compared without benchmarking either.

## What it is

Formally, `f(n) = O(g(n))` means there is some constant `c` and some threshold `n₀` beyond which `f(n) ≤ c·g(n)`. It is an upper bound, and it is asymptotic — it says nothing about small inputs and nothing about the constant factor. Big-Ω is the matching lower bound, Big-Θ is both at once. In practice everyone says "O" and means Θ; nobody will stop you, but knowing the distinction is a cheap way to sound precise.

The ladder worth having memorised, in order: constant `O(1)`, logarithmic `O(log n)`, linear `O(n)`, linearithmic `O(n log n)`, quadratic `O(n²)`, cubic `O(n³)`, exponential `O(2ⁿ)`, factorial `O(n!)`. The gaps between these are enormous. At `n = 1,000,000`, log n is 20 and n² is a trillion — the difference between instant and never.

Deriving it is mechanical once you have the habit. Sequential blocks add, so the largest dominates. Nested loops over the same input multiply. A loop that halves its range each step is logarithmic. A recursive function costs (number of calls) × (work per call), which is why the recursion tree or the Master Theorem is the tool for divide-and-conquer. Crucially, count operations against the size of the *input*, not the size of the source code: a single line calling `.sort()` is `O(n log n)`, and `arr.includes(x)` inside a loop over `arr` is quadratic even though it looks like one loop.

The most common analysis mistake is treating a language builtin as free. String concatenation in a loop, `Array.prototype.shift()`, spreading an accumulator into a new object on every reduce iteration — each of those hides an `O(n)` inside an `O(n)`.

## Why it matters

This is the shared language for every performance conversation, in interviews and in code review. You will not often be asked to prove a bound, but you will constantly be asked "what's the complexity of that?" after you write a loop, and the follow-up is always "can you do better?" — a question you can only answer if you can name the current bound and the target one.

## Key points

- Big-O is an upper bound that discards constants and lower-order terms; Θ is a tight bound, and casual usage means Θ even when it says O.
- Sequential work adds and the dominant term wins; nested iteration over the same input multiplies.
- Halving the search space per step gives `O(log n)`, which is why binary search and balanced trees are the cheap wins.
- Complexity is measured against input size, not lines of code — a builtin call can hide a linear or linearithmic pass.
- `O(n log n)` is the comparison-sort floor, so any solution claiming to beat it must be exploiting structure such as bounded integer keys.
- Nested iteration over *different* inputs is `O(n·m)`, not `O(n²)`, and saying so precisely matters when one input is tiny.
- Recursive cost is calls × work per call; draw the recursion tree rather than guessing.
- An amortised bound and a worst-case bound are different claims, and hash tables are the case where the difference bites.
