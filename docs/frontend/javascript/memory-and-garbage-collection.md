---
title: Memory & Garbage Collection
summary: How the engine decides what to free, and the four leak patterns that make long-lived SPA sessions degrade.
level: core
minutes: 25
order: 14
tags: [runtime, memory, performance]

related:
  - frontend/javascript/execution-model-and-closures
  - frontend/javascript/iterables-and-collections
  - frontend/performance/memory-in-long-lived-sessions

resources:
  - title: Memory management
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management
    source: MDN
    type: docs
    minutes: 15
    primary: true
  - title: "Trash talk: the Orinoco garbage collector"
    url: https://v8.dev/blog/trash-talk
    source: V8
    type: article
    minutes: 15
  - title: Fix memory problems
    url: https://developer.chrome.com/docs/devtools/memory-problems
    source: Chrome DevTools
    type: docs
    minutes: 20
---

## In one line

An object survives as long as something reachable still points at it, so a "leak" in JavaScript is always a reference you forgot to drop, never a missing `free`.

## What it is

Garbage collection is **reachability**-based, not reference-counting. The engine starts from a set of roots — the global object, the current stack, active closures — and marks everything reachable from them. Whatever isn't marked is collected. This is why cycles are not a leak: two objects pointing at each other with nothing else pointing at them are both unreachable and both collected.

V8 splits the heap by generation. Most objects die young, so the **young generation** is collected frequently with a cheap scavenger that copies survivors. Objects that survive twice are promoted to the **old generation**, collected by a mark-compact cycle that runs incrementally and concurrently to avoid long pauses. The practical implication is that allocating many short-lived objects is cheap, while retaining a large object graph is what actually costs you.

A leak, then, is a retained reference to something you no longer need. Four patterns account for nearly all of them in frontend code:

**Listeners and subscriptions not cleaned up.** An `addEventListener` on `window`, a store subscription, a socket handler, an observer — each keeps its callback alive, and the callback closes over the component's scope. Unmount the component and it's still retained. This is precisely what a `useEffect` cleanup function is for.

**Timers.** A `setInterval` that is never cleared runs forever and holds its closure forever, along with everything that closure captures.

**Detached DOM nodes.** Remove an element from the document while a JS variable, array, or closure still references it, and the whole subtree stays in memory. DevTools' heap snapshot filter for "Detached" finds these directly.

**Unbounded caches.** A `Map` used as a memo cache with no eviction grows for the session's lifetime. `WeakMap` fixes this when the key is the object being cached against, since the entry disappears with its key.

The diagnostic workflow is worth knowing as a sequence: record a Performance timeline and look for a sawtooth heap that trends upward rather than returning to baseline; then take heap snapshots before and after repeating an action, and compare with the "Objects allocated between snapshots" view. Retained size, not shallow size, is the number that matters.

`WeakRef` and `FinalizationRegistry` exist for advanced cases but are rarely the right answer — collection timing is not guaranteed, and code that depends on when a finalizer runs is fragile.

## Why it matters

Any app someone keeps open all day — a dashboard, an editor, a chat surface — degrades if it leaks, and users experience it as "it gets slow after a while," which is hard to reproduce and easy to dismiss. Being able to run the snapshot workflow and name the retaining path is a distinctly senior skill.

It also shows up as a design-round follow-up: "this feed appends items forever, what happens after an hour?" The answer is virtualisation plus bounded caches, and it starts from understanding retention.

## Key points

- Garbage collection is reachability-based, so reference cycles are collected correctly and every real leak is an unintended reference from a root.
- V8's generational heap makes short-lived allocations cheap; the cost is in retained graphs, not in allocation volume.
- Uncleaned event listeners, subscriptions, and observers are the most common leak in component code — the reason effect cleanup functions exist.
- An uncleared `setInterval` retains its closure and everything captured by it for the lifetime of the page.
- A DOM node removed from the document but still referenced from JavaScript keeps its entire subtree alive; DevTools' "Detached" filter finds these.
- An unbounded `Map` cache leaks by design; a `WeakMap` keyed on the cached object releases entries automatically.
- Diagnose with a Performance timeline first — a heap that never returns to baseline across repeated actions — then compare heap snapshots and read retained size, not shallow size.
- `WeakRef` and `FinalizationRegistry` give no timing guarantees and should not be load-bearing in application logic.
