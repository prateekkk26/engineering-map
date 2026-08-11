---
title: Low-Level Design Classics
summary: The recurring module-design prompts — an LRU cache, a rate limiter, a parking lot, a scheduler — and the one idea each is really testing.
level: core
minutes: 20
order: 5
tags: [lld, practice, interview]

related:
  - cs-fundamentals/data-structures/choosing-a-data-structure
  - system-design/low-level-design/state-machines-and-lifecycle-modelling
  - system-design/frontend-system-design/machine-coding-classics

resources:
  - title: LRU Cache
    url: https://leetcode.com/problems/lru-cache/
    source: LeetCode
    type: article
    minutes: 30
  - title: Low Level Design Primer
    url: https://github.com/prasadgujar/low-level-design-primer
    source: Prasad Gujar
    type: repo
    minutes: 45
    primary: true
  - title: Grokking the Object Oriented Design Interview — problem list
    url: https://github.com/tssovi/grokking-the-object-oriented-design-interview
    source: Community
    type: repo
    minutes: 40 # unverified
---

## In one line

Each classic exists to test one specific idea, and recognising which idea it is gets you to a good design faster than remembering someone else's solution.

## What it is

**LRU cache — the composite data structure.** Hash map for O(1) lookup plus a doubly-linked list for O(1) recency updates; the map's values are list nodes so you can unlink in constant time. Follow-ups: TTL expiry (a second index by expiry, or lazy eviction on read), thread safety, and why you'd pick LFU instead. *The idea: two structures composed to get both access patterns.*

**Rate limiter — atomicity and shared state.** Token bucket, per key, with the check-and-decrement atomic. See `design-a-rate-limiter` for the full treatment. *The idea: the read-modify-write must not be interleavable.*

**Parking lot / hotel booking / library — modelling and allocation.** Entities (spot, vehicle, ticket), a lifecycle (`free → reserved → occupied`), and an allocation strategy that should be an interface because there's genuinely more than one policy. The pitfall is a deep inheritance tree over vehicle types; compose with a size attribute instead. *The idea: clean entity modelling plus one deliberate strategy seam.*

**Elevator — state machines and scheduling.** Each car is a state machine (`idle | moving_up | moving_down | doors_open`), and the controller assigns requests by a policy. Say up front that an optimal policy is out of scope and pick a defensible one. *The idea: state machines plus a pluggable policy, cleanly separated.*

**Task scheduler — priority and time.** A priority queue keyed by next run time, a worker pool, and answers to the recurring-job questions: overlapping runs, missed runs, idempotency. *The idea: a heap plus explicit answers to the awkward scheduling cases.*

**Logger — levels, sinks, buffering.** Level filtering, pluggable sinks, structured output, async buffering with a flush on exit. *The idea: extension points, and not losing data on shutdown.*

**Text editor with undo/redo — the command pattern.** Operations as objects with `do` and `undo`, two stacks, and a coalescing rule so typing ten characters isn't ten undo steps. *The idea: represent the action, not just the result.*

**Vending machine / ATM — explicit state.** A textbook state machine where the failure modes (payment taken, dispense fails) are the interesting part. *The idea: model the failure transitions, not just the happy path.*

**How to run one of these.** Clarify scope and one or two requirements. Name the entities and their responsibilities. Sketch the key interfaces. Then implement the *core* method properly — the one with the real logic — rather than typing getters. State the complexity of the important operations. Finish with what you'd change under concurrency or at scale.

**The recurring mistakes:** over-abstracting (an interface per class, a factory for everything), building a deep inheritance hierarchy, silently ignoring thread safety, and spending fifteen minutes on boilerplate instead of the one method the problem is actually about.

## Why it matters

These appear inside practical and pairing rounds more often than as a dedicated round, and they're small enough that the design is fully visible — there's nowhere to hide vagueness. Knowing what each problem is really testing lets you get to the interesting part in five minutes instead of twenty.

## Key points

- LRU cache is a hash map plus a doubly-linked list; the map stores nodes so unlinking is O(1).
- Rate limiter is about atomic check-and-decrement on shared state, not the algorithm choice.
- Parking-lot-style problems test entity modelling plus one justified strategy interface.
- Elevator and vending machine are state machines — model the failure transitions explicitly.
- Scheduler problems want a priority queue plus answers on overlap, misses and idempotency.
- Undo/redo is the command pattern: represent operations as objects and coalesce sensibly.
- Implement the core method properly and skip the boilerplate; state complexities out loud.
- Over-abstraction and deep inheritance are the two most common failures in this round.
