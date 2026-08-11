---
title: Scheduling and context switching
summary: How the OS shares a few cores among hundreds of threads, and why adding more threads eventually makes things slower.
level: deep
minutes: 20
order: 4
tags: [operating-systems, concurrency, performance]

related:
  - cs-fundamentals/concurrency/processes-threads-and-async-io
  - cs-fundamentals/operating-systems/containers-and-resource-limits
  - cs-fundamentals/concurrency/locks-deadlock-and-contention

resources:
  - title: Scheduling (computing)
    url: https://en.wikipedia.org/wiki/Scheduling_(computing)
    source: Wikipedia
    type: docs
    minutes: 20
    primary: true
  - title: Context switch
    url: https://en.wikipedia.org/wiki/Context_switch
    source: Wikipedia
    type: docs
    minutes: 15
  - title: Understanding load average
    url: https://www.brendangregg.com/blog/2017-08-08/linux-load-averages.html
    source: Brendan Gregg
    type: article
    minutes: 30
  - title: Utilization, Saturation and Errors — the USE method
    url: https://www.brendangregg.com/usemethod.html
    source: Brendan Gregg
    type: article
    minutes: 25
---

## In one line

The scheduler decides which runnable thread gets a core next and preempts it after a time slice, and every switch costs saved state plus a cold cache.

## What it is

Threads exist in a few states: running, runnable (ready but waiting for a core), and blocked (waiting on I/O, a lock, or a timer). The scheduler picks among the runnable ones. Linux's CFS aims for fairness weighted by priority (nice values, cgroup shares); real-time schedulers guarantee ordering instead. A thread yields either voluntarily — it blocks on I/O — or involuntarily when its time slice expires and it is **preempted**.

A **context switch** saves registers, the program counter, and the stack pointer, then loads another thread's. The direct cost is on the order of a microsecond. The indirect cost is larger and less visible: the new thread's data is not in L1/L2, so it runs slowly until its working set is warm again, and a switch between processes also flushes or partially invalidates the TLB. This is why oversubscribing threads backfires. Past the point where runnable threads exceed cores, you add switching overhead and cache pollution without adding throughput — the curve turns over and goes down.

**Load average** on Linux counts runnable *and* uninterruptible-sleep tasks, so a load of 8 on 8 cores does not straightforwardly mean saturated: it can mean CPU-bound work, or it can mean processes stuck on disk. Read it alongside CPU utilisation and I/O wait rather than alone. Involuntary context switches (`vmstat`, `pidstat -w`) are the direct signal of CPU contention.

The distinction that matters for sizing: **CPU-bound** work should have a worker count near the core count, because more threads only add switching. **I/O-bound** work benefits from many more workers than cores, because most are blocked and consuming no CPU — or better, from an event loop that needs no threads at all to wait.

Two related ideas. **Priority inversion** happens when a low-priority thread holds a lock a high-priority thread needs, and a medium-priority thread starves the low one — the Mars Pathfinder bug, solved by priority inheritance. **Green threads / coroutines** (Go's goroutines, Rust's tasks, virtual threads) are scheduled in user space, so switching costs tens of nanoseconds instead of a syscall, which is how those runtimes support hundreds of thousands of concurrent tasks.

## Why it matters

Thread-pool and worker-count sizing is a real decision — in Node's `UV_THREADPOOL_SIZE`, a database connection pool, or a container's CPU allocation — and the right answer depends entirely on whether the work is CPU- or I/O-bound. Being able to read load average correctly, and to say why doubling workers made throughput worse, is the practical payoff.

## Key points

- Threads are running, runnable, or blocked, and only runnable ones compete for cores.
- A context switch costs microseconds directly and more indirectly through cold caches and TLB invalidation.
- Beyond roughly one runnable thread per core, additional threads reduce throughput rather than increase it.
- Size CPU-bound pools near the core count; size I/O-bound pools much higher, or use an event loop instead.
- Linux load average includes uninterruptible-sleep tasks, so a high load can mean blocked disk I/O rather than CPU saturation.
- Involuntary context switches are the direct measure of CPU contention, more useful than load average alone.
- Priority inversion is a real deadlock-adjacent failure, and priority inheritance is the standard fix.
- User-space scheduled coroutines switch far more cheaply than kernel threads, which is why goroutine-style concurrency scales differently.
