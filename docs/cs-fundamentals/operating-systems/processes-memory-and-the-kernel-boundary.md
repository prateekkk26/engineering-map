---
title: Processes, memory, and the kernel boundary
summary: What a running program actually owns, why a system call is expensive, and where the memory in your process is going.
level: core
minutes: 25
order: 1
tags: [operating-systems, fundamentals, memory]

related:
  - cs-fundamentals/concurrency/processes-threads-and-async-io
  - cs-fundamentals/operating-systems/virtual-memory-and-the-memory-hierarchy
  - frontend/javascript/memory-and-garbage-collection

resources:
  - title: Anatomy of a Program in Memory
    url: https://manybutfinite.com/post/anatomy-of-a-program-in-memory/
    source: Gustavo Duarte
    type: article
    minutes: 25
    primary: true
  - title: System call
    url: https://en.wikipedia.org/wiki/System_call
    source: Wikipedia
    type: docs
    minutes: 15
  - title: strace — trace system calls
    url: https://jvns.ca/blog/2015/04/14/strace-zine/
    source: Julia Evans
    type: article
    minutes: 15
  - title: Signals
    url: https://man7.org/linux/man-pages/man7/signal.7.html
    source: Linux man-pages
    type: docs
    minutes: 25
---

## In one line

A process is an isolated virtual address space plus the kernel-managed resources attached to it, and every time your code needs something outside that box it must cross into the kernel through a system call.

## What it is

A process's address space has a conventional layout. **Text** holds the executable code, read-only. **Data** and **BSS** hold initialised and zeroed globals. The **heap** grows upward and is where dynamic allocation lives — every JavaScript object, every buffer. The **stack** grows downward, one frame per function call holding locals and the return address, and it is fixed-size, which is why unbounded recursion is a crash and not a slowdown. Between them, memory-mapped regions hold shared libraries and files mapped with `mmap`.

The **kernel boundary** is the thing to internalise. Your code runs in user mode with no direct access to hardware. Reading a file, opening a socket, allocating more memory from the OS, or creating a thread all require a **system call** — a controlled transition into kernel mode. That transition is not free: mode switch, argument validation, and possibly a context switch add up to hundreds of nanoseconds to microseconds each. Which is why buffered I/O exists — writing a file line by line unbuffered means one syscall per line, and batching into 64KB chunks turns a thousand syscalls into one.

Processes are created by `fork` (copy this process, made cheap by copy-on-write pages) and `exec` (replace the image), and they communicate through pipes, sockets, shared memory, or files. A child that finishes but hasn't been reaped by its parent is a **zombie**; a child whose parent died is an **orphan** and gets adopted by init. In containers this matters because PID 1 has special signal semantics and does not reap by default — the reason `SIGTERM` sometimes doesn't reach a Node process and containers take the full 30 seconds to die.

**Signals** are the OS's interrupt mechanism, and the ones that matter operationally are `SIGTERM` (please shut down — this is what an orchestrator sends first, and the handler is where you drain connections), `SIGKILL` (cannot be caught, the OOM killer's tool), `SIGINT` (Ctrl-C), and `SIGSEGV` (invalid memory access).

## Why it matters

Graceful shutdown is a real production requirement — a deploy that kills a process mid-request drops user work — and doing it correctly means handling `SIGTERM`, stopping new work, finishing in-flight requests, and exiting before the `SIGKILL` deadline. The syscall cost model is also what explains why buffering, batching, and connection reuse are worth doing everywhere.

## Key points

- A process owns an isolated virtual address space; the stack is fixed-size and grows down, the heap grows up and holds dynamic allocation.
- Stack overflow from deep recursion is a hard crash, not a performance problem, because the stack region has a fixed limit.
- Every interaction with the outside world is a system call, and each one costs a user-to-kernel transition.
- Buffering and batching exist to amortise syscall cost — unbuffered per-line writes are orders of magnitude slower.
- `fork` is cheap because pages are copy-on-write; `exec` replaces the process image entirely.
- Handle `SIGTERM` to drain in-flight work before shutdown; `SIGKILL` cannot be caught, so you get no cleanup from it.
- PID 1 in a container does not reap children or get default signal handling, which is why processes sometimes ignore `SIGTERM`.
- `strace`, `lsof`, and `/proc` are the tools for seeing what a process is actually doing when logs are not enough.
