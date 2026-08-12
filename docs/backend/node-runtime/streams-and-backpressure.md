---
title: Streams & Backpressure
summary: Processing data you never hold in memory all at once, and the mechanism that stops a fast producer drowning a slow consumer.
level: core
minutes: 25
order: 2
tags: [node, streams, memory, performance]

related:
  - backend/realtime/proxying-an-llm-stream
  - backend/services-in-production/file-uploads-and-object-storage
  - backend/node-runtime/memory-and-leaks-in-node

resources:
  - title: Stream
    url: https://nodejs.org/api/stream.html
    source: Node.js
    type: docs
    minutes: 40
  - title: Backpressuring in Streams
    url: https://nodejs.org/en/learn/modules/backpressuring-in-streams
    source: Node.js
    type: docs
    minutes: 25
    primary: true
  - title: Streams API concepts
    url: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts
    source: MDN
    type: docs
    minutes: 20
---

## In one line

A stream processes data in chunks with bounded memory, and backpressure is the feedback that makes the producer slow down instead of the buffer growing until the process dies.

## What it is

Reading a 2GB export with `fs.readFile` allocates 2GB; piping it through a stream allocates a **high-water mark** — 64KB by default — regardless of file size. That is the whole argument: memory becomes a function of concurrency, not of payload size, which is what lets one small instance serve large uploads, downloads, exports and proxied responses.

**Backpressure** is the part people skip. `writable.write()` returns `false` when its internal buffer is above the high-water mark. If you ignore that return value and keep writing, Node keeps buffering — memory climbs, and eventually the process is OOM-killed by a payload it "streamed". Handling it correctly means stopping on `false` and resuming on `'drain'`, which is exactly what `pipe()` and `pipeline()` do for you. **Use `stream.pipeline()`** (or its promise form) rather than `.pipe()`: `pipe` does not propagate errors or destroy the remaining streams on failure, which is how sockets and file descriptors leak.

The canonical example is a proxy between a fast source and a slow destination: read from object storage, write to an HTTP response over a mobile connection. Without backpressure the whole object lands in memory; with it, the read pauses whenever the socket is full.

Node now has **two stream systems**, and knowing which you're in matters. Node streams (`Readable`, `Writable`, `Transform`) are the ecosystem default. Web Streams (`ReadableStream`, `TransformStream`) are the standard used by `fetch`, edge runtimes, and Next.js route handlers — same concepts, different API, and `Readable.fromWeb`/`toWeb` bridges them. Async iteration (`for await (const chunk of readable)`) is the most readable way to consume either, and it applies backpressure naturally because the loop doesn't request the next chunk until the body finishes.

Two practical notes: a chunk boundary is not a message boundary, so anything line- or JSON-delimited needs a transform that buffers partial data; and streaming makes error handling harder because the status code was already sent — once headers are out, a mid-stream failure can only be signalled in-band or by destroying the connection.

## Why it matters

Every AI product streams model output, every product with files streams uploads, and the classic "our service OOMs under load" postmortem is usually a buffered stream. Being able to explain why `pipeline()` beats `pipe()` and what `write()`'s return value means is a concrete, checkable senior signal.

## Key points

- Streams bound memory to the high-water mark, so cost scales with concurrency rather than payload size.
- `write()` returning `false` is the backpressure signal; ignoring it converts a stream into an unbounded buffer.
- `pipeline()` propagates errors and destroys streams on failure — `pipe()` leaks on error.
- `for await...of` gives you backpressure for free, because the next chunk is only requested when you're ready.
- Node streams and Web Streams coexist; edge runtimes and `fetch` use the latter, and adapters bridge them.
- Chunk boundaries are arbitrary — line-delimited protocols need a buffering transform.
- Once headers are sent you can't change the status code, so mid-stream errors need an in-band convention.
