---
title: Dynamic programming
summary: Memoised recursion with a name — worth being able to recognise and derive, but rarely the point of a senior frontend loop.
level: deep
minutes: 25
order: 7
tags: [algorithms, patterns, dynamic-programming]

related:
  - cs-fundamentals/algorithms/recursion-backtracking-and-memoisation
  - cs-fundamentals/complexity/time-space-and-the-tradeoff
  - cs-fundamentals/problem-practice/what-actually-gets-asked

resources:
  - title: Dynamic programming
    url: https://en.wikipedia.org/wiki/Dynamic_programming
    source: Wikipedia
    type: docs
    minutes: 25
  - title: Dynamic Programming — MIT 6.006 lecture
    url: https://www.youtube.com/watch?v=OQ5jsbhAv_M
    source: MIT OpenCourseWare
    type: video
    minutes: 55
    primary: true
  - title: Longest common subsequence problem
    url: https://en.wikipedia.org/wiki/Longest_common_subsequence
    source: Wikipedia
    type: docs
    minutes: 20
  - title: Knapsack problem
    url: https://en.wikipedia.org/wiki/Knapsack_problem
    source: Wikipedia
    type: docs
    minutes: 20
---

## In one line

Dynamic programming applies when a problem has optimal substructure and overlapping subproblems, and it is just recursion where each distinct subproblem is solved once.

## What it is

Two preconditions, and checking them is how you decide DP applies at all. **Optimal substructure**: the best answer to the whole is built from best answers to parts. **Overlapping subproblems**: the same part is needed many times. If subproblems don't overlap, you have plain divide-and-conquer (merge sort) or backtracking, and DP buys nothing.

Two directions, same content. **Top-down** is recursion plus a memo — write the natural recursive solution, add a cache keyed on the parameters, done. **Bottom-up** fills a table in dependency order with no recursion and no stack risk, and often allows dropping the table to one or two rows since most recurrences only look back a fixed distance. Derive top-down, then convert if the interviewer asks for it or if depth is a concern. Deriving bottom-up directly, under time pressure, is a way to get stuck.

The actual work is defining the **state** and the **transition**. State is the minimum set of parameters that determines the answer to a subproblem — "index `i` and remaining capacity `c`" — and getting it minimal is what keeps the table small. The transition is the recurrence: at each state, what choices exist and what does each cost? Then the base cases, then the answer's location in the table. Complexity is number of states × work per transition, which is a much easier thing to state than to guess.

A handful of families cover nearly everything asked: linear sequence DP (house robber, climbing stairs, longest increasing subsequence), two-sequence grid DP (edit distance, longest common subsequence, string matching), knapsack and coin-change variants, interval DP, and DP over subsets with bitmasks. Recognising the family gets you to the right state definition quickly.

Say the honest thing about weighting, though: for senior frontend and full-stack loops at product companies, heavy DP is rarely asked. The technical screen is live coding in a real editor on data transformation and UI logic, not algorithm puzzles. This is `deep` for that reason — worth being able to recognise and derive a simple case so you are not blindsided, not worth grinding a hundred problems for.

## Why it matters

The realistic payoff is recognition. If a problem asks for a count of ways, a minimum cost, or a longest something over sequences, saying "this has overlapping subproblems, so I'd memoise the recursion — states are `i` and `c`, transition is take-or-skip, so `O(n·c)`" gets you most of the credit even without a finished tabulation. Edit distance is also genuinely useful in product work, as the basis of fuzzy matching and typo tolerance.

## Key points

- DP requires both optimal substructure and overlapping subproblems; without overlap it is divide-and-conquer or backtracking instead.
- Top-down memoisation and bottom-up tabulation compute the same thing — derive top-down, convert only if asked.
- Defining minimal state is the real work; the recurrence usually follows once the state is right.
- Complexity is states × transition cost, which makes the bound easy to state precisely.
- Most recurrences only reference the previous row or two, so space often reduces from `O(n·m)` to `O(m)`.
- Bottom-up avoids stack overflow and has better constants; top-down only computes states it actually reaches.
- Recognise the family — sequence, two-sequence grid, knapsack, interval, bitmask — and the state definition follows.
- Greedy is not DP: it commits to a local choice and only works when an exchange argument proves the local choice is safe.
