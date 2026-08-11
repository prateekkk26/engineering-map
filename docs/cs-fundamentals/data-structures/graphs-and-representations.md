---
title: Graphs and representations
summary: Nodes and edges, the two ways to store them, and why recognising a problem as a graph is most of the work.
level: core
minutes: 25
order: 6
tags: [data-structures, fundamentals, graphs]

related:
  - cs-fundamentals/algorithms/graph-traversal-bfs-and-dfs
  - cs-fundamentals/data-structures/trees-and-traversal
  - cs-fundamentals/data-structures/choosing-a-data-structure

resources:
  - title: Graph (abstract data type)
    url: https://en.wikipedia.org/wiki/Graph_(abstract_data_type)
    source: Wikipedia
    type: docs
    minutes: 20
    primary: true
  - title: Adjacency list
    url: https://en.wikipedia.org/wiki/Adjacency_list
    source: Wikipedia
    type: docs
    minutes: 10
  - title: Topological sorting
    url: https://en.wikipedia.org/wiki/Topological_sorting
    source: Wikipedia
    type: docs
    minutes: 20
  - title: Union-find / disjoint-set data structure
    url: https://en.wikipedia.org/wiki/Disjoint-set_data_structure
    source: Wikipedia
    type: docs
    minutes: 25
---

## In one line

A graph is a set of nodes and the edges between them, with no root, no ordering, and no guarantee of acyclicity — which is exactly why it models the messy relationships trees cannot.

## What it is

The properties that change the algorithm: **directed or undirected** (does an edge go both ways), **weighted or unweighted** (do edges carry a cost), **cyclic or acyclic**, **connected or not**, and **dense or sparse**. A tree is just a connected acyclic undirected graph with `n-1` edges; a DAG — directed, acyclic — is the shape of build dependencies, module imports, task pipelines, and React's own render dependencies.

Two representations, and the choice follows density. An **adjacency list** maps each node to its neighbours — `Map<Node, Node[]>` — costing `O(V + E)` space, `O(1)` to enumerate a node's neighbours, and `O(degree)` to test a specific edge. An **adjacency matrix** is a `V × V` grid of booleans or weights, costing `O(V²)` space always, `O(1)` edge lookup, and `O(V)` to enumerate neighbours. Real graphs are overwhelmingly sparse, so adjacency lists are the default; matrices win only for dense graphs, or for small fixed ones where the constant-time edge test dominates. A third form, the **edge list**, is just a list of pairs — useless for traversal, ideal for Kruskal's algorithm and for the format data usually arrives in.

Half of graph problems don't announce themselves. A 2D grid is a graph where each cell has up to four neighbours computed on the fly rather than stored — flood fill, islands, shortest path through a maze. A dependency file is a DAG. Course prerequisites, friend suggestions, currency conversion chains, module bundling, and "is this state reachable" are all graph problems in disguise. The recognition step is: *are there entities and relationships, and does the question involve reaching, connecting, ordering, or grouping them?*

Two named tools worth having beyond traversal. **Topological sort** orders a DAG so every node comes before its dependents, and fails exactly when there is a cycle — which makes it the standard cycle detector for build and dependency problems. **Union-find** (disjoint sets) tracks connected components incrementally in near-constant amortised time with path compression, and is the tool for "are these two in the same group" and for Kruskal's minimum spanning tree.

## Why it matters

Graph *recognition* is the actual test. Interviewers rarely say "graph"; they describe a grid, a set of dependencies, or a social relationship and watch whether you model it as nodes and edges before writing anything. Getting there quickly turns an intimidating problem into a BFS you have written twenty times.

## Key points

- Directed, weighted, cyclic, and connected are the four properties that decide which algorithm applies — establish them before writing code.
- Adjacency list costs `O(V + E)` and suits sparse graphs; adjacency matrix costs `O(V²)` and buys `O(1)` edge lookup.
- A tree is a connected acyclic graph with `n-1` edges, so every tree algorithm is a graph algorithm with a guarantee attached.
- A grid is an implicit graph — neighbours are computed from coordinates rather than stored, and no adjacency structure is needed.
- Any traversal of a general graph needs a visited set; without it, a cycle is an infinite loop.
- Topological sort exists only for a DAG, and its failure to produce a full ordering is precisely a cycle detection result.
- Union-find answers connectivity queries in near-constant amortised time and is the right tool for grouping without traversal.
- Most graph traversals are `O(V + E)`, so quoting that bound is usually the correct answer to the complexity follow-up.
