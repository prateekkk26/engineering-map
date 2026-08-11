---
title: Processes, threads, and async I/O
summary: Three ways to overlap work, what each actually costs, and why a single-threaded runtime can still serve thousands of connections.
level: core
minutes: 25
order: 1
tags: [concurrency, runtime, fundamentals]

related:
  - _shared/concurrency-models
  - cs-fundamentals/operating-systems/file-descriptors-and-io-models
  - frontend/javascript/event-loop

resources:
  - title: The C10K problem
    url: http://www.kegel.com/c10k.html
    source: Dan Kegel
    type: article
    minutes: 30
  - title: Don't block the event loop
    url: https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop
    source: Node.js
    type: docs
    minutes: 20
    primary: true
  - title: Thread (computing)
    url: https://en.wikipedia.org/wiki/Thread_(computing)
    source: Wikipedia
    type: docs
    minutes: 20
  - title: Node.js worker threads
    url: https://nodejs.org/api/worker_threads.html
    source: Node.js
    type: docs
    minutes: 20
---

## In one line

A process is an isolated address space, a thread is a scheduled execution context sharing that space, and async I/O is a single thread not waiting — three different answers to "do more than one thing", with three different costs.

## What it is

A **process** owns its own virtual memory, file descriptors, and permissions. Isolation is its feature: one process crashing or corrupting memory cannot touch another, which is why browsers put tabs in separate processes and why a crashed worker doesn't take the server down. The cost is weight — creation is expensive, and communication requires IPC, shared memory, or a socket, all of which mean serialising data.

A **thread** shares the process's heap and file descriptors but has its own stack and registers. Creation is much cheaper and communication is free, because everything is already shared. That sharing is exactly the danger: any mutable state touched by two threads needs synchronisation, and getting it wrong produces race conditions, torn reads, and deadlocks. Threads give true parallelism on multiple cores, which is the only reason to accept that risk for CPU-bound work.

**Async I/O** is the third answer, and it addresses a different problem. Most server work is not CPU-bound — it is waiting on a database, a disk, or another service. A thread blocked on a socket read is consuming a megabyte of stack to do nothing. Async I/O inverts this: register interest in a file descriptor, return to the loop, and get called back when data is ready. One thread multiplexes thousands of connections through `epoll`, `kqueue`, or `io_uring`. This is what Node.js and the browser do, and it is why "single-threaded" does not mean "one thing at a time" — the JavaScript *execution* is single-threaded, while the I/O underneath runs in a thread pool and the kernel.

The consequence to internalise: in an event-loop runtime, a CPU-bound task blocks *everything*. A synchronous JSON parse of a 50MB payload, a hashing loop, or an accidental `O(n²)` over a large array stalls every pending request, not just the one that caused it. The fix is not async syntax — `await` on a synchronous function changes nothing — it is moving the work off the loop: a worker thread, a Web Worker in the browser, a separate process, or a queue. Conversely, threads are the wrong tool for I/O concurrency, which is the lesson of the C10K problem: one thread per connection does not scale past a few thousand.

## Why it matters

"Node is single-threaded, so how does it handle concurrent requests?" is a standard interview question, and the good answer separates JavaScript execution from kernel-level I/O. In real work this is the diagnosis for a server whose p99 latency spikes for every user whenever one user uploads a large file — a blocked event loop, fixed by moving the work rather than by adding `async`.

## Key points

- Processes give isolation at the cost of expensive creation and serialised communication; threads give cheap sharing at the cost of synchronisation bugs.
- Threads deliver true parallelism across cores, which matters only for CPU-bound work.
- Async I/O solves waiting, not computing — one thread can multiplex thousands of sockets via `epoll`/`kqueue`.
- "Single-threaded JavaScript" describes the execution of your code; I/O runs on a thread pool and in the kernel underneath.
- A CPU-bound task on the event loop blocks every other request, and marking it `async` does not help.
- Move CPU work off the loop with worker threads, Web Workers, a child process, or a job queue.
- One thread per connection hits a ceiling in the low thousands, which is the entire point of the C10K problem.
- Web Workers and Node worker threads communicate by message passing with structured clone, so shared mutable state is not the default — `SharedArrayBuffer` is the opt-in exception.
