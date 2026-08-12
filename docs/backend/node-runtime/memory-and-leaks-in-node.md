---
title: Memory & Leaks in Node
summary: How V8's heap behaves under a long-running server, the four things that usually retain memory, and how to prove which one it is.
level: deep
minutes: 25
order: 4
tags: [node, memory, performance, debugging]

related:
  - backend/node-runtime/the-node-event-loop-on-a-server
  - backend/node-runtime/streams-and-backpressure
  - practices/incident-response/debugging-production-systems

resources:
  - title: Memory diagnostics
    url: https://nodejs.org/en/learn/diagnostics/memory
    source: Node.js
    type: docs
    minutes: 30
    primary: true
  - title: Trash talk — the Orinoco garbage collector
    url: https://v8.dev/blog/trash-talk
    source: V8
    type: article
    minutes: 20
  - title: Record heap snapshots
    url: https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots
    source: Chrome DevTools
    type: docs
    minutes: 25
---

## In one line

A leak in Node is not unfreed memory — it's memory still reachable from a root you forgot about, so finding it means finding what still points at it.

## What it is

V8 splits the heap into a **new space**, collected constantly and cheaply (most objects die young), and an **old space**, collected by a mark-and-sweep that has to pause your single thread. That's the first practical consequence: a large live heap means longer GC pauses, and those pauses show up as latency spikes across every request, not as a memory alert.

Four retention patterns account for most real leaks. **Module-scope collections** — a `Map` used as a cache with no eviction and no size bound, which is the single most common one. **Listeners never removed**: `emitter.on()` per request against a long-lived emitter, which Node warns about at eleven listeners for exactly this reason. **Closures over large objects**, where a callback keeps a whole request body alive because it captured the scope containing it. And **unbounded buffering** — the stream that ignored backpressure, or an array accumulating "recent items" forever.

The diagnostic procedure is what to actually rehearse. Watch `heapUsed` over hours: a sawtooth that returns to the same floor after GC is healthy; a floor that climbs is a leak. Then take **two heap snapshots** with a workload in between and compare — the comparison view shows which constructors grew and, crucially, the **retainer path** that keeps them alive. That path names the variable, which is the answer. `--max-old-space-size` raises the ceiling and is a stalling tactic, not a fix.

Distinguish a leak from **legitimate high usage**: a service holding a 500MB in-memory cache isn't leaking, it's configured that way. And distinguish heap from **RSS** — native memory from buffers, compression and native modules lives outside the JS heap, so a heap snapshot that looks fine while RSS grows points at `Buffer` retention or a native addon.

In a containerised runtime, set the heap limit *below* the container memory limit. Otherwise V8 happily grows past it and the OOM killer terminates the process with no JavaScript-level error, no stack, and nothing in your logs.

## Why it matters

"The service restarts every few hours" is a common real incident, and the expected answer is a procedure — trend the heap, snapshot twice, read the retainer path — not a guess. This is the kind of debugging story a deep-dive round rewards, because it shows a method rather than a memorised list of causes.

## Key points

- A leak is unintended reachability; GC is working correctly, something is still pointing at the data.
- Old-space collection pauses the only thread you have, so a big heap is a latency problem before it's a memory one.
- Unbounded module-scope caches are the most common leak — bound size and TTL, or use a real LRU.
- Per-request listeners on a long-lived emitter accumulate; the eleven-listener warning is a leak alarm.
- Diagnose with two heap snapshots and the retainer path, not by staring at the code.
- RSS growing while the heap is flat points at `Buffer`s or native modules, not JavaScript objects.
- Set `--max-old-space-size` under the container limit, or the OOM killer takes the process without a trace.
