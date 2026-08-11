---
title: Virtual memory and the memory hierarchy
summary: Every address your program uses is a lie the kernel maintains, and the cost of resolving it spans five orders of magnitude.
level: core
minutes: 25
order: 2
tags: [operating-systems, memory, performance]

related:
  - cs-fundamentals/complexity/when-complexity-lies
  - cs-fundamentals/operating-systems/containers-and-resource-limits
  - cs-fundamentals/operating-systems/processes-memory-and-the-kernel-boundary

resources:
  - title: What Every Programmer Should Know About Memory — part 2
    url: https://lwn.net/Articles/252125/
    source: LWN
    type: article
    minutes: 45
  - title: Virtual memory
    url: https://en.wikipedia.org/wiki/Virtual_memory
    source: Wikipedia
    type: docs
    minutes: 20
    primary: true
  - title: CPU cache
    url: https://en.wikipedia.org/wiki/CPU_cache
    source: Wikipedia
    type: docs
    minutes: 25
  - title: Understanding the Linux OOM killer
    url: https://www.kernel.org/doc/gorman/html/understand/understand016.html
    source: Linux kernel docs
    type: docs
    minutes: 20
---

## In one line

Virtual memory gives every process a private, contiguous-looking address space that the MMU translates to scattered physical pages on demand, and the hierarchy behind those pages ranges from a one-nanosecond cache hit to a ten-millisecond disk read.

## What it is

The kernel and the CPU's MMU maintain **page tables** mapping virtual pages (typically 4KB) to physical frames. Three consequences follow. Processes are isolated — one cannot address another's memory. Memory looks contiguous even when physical frames are scattered. And a process can be allocated more memory than physically exists, because pages are only backed when touched.

Accessing an unmapped page raises a **page fault**. A minor fault means the page is in memory but not mapped yet (first touch of a fresh allocation, or a shared library another process already loaded) and is cheap. A **major fault** means fetching from disk — orders of magnitude slower. When memory is oversubscribed the kernel starts evicting pages to swap, and if the working set exceeds RAM the system **thrashes**: it spends all its time paging and effectively stops. A thrashing machine looks like a hang, not a slowdown, which is why swap is usually disabled on servers — better to fail fast via the OOM killer than to degrade unboundedly.

The **hierarchy** is the other half. Registers, then L1 (~1ns, ~32KB), L2 (~4ns), L3 (~10-20ns, shared), main memory (~100ns), SSD (~100µs), network and spinning disk (~ms). Each level is faster, smaller, and more expensive per byte. The CPU moves data in **cache lines** of 64 bytes, not individual values, and it prefetches predictable access patterns. That is why sequential access to a contiguous array can be an order of magnitude faster than random access to the same data — and why an array of structs sometimes loses to a struct of arrays when you only read one field. **Locality** — temporal (reuse a value soon) and spatial (use neighbours) — is the property to design for.

The **TLB** caches recent page-table translations. A TLB miss costs a page-table walk, which is why huge pages exist for workloads with large working sets.

## Why it matters

This is the mechanism under "why is contiguous memory faster" and under a very practical operational fact: a container hitting its memory limit is killed rather than slowed. Recognising a memory-limit kill (exit code 137, no application stack trace) versus an application error saves hours, and understanding cache lines explains performance differences that complexity analysis says should not exist.

## Key points

- Virtual addresses are translated to physical frames by the MMU through page tables, which is what enforces process isolation.
- Memory is allocated lazily — pages become real when first touched, so allocation and residency are different things.
- Major page faults hit disk and are orders of magnitude slower than minor faults; sustained faulting is thrashing and looks like a hang.
- The hierarchy spans roughly five orders of magnitude from L1 to disk, so where data sits matters more than how many operations touch it.
- Data moves in 64-byte cache lines and hardware prefetches sequential patterns, which is why array iteration beats pointer chasing.
- Design for temporal and spatial locality; a smaller working set that fits in cache can beat an asymptotically better algorithm.
- The TLB caches translations, and huge pages exist to reduce TLB misses on large working sets.
- Swap turns an out-of-memory condition into unbounded slowness, which is why servers usually disable it and let the OOM killer act.
