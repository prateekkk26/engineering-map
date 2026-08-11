---
title: Trees and traversal
summary: Hierarchies, the four ways to walk them, and why balance is the difference between logarithmic and linear.
level: core
minutes: 25
order: 4
tags: [data-structures, fundamentals, trees]

related:
  - cs-fundamentals/algorithms/graph-traversal-bfs-and-dfs
  - cs-fundamentals/algorithms/recursion-backtracking-and-memoisation
  - cs-fundamentals/data-structures/tries-and-prefix-search

resources:
  - title: Binary search tree
    url: https://en.wikipedia.org/wiki/Binary_search_tree
    source: Wikipedia
    type: docs
    minutes: 25
    primary: true
  - title: Tree traversal
    url: https://en.wikipedia.org/wiki/Tree_traversal
    source: Wikipedia
    type: docs
    minutes: 20
  - title: Self-balancing binary search tree
    url: https://en.wikipedia.org/wiki/Self-balancing_binary_search_tree
    source: Wikipedia
    type: docs
    minutes: 15
  - title: B-tree
    url: https://en.wikipedia.org/wiki/B-tree
    source: Wikipedia
    type: docs
    minutes: 25
---

## In one line

A tree is a connected acyclic graph with one root and no cycles, and the reason to use one is that a *balanced* tree keeps ordered operations at `O(log n)` by halving the search space at every level.

## What it is

The vocabulary first, because interviewers use it precisely: root, leaf, parent, child, depth (root to node), height (node to deepest leaf). A **binary tree** allows at most two children. A **binary search tree** adds the invariant that everything in the left subtree is smaller and everything in the right is larger, which is what makes lookup a sequence of comparisons that discards half the remaining nodes each time.

That `O(log n)` claim depends entirely on balance. Insert already-sorted data into a naive BST and you get a linked list with extra steps — `O(n)` for everything. **Self-balancing** trees fix this by restructuring on write: AVL trees keep subtree heights within one and are faster to read, red-black trees are looser and cheaper to write, and both guarantee `O(log n)` worst case. **B-trees** generalise the idea to many children per node so each node fills a disk page or cache line, which is why every relational database index is a B-tree rather than a binary one — the cost that matters there is the number of page reads, not comparisons.

Four traversals, and knowing which produces what is the common question. **In-order** (left, node, right) visits a BST in sorted order — that is the one-line proof a tree is a valid BST. **Pre-order** (node, left, right) is the natural shape for serialising or cloning a tree. **Post-order** (left, right, node) processes children before parents, which is what you want for computing sizes, freeing resources, or evaluating an expression tree. **Level-order** is BFS with a queue and gives you depth-by-depth output.

Recursive traversal is the clean implementation, but recursion depth equals tree height, so an unbalanced tree of 100,000 nodes overflows the stack. Iterative traversal with an explicit stack is the safe version. Trees are also everywhere in frontend work already: the DOM is a tree, a React element tree is a tree, and a file system is a tree, so "traverse and transform a nested structure" is a very common live-coding prompt.

## Why it matters

The realistic interview shape is not "implement a red-black tree" — it is "here's a nested comment thread / category tree / DOM-like structure, flatten it, find a node, or compute depth." That is a traversal question wearing product clothes. The balance argument matters separately whenever databases come up, because it explains what an index actually is.

## Key points

- A BST gives `O(log n)` search, insert, and delete only when balanced; degenerate input makes it `O(n)`.
- Self-balancing trees pay a rotation on write to guarantee the read bound — AVL favours reads, red-black favours writes.
- Database indexes are B-trees, not binary trees, because the unit of cost is a disk page rather than a comparison.
- In-order traversal of a BST yields sorted output, which is the standard way to validate one.
- Post-order is the choice when a parent's result depends on its children; pre-order is the choice for serialisation.
- Level-order traversal is BFS with a queue and is how you answer any "per level" question.
- Recursion depth equals tree height, so deep or skewed trees need an explicit stack to avoid overflow.
- Hash tables beat trees for pure lookup; trees win the moment you need ordering, ranges, or the nearest key.
