---
title: Files, Blobs & Streams
summary: Getting bytes in and out of the browser — uploads, downloads, object URLs, and why streaming beats buffering.
level: core
minutes: 20
order: 17
tags: [browser, files, streams]

related:
  - system-design/frontend-system-design/design-a-file-uploader
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - frontend/browser-platform/web-workers-and-off-main-thread

resources:
  - title: File API
    url: https://developer.mozilla.org/en-US/docs/Web/API/File_API
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Streams API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
    source: MDN
    type: docs
    minutes: 30
  - title: File System Access API
    url: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
    source: MDN
    type: docs
    minutes: 25
---

## In one line

A `File` is a `Blob` with a name, an object URL is a pointer to one that you must revoke, and streams let you process bytes as they arrive instead of holding the whole payload in memory.

## What it is

Files enter through `<input type="file">`, drag and drop (`dataTransfer.files`), the clipboard, or the File System Access API where supported. What you get is a `File` — a `Blob` plus `name` and `lastModified`. A `Blob` is just immutable bytes with a MIME type, and `slice()` on one is how chunked and resumable uploads are built.

`URL.createObjectURL(blob)` produces a `blob:` URL usable as an `img` src or a download href. It holds the blob in memory until `URL.revokeObjectURL()` is called, and forgetting that is a straightforward memory leak — noticeable fast in an app that previews images. `FileReader` and the newer promise-based `blob.text()`, `blob.arrayBuffer()` read contents; data URLs are convenient for tiny assets and wasteful for anything larger, since base64 adds a third to the size.

**Streams** are the part worth internalising. `response.body` is a `ReadableStream`, so you can process a response progressively: render tokens as they arrive from a model API, parse NDJSON line by line, or compute a hash over a large file without loading it into memory. `TransformStream` composes steps in a pipeline, and `pipeThrough`/`pipeTo` connect them. Uploads can stream too, though that requires HTTP/2 and server support.

For uploads at size, the pattern that survives contact with reality is: slice the file into chunks, upload each with retry, track progress per chunk, and let the server reassemble — so a dropped connection costs one chunk rather than the whole file. Direct-to-storage uploads with a presigned URL take your server out of the data path entirely.

Two constraints. Progress on upload needs `XMLHttpRequest` or a streaming request; `fetch` still has no upload progress event in most browsers. And a large file read on the main thread will block it — decode, hash, and transform in a worker.

## Why it matters

"Design a file uploader" is a standard frontend system design prompt, and chunking, retry, and progress are exactly what it is probing.

Streaming is also the mechanism behind every LLM chat UI, so the Streams API has become core rather than niche knowledge.

## Key points

- `File` extends `Blob`; `blob.slice()` is the basis of chunked and resumable uploads.
- Object URLs must be revoked or they leak the underlying blob for the page's lifetime.
- Data URLs inflate size by roughly a third — fine for icons, wrong for user uploads.
- `response.body` is a `ReadableStream`, which is how token-by-token rendering and progressive parsing work.
- Chunk large uploads with per-chunk retry so a dropped connection does not restart everything.
- Presigned direct-to-storage uploads keep large files out of your application server.
- `fetch` lacks upload progress in most browsers, and large reads belong in a worker.
