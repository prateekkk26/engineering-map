---
title: Graph traversal — BFS and DFS
summary: The same algorithm with a different container, and the choice decides whether you get shortest paths or a natural recursion.
level: core
minutes: 25
order: 5
tags: [algorithms, patterns, graphs]

related:
  - cs-fundamentals/data-structures/graphs-and-representations
  - cs-fundamentals/data-structures/linked-structures-stacks-and-queues
  - cs-fundamentals/algorithms/recursion-backtracking-and-memoisation

resources:
  - title: Breadth-first search
    url: https://en.wikipedia.org/wiki/Breadth-first_search
    source: Wikipedia
    type: docs
    minutes: 20
    primary: true
  - title: Depth-first search
    url: https://en.wikipedia.org/wiki/Depth-first_search
    source: Wikipedia
    type: docs
    minutes: 20
  - title: Number of Islands
    url: https://leetcode.com/problems/number-of-islands/
    source: LeetCode
    type: article
    minutes: 20
  - title: A* search algorithm
    url: https://en.wikipedia.org/wiki/A*_search_algorithm
    source: Wikipedia
    type: docs
    minutes: 25
---

## In one line

Both traversals repeat "take a node from the frontier, mark it visited, push its unvisited neighbours" — BFS takes from a queue and explores by distance, DFS takes from a stack and explores by depth.

## What it is

Write the skeleton once and it covers both. Initialise a frontier with the start node and a `visited` set containing it. While the frontier is not empty, remove a node, process it, and for each neighbour not yet visited, mark it visited and add it. Swap the queue for a stack and you have switched algorithms. Both are `O(V + E)` — every vertex dequeued once, every edge examined once.

The critical detail is *when* you mark visited. Mark on enqueue, not on dequeue. Marking on dequeue lets the same node enter the frontier several times through different neighbours, which in a dense graph is a blow-up rather than a subtle inefficiency.

**BFS explores in layers**, so on an *unweighted* graph the first time it reaches a node is via a shortest path. That is the single reason to choose it: shortest path in edges, minimum number of moves, "how many steps to reach", or anything level-by-level. Track distance by storing it alongside each node or by processing the queue one full level at a time — the level-by-level form is what "print each level" and "rightmost node per level" questions want. For weighted edges BFS is wrong and Dijkstra is the answer: same shape, but a priority queue ordered by cumulative cost. A* adds a heuristic to that ordering.

**DFS goes deep first**, which makes it natural to write recursively — the call stack *is* the stack — and the right choice for exhaustive exploration: connected components, flood fill, cycle detection, topological sort via post-order, and path enumeration. Its risk is depth: a recursive DFS over a 200,000-node graph blows the JavaScript call stack, and the fix is an explicit stack.

The classic disguised version is the grid. Number-of-islands, flood fill, rotting oranges, shortest path through a maze: the graph is implicit, neighbours are `[[0,1],[0,-1],[1,0],[-1,0]]` offsets with a bounds check, and `visited` is either a parallel grid or a mutation of the input. Bidirectional BFS — searching from both ends and meeting in the middle — roughly square-roots the explored space when you know the target.

## Why it matters

Between them these two cover the large majority of graph questions, and the discriminating follow-up is always "which one, and why". "BFS, because the graph is unweighted and I need the fewest moves" is a complete answer; "DFS, because I need every path" is another. Knowing that Dijkstra is BFS with a priority queue also makes the weighted case a small step rather than a separate algorithm to memorise.

## Key points

- BFS and DFS are the same loop with a queue versus a stack, and both run in `O(V + E)`.
- Mark nodes visited when you add them to the frontier, not when you remove them, or nodes get queued repeatedly.
- BFS gives shortest paths on unweighted graphs because it reaches every node in increasing order of distance.
- Process the BFS queue one level at a time when the question is about depth, layers, or "minimum number of steps".
- DFS suits exhaustive work — components, flood fill, cycle detection, and topological sort via post-order.
- Recursive DFS is limited by call-stack depth; convert to an explicit stack for large or adversarial inputs.
- Dijkstra is BFS with a priority queue keyed on cumulative cost, and A* is Dijkstra plus an admissible heuristic.
- A grid is an implicit graph with computed neighbours, which is why so many "island" and "maze" problems are traversals in disguise.
