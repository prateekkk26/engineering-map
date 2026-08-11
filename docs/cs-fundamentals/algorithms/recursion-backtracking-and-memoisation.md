---
title: Recursion, backtracking, and memoisation
summary: Solve a problem in terms of a smaller version of itself, undo choices that fail, and cache subproblems so the tree stops exploding.
level: core
minutes: 25
order: 6
tags: [algorithms, patterns, recursion]

related:
  - cs-fundamentals/algorithms/dynamic-programming
  - cs-fundamentals/data-structures/trees-and-traversal
  - cs-fundamentals/complexity/time-space-and-the-tradeoff

resources:
  - title: Recursion
    url: https://en.wikipedia.org/wiki/Recursion_(computer_science)
    source: Wikipedia
    type: docs
    minutes: 20
  - title: Backtracking
    url: https://en.wikipedia.org/wiki/Backtracking
    source: Wikipedia
    type: docs
    minutes: 20
    primary: true
  - title: Subsets
    url: https://leetcode.com/problems/subsets/
    source: LeetCode
    type: article
    minutes: 20
  - title: Recursion and the call stack
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion
    source: MDN
    type: docs
    minutes: 10
---

## In one line

Recursion expresses a problem as a base case plus a reduction to a smaller instance; backtracking adds "make a choice, recurse, undo it"; memoisation adds a cache so identical subproblems are solved once.

## What it is

Every recursive function needs three things, and stating them before writing code prevents most bugs. A **base case** that returns without recursing. A **reduction** that makes the input strictly smaller, so the base case is reachable. And a clear contract: assume the recursive call is correct for the smaller input, and only reason about combining its result. That last habit — trusting the recursion instead of tracing it in your head — is what makes tree and divide-and-conquer code easy to write.

**Backtracking** is systematic exhaustive search over a decision tree. The loop body is: choose, recurse, un-choose. Generating subsets, permutations, combinations, N-queens, sudoku, word search on a grid, and generating valid parentheses are all this template. Complexity is inherently exponential — `2ⁿ` for subsets, `n!` for permutations — because the output itself is that big, so the goal is not to remove the exponent but to **prune**: abandon a branch the moment it cannot lead to a valid answer. Sorting first so duplicates are adjacent, checking a partial constraint before recursing, and bounding by a running best are the three usual pruning moves. The most common implementation bug is forgetting to undo state, or pushing the mutable path array into the results instead of a copy of it.

**Memoisation** applies when the recursion tree contains repeated subproblems. Naive Fibonacci recomputes `fib(30)` millions of times and is `O(2ⁿ)`; caching results by argument makes it `O(n)`. The cache key must capture every input the result depends on — this is where memoisation silently breaks, when a parameter that affects the answer is left out of the key. Note the distinction from backtracking: memoisation helps only when subproblems *overlap*. Permutations have no overlapping subproblems, so caching does nothing there.

Practical constraints in JavaScript: there is no tail-call optimisation in practice, so recursion depth is bounded at roughly 10,000 frames and deep recursion throws. Anything that could recurse over user-controlled depth — a JSON tree, a comment thread, a directory walk — should either be iterative with an explicit stack or have a depth guard.

## Why it matters

Recursion is the natural shape for the nested-structure problems that come up constantly in frontend work — walking a DOM-like tree, flattening arbitrary nesting, deep-cloning, diffing a config object. Backtracking is the standard "generate all valid X" question. And memoised recursion is the honest way into dynamic programming: it is the same thing top-down, and it is far easier to derive under time pressure than a tabulated version.

## Key points

- A correct recursion needs a base case, a strictly smaller subproblem, and a combine step — write all three down before coding.
- Trust the recursive call to be correct rather than mentally unrolling it; the unrolling is where reasoning breaks down.
- Backtracking is choose / recurse / un-choose, and forgetting the un-choose is the standard bug.
- Push a copy of the current path into results, never the mutable array you are still using.
- Exponential cost is intrinsic when the output is exponential, so optimise by pruning branches early, not by changing the exponent.
- Memoisation only helps when subproblems overlap — it makes Fibonacci linear and does nothing for permutations.
- The memo key must include every parameter the result depends on, or the cache returns a wrong answer rather than a slow one.
- JavaScript has no working tail-call optimisation, so unbounded recursion depth over user data is a crash — use an explicit stack.
