---
title: Memory in Long-Lived Sessions
summary: Why a dashboard left open overnight gets slow, the four leaks that cause it, and how to prove one exists.
level: deep
minutes: 20
order: 13
tags: [performance, memory, debugging]

related:
  - frontend/javascript/memory-and-garbage-collection
  - frontend/react/useeffect-mental-model
  - frontend/performance/profiling-with-devtools

resources:
  - title: Fix memory problems
    url: https://developer.chrome.com/docs/devtools/memory-problems
    source: Chrome DevTools
    type: docs
    minutes: 30
    primary: true
  - title: Memory terminology
    url: https://developer.chrome.com/docs/devtools/memory-problems/memory-101
    source: Chrome DevTools
    type: docs
    minutes: 20
  - title: WeakMap
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
    source: MDN
    type: docs
    minutes: 15
---

## In one line

Single-page apps never reload, so anything you forget to clean up accumulates for the entire session — and the symptom is a page that is fine at 9am and janky by lunchtime.

## What it is

The four causes account for nearly everything.

**Uncleaned subscriptions.** An event listener on `window`, an interval, an observer, a WebSocket handler, a store subscription — each holds a reference to a closure, which holds the component's scope, which may hold the DOM. Every mount adds one; without cleanup, navigating between two screens ten times leaves ten live copies. This is why an effect's cleanup function is not optional.

**Detached DOM nodes.** A JavaScript reference to an element removed from the document keeps it, and its entire subtree, alive. Caching nodes in a module-level array or map is the usual route in.

**Unbounded caches.** A `Map` keyed by id that only ever grows — a memoisation cache, a normalised store, a log buffer. Nothing evicts, so it is a leak with good intentions. Bound it with an LRU or a size cap.

**Closures over large data.** A callback that captures a big response object keeps that object alive as long as the callback lives, even if it only needed one field from it.

`WeakMap` and `WeakRef` help where the key's lifetime should drive the entry's — metadata keyed by a DOM node, for example — because entries disappear when the key is collected.

Proving it is mechanical, and the method matters more than the theory. Open the Memory panel, take a heap snapshot, exercise the suspect flow several times (navigate away and back, open and close the modal), force garbage collection, take a second snapshot, and compare with "Objects allocated between snapshots". Growth in detached nodes or in one constructor's count is your leak, and the retainer path names what is holding it. The Performance panel's memory track showing a sawtooth that trends upward rather than returning to baseline is the earlier signal.

## Why it matters

Internal tools, dashboards, trading screens, and chat apps stay open for hours or days, and this is the difference between an app that stays usable and one people restart daily.

It also comes up as a debugging question — "the app gets slower the longer it is open, how do you investigate?" — where the snapshot-diff method is the expected answer.

## Key points

- Every listener, interval, observer, and subscription needs a matching cleanup, or each mount leaves a copy behind.
- A reference to a removed element keeps its whole subtree alive as detached DOM.
- Caches that only grow are leaks — bound them by size or age.
- Closures capture more than they use, keeping large responses alive for the life of the callback.
- `WeakMap` and `WeakRef` tie entry lifetime to the key's, which fits node-keyed metadata.
- Prove a leak by diffing heap snapshots around a repeated flow and reading the retainer path.
- An upward-trending sawtooth in the memory track is the earliest signal.
