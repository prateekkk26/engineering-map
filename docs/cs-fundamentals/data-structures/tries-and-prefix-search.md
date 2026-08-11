---
title: Tries and prefix search
summary: The structure behind autocomplete — lookup proportional to the length of the key, not the size of the dictionary.
level: deep
minutes: 20
order: 7
tags: [data-structures, strings, search]

related:
  - cs-fundamentals/data-structures/trees-and-traversal
  - cs-fundamentals/data-structures/hash-tables
  - system-design/frontend-system-design/design-an-autocomplete

resources:
  - title: Trie
    url: https://en.wikipedia.org/wiki/Trie
    source: Wikipedia
    type: docs
    minutes: 20
    primary: true
  - title: Radix tree
    url: https://en.wikipedia.org/wiki/Radix_tree
    source: Wikipedia
    type: docs
    minutes: 15
  - title: Inverted index
    url: https://en.wikipedia.org/wiki/Inverted_index
    source: Wikipedia
    type: docs
    minutes: 10
  - title: Levenshtein distance
    url: https://en.wikipedia.org/wiki/Levenshtein_distance
    source: Wikipedia
    type: docs
    minutes: 15
---

## In one line

A trie stores keys along the path from the root rather than in the nodes, so looking up or prefix-matching a word costs `O(k)` in the length of the word and is entirely independent of how many words are stored.

## What it is

Each edge is a character; each node represents the prefix formed by the path to it, and carries a flag marking whether that prefix is itself a complete word. Inserting "car" and "cart" shares the first three nodes. Lookup walks `k` edges. So does prefix matching — and once you reach the node for a prefix, every word starting with it is in the subtree below, collected with a DFS.

That last property is the whole reason to choose a trie over a hash map. A hash map gives `O(1)` exact lookup and cannot answer "which keys start with `ca`" at all without scanning everything. A sorted array with binary search can find a prefix range in `O(log n · k)`, which is a legitimate competitor and much simpler. A trie's advantage is enumeration from a prefix in time proportional to the output, plus shared storage for common prefixes.

The cost is memory. A naive trie allocates a node with a child map per character, which for English words is a lot of near-empty objects. A **radix tree** (compressed trie / PATRICIA trie) collapses chains of single-child nodes into one edge holding a substring, which cuts node count dramatically and is what routers use for IP prefix matching and what many HTTP frameworks use for route matching. A **DAWG** goes further and merges identical suffixes too.

For autocomplete specifically, be honest about what production does. A trie in browser memory is right for a bounded local list — command palettes, emoji pickers, a few thousand entries. At real scale the work happens server-side in a search engine with an inverted index, ranking by popularity and recency rather than alphabetical order, with typo tolerance from edit distance and results served from a cache. The trie is the mental model for the prefix step, not the whole system.

## Why it matters

Autocomplete is one of the most frequently asked frontend system design prompts, and the interviewer usually wants both halves: the client-side story (debounce, cancel in-flight requests, cache by prefix, render a listbox with correct ARIA) and the server-side one, where naming a trie or inverted index shows you know what is behind the endpoint. It is `deep` rather than `core` because you will rarely implement one, but you should be able to say why it exists.

## Key points

- Trie lookup and insert are `O(k)` in key length and independent of the number of stored keys.
- The unique capability is prefix enumeration — collect the subtree under a prefix node in time proportional to results.
- A hash map beats a trie for exact lookup and cannot do prefix queries at all.
- A sorted array plus binary search is the simpler competitor for prefix ranges and is often the right production choice.
- The cost is memory and allocation overhead; radix trees compress single-child chains and are what IP and HTTP route matchers use.
- Storing a payload on terminal nodes — frequency, id, score — is what turns a trie from a spell-checker into a ranked autocomplete.
- At scale, autocomplete is a server-side inverted index with popularity ranking and typo tolerance, with the client responsible for debouncing, cancellation, and caching.
