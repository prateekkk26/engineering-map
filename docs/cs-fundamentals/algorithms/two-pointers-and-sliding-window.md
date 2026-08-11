---
title: Two pointers and sliding window
summary: Two indices moving through one array in `O(n)` total, covering most subarray, substring, and sorted-pair problems without extra space.
level: core
minutes: 20
order: 2
tags: [algorithms, patterns, arrays]

related:
  - cs-fundamentals/algorithms/hashing-and-frequency-counting
  - cs-fundamentals/algorithms/binary-search-and-search-on-answer
  - cs-fundamentals/data-structures/arrays-and-dynamic-arrays

resources:
  - title: Minimum Window Substring
    url: https://leetcode.com/problems/minimum-window-substring/
    source: LeetCode
    type: article
    minutes: 30
  - title: Longest Substring Without Repeating Characters
    url: https://leetcode.com/problems/longest-substring-without-repeating-characters/
    source: LeetCode
    type: article
    minutes: 20
    primary: true
  - title: Container With Most Water
    url: https://leetcode.com/problems/container-with-most-water/
    source: LeetCode
    type: article
    minutes: 15
  - title: Floyd's cycle-finding algorithm
    url: https://en.wikipedia.org/wiki/Cycle_detection
    source: Wikipedia
    type: docs
    minutes: 15
---

## In one line

Keep two indices into the same sequence and move each one forward only, so that although the pointers cover the array twice the total work stays `O(n)`.

## What it is

Three variants, distinguished by how the pointers move.

**Converging pointers** start at opposite ends and move toward each other. This requires the input to be sorted or to have some monotone property, because the decision "which pointer moves" must be justified. In two-sum-on-a-sorted-array, if the current sum is too small you move the left pointer right — nothing to the left of it can help. Container-with-most-water moves the shorter side, because moving the taller one can never improve the area. Palindrome checking, reversing in place, and three-sum's inner loop are all this shape.

**Same-direction pointers** are the sliding window. A `right` pointer expands the window and a `left` pointer contracts it while some condition is violated. Longest substring without repeating characters: extend right, and while the new character is already in the window, advance left past its previous occurrence. Each index enters and leaves the window at most once, so it is `O(n)` even though there is a loop inside a loop. Fixed-size windows are the simpler case — maintain a running sum and, on each step, add the entering element and subtract the leaving one instead of resumming.

**Fast and slow pointers** move at different speeds through a linked structure. Floyd's cycle detection: if a fast pointer moving two steps ever meets a slow one moving one, there is a cycle — `O(n)` time, `O(1)` space. The same trick finds the middle of a list in one pass and the nth node from the end with a fixed offset.

The recognition cue is a phrase in the problem: "subarray", "substring", "contiguous", "sorted array", "pair that sums to", "in place", "without extra space". Those almost always mean two pointers. If the problem is about *non-contiguous* subsets, it is not a window — that is usually hashing, sorting, or dynamic programming. And if the array is unsorted but the problem asks about sorted-order relationships, the honest answer is often "sort first for `O(n log n)`, then two pointers" — which is a perfectly good solution to state.

## Why it matters

This pattern converts a large family of naive `O(n²)` substring and subarray solutions to `O(n)` with constant extra space, and those problems are extremely common in a 45-minute screen. The window-invariant framing — "what must be true of the window, and which pointer restores it" — is also the thing that keeps the implementation correct under pressure, where ad-hoc index juggling usually produces an off-by-one.

## Key points

- Both pointers only move forward, so each element is visited a bounded number of times and the total is `O(n)` despite nested loops.
- Converging pointers require sorted or monotone input, and you must be able to justify which pointer moves and why the discarded side is safe.
- The sliding window is expand-with-right, shrink-with-left-while-invalid; state the invariant explicitly before coding.
- Fixed-size windows update incrementally — add the entering element, subtract the leaving one — instead of recomputing.
- Fast and slow pointers detect cycles and find midpoints in `O(1)` space, which no hash-set approach can match.
- "Contiguous", "in place", or "sorted" in the problem statement is the cue; "any subset" means it is not a window problem.
- Sorting first to enable two pointers is a legitimate `O(n log n)` answer when the input arrives unsorted.
- Watch the empty and single-element cases and whether the window bounds are inclusive — that is where these solutions break.
