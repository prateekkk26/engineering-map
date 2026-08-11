---
title: Time, space, and the tradeoff
summary: Most optimisation is buying time with memory, and the interview signal is naming the price rather than paying it silently.
level: core
minutes: 20
order: 2
tags: [complexity, fundamentals, performance]

related:
  - cs-fundamentals/complexity/big-o-and-asymptotic-analysis
  - cs-fundamentals/algorithms/hashing-and-frequency-counting
  - _shared/caching

resources:
  - title: Space–time tradeoff
    url: https://en.wikipedia.org/wiki/Space%E2%80%93time_tradeoff
    source: Wikipedia
    type: docs
    minutes: 10
    primary: true
  - title: Memoization
    url: https://en.wikipedia.org/wiki/Memoization
    source: Wikipedia
    type: docs
    minutes: 10
  - title: Cache replacement policies
    url: https://en.wikipedia.org/wiki/Cache_replacement_policies
    source: Wikipedia
    type: docs
    minutes: 20
  - title: Memory Terminology — retained size and leaks
    url: https://developer.chrome.com/docs/devtools/memory-problems/
    source: Chrome DevTools
    type: docs
    minutes: 20
---

## In one line

Space complexity measures the extra memory an algorithm needs as a function of input size, and the single most reliable way to make something faster is to spend some of it.

## What it is

Space complexity is counted the same way as time: how does auxiliary memory grow with `n`? "Auxiliary" is the important word — the input itself usually doesn't count, so an in-place sort is `O(1)` space even though it holds `n` elements. Recursion is the case people forget: each frame costs stack space, so a recursive traversal of a skewed tree is `O(n)` space, and a balanced one is `O(log n)`. That is a real limit, not a theoretical one, since blowing the call stack is a crash rather than a slowdown.

The tradeoff shows up as the same move over and over. Build a hash set so membership goes from `O(n)` scan to `O(1)` lookup — you now hold `n` extra entries. Memoise a recursive function so repeated subproblems cost nothing — you now hold every distinct subproblem. Precompute a prefix-sum array so range queries are constant time — one extra array. Denormalise a database table so a join disappears — duplicated rows, and a write-time consistency problem. Cache an API response — memory, plus staleness. In every case the currency is the same: memory and complexity, bought with time.

It runs the other way too, and that direction gets underused. Recomputing a value can beat storing it when memory is the binding constraint or when cache invalidation is the hard part. Streaming a file line by line instead of reading it into an array trades a little bookkeeping for the ability to process input larger than RAM. Compression trades CPU for bytes on the wire, which is a straight win when the network is the bottleneck.

The engineering judgement is knowing which resource is actually scarce. On a phone with a 50 MB budget, memory is scarce. In a serverless function billed by GB-seconds, memory has a literal price. In a browser tab holding a long-lived session, unbounded memoisation is a leak with a friendly name.

## Why it matters

"Can you do it in one pass?" and "what's the space complexity?" are the two most common follow-ups after a working solution, and both are asking whether you know what you just spent. Unbounded caches are also a genuine production failure mode — a memo map keyed by user input is a slow out-of-memory crash — so the tradeoff has a real operational edge, not just an academic one.

## Key points

- Space complexity counts auxiliary memory as a function of `n`; the input array itself is typically excluded, which is what makes in-place algorithms `O(1)`.
- Recursion depth is space, so a recursive solution over adversarial input can blow the stack where an iterative one would not.
- Hash sets, memoisation, prefix sums, denormalisation, and caching are all the same trade — memory for time.
- The reverse trade is real: recompute or stream when memory is the binding constraint or invalidation is the hard part.
- Every cache needs a bound and an eviction policy; an unbounded memo keyed by user input is a memory leak waiting for traffic.
- Say the tradeoff out loud when you make it — "this is `O(n)` extra space to get one pass instead of two" is the sentence an interviewer is listening for.
- Which resource is scarce is context-dependent — mobile memory, serverless GB-seconds, and network bytes each change the answer.
