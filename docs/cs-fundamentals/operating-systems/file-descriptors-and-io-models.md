---
title: File descriptors and I/O models
summary: Everything is a file descriptor, they are a finite resource, and how you wait on them decides how many connections one process can serve.
level: core
minutes: 25
order: 3
tags: [operating-systems, io, fundamentals]

related:
  - cs-fundamentals/concurrency/processes-threads-and-async-io
  - cs-fundamentals/networking/network-failure-modes
  - cs-fundamentals/operating-systems/processes-memory-and-the-kernel-boundary

resources:
  - title: Async IO on Linux — select, poll, and epoll
    url: https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/
    source: Julia Evans
    type: article
    minutes: 20
    primary: true
  - title: File descriptor
    url: https://en.wikipedia.org/wiki/File_descriptor
    source: Wikipedia
    type: docs
    minutes: 15
  - title: epoll — I/O event notification facility
    url: https://man7.org/linux/man-pages/man7/epoll.7.html
    source: Linux man-pages
    type: docs
    minutes: 30
  - title: The Node.js event loop
    url: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
    source: Node.js
    type: docs
    minutes: 25
---

## In one line

A file descriptor is a small integer indexing the kernel's table of things this process has open — files, sockets, pipes, timers — and the I/O model is how you find out which of them are ready.

## What it is

The Unix design is that everything is a file descriptor. A regular file, a TCP socket, a pipe between processes, a terminal, even a timer or a signal on Linux: all the same integer handle, all readable and writable with the same syscalls. That uniformity is why `select`, `poll`, and `epoll` can multiplex across all of them at once.

Descriptors are **finite**. Each process has a limit (`ulimit -n`, often 1024 by default and raised to tens of thousands for servers) and so does the system. Leaking them — opening files or sockets without closing, or never releasing connections from a pool — produces `EMFILE: too many open files`, an error that shows up long after the leak and often takes down an otherwise healthy process. `lsof -p <pid>` is how you find it.

Four models for waiting. **Blocking** is the simple one: `read()` returns when data is ready, and the thread does nothing until then. Correct and readable, but one thread per connection means memory and context-switching costs that cap you in the low thousands. **Non-blocking with polling** returns `EAGAIN` immediately if nothing is ready, so you can loop — but busy-looping burns CPU. **I/O multiplexing** is the good one: hand the kernel a set of descriptors and block until any is ready. `select` and `poll` are `O(n)` in the number of watched descriptors, so they degrade as connections grow; `epoll` (Linux) and `kqueue` (BSD/macOS) are `O(1)` in readiness because the kernel maintains the interest set across calls. That is the mechanism that made C10K solvable and is what Node's libuv, NGINX, and Redis are built on. **Asynchronous I/O** proper — `io_uring` — goes further: submit the operation and be notified when it has *completed*, not when it is ready to start, which also covers disk I/O that `epoll` never handled well.

A detail worth knowing about Node specifically: sockets use `epoll`, but regular file I/O does not fit that model, so libuv runs it on a thread pool (default size four, tunable via `UV_THREADPOOL_SIZE`). Heavy filesystem work, DNS lookups, and `crypto` operations contend for those four threads — a real and non-obvious bottleneck.

## Why it matters

`EMFILE` and connection-pool exhaustion are common production failures with a shared root cause, and knowing that descriptors are a bounded resource is what makes you close things and bound pools. "How does Node handle thousands of concurrent connections on one thread" is also a standard interview question, and `epoll` is the answer — not magic, just readiness notification.

## Key points

- Files, sockets, pipes, and timers are all file descriptors, which is why one polling mechanism can wait on all of them.
- Descriptors are a bounded per-process resource; leaking them causes `EMFILE` far from the code that caused it.
- One thread per connection caps out in the low thousands because each thread costs stack memory and context switches.
- `select` and `poll` scan the whole watch set on every call, so they scale poorly; `epoll` and `kqueue` keep the set in the kernel.
- Readiness-based I/O is what lets a single-threaded event loop serve tens of thousands of sockets.
- `io_uring` is completion-based rather than readiness-based, which is what finally makes async disk I/O work well on Linux.
- Node runs file I/O, DNS, and some crypto on a four-thread pool, so those can bottleneck independently of the event loop.
- Always bound and close: connection pools, file handles, and watchers all leak descriptors when cleanup is skipped.
