---
title: Design a File Uploader
summary: Chunked, resumable uploads straight to object storage — with presigned URLs, concurrency limits, progress, and retries that survive a lift ride.
level: core
minutes: 30
order: 8
tags: [frontend-system-design, design-problem, uploads]

related:
  - frontend/browser-platform/files-blobs-and-streams
  - system-design/building-blocks/object-storage
  - system-design/classic-problems/design-a-file-storage-service
  - frontend/browser-platform/web-workers-and-off-main-thread

resources:
  - title: Amazon S3 Multipart Upload Overview
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
    source: AWS
    type: docs
    minutes: 25
    primary: true
  - title: File and Directory Entries / File API
    url: https://developer.mozilla.org/en-US/docs/Web/API/File_API
    source: MDN
    type: docs
    minutes: 15
  - title: tus — Resumable Upload Protocol
    url: https://tus.io/protocols/resumable-upload
    source: tus
    type: docs
    minutes: 20
---

## In one line

Never send a large file through your API server, and never send it as one request you can't resume.

## What it is

**Requirements.** Max file size, allowed types, single or multiple, folder upload, drag-and-drop, mobile camera capture, does the file need processing (transcode, thumbnail, virus scan), and does the user need to see it immediately after upload. Ask the size ceiling first — 2MB avatars and 4GB videos are different designs.

**The transfer path.** The client asks your API for a **presigned URL**, then `PUT`s the bytes directly to object storage. Your server never proxies the payload: it stays small, cheap and unblocked, and the upload gets the storage provider's edge. The server records the intent (`uploadId`, owner, expected size/type) before issuing the URL, and the client — or better, a storage event webhook — confirms completion. Trust the webhook over the client for marking a file ready; a client can lie or die mid-flight.

**Chunking and resumability.** Split with `Blob.slice()` into fixed chunks (5–10MB is the usual band; S3 multipart requires ≥5MB for non-final parts). Upload N chunks in parallel — 3 to 6 — and cap it, because unbounded concurrency saturates the uplink and makes every chunk slow and timeout-prone. Track completed part numbers and their ETags; on resume, ask the server which parts exist and send only the rest. Persist that manifest (IndexedDB) so a tab close doesn't cost the whole file. Complete the multipart upload with the ordered part list.

**Retries.** Per-chunk, exponential backoff with jitter, a cap on attempts, and — critically — a chunk retry doesn't restart the file. Handle the presigned URL expiring mid-upload by re-requesting one. Detect offline with the `online`/`offline` events and pause rather than burning retries.

**Progress.** Real progress needs upload events: `XMLHttpRequest.upload.onprogress` still works here, or `fetch` with a `ReadableStream` body where supported. Aggregate per-chunk bytes into an overall percentage, and smooth the estimate — a jumping ETA reads as broken. Show per-file and total progress for multi-file, with per-file cancel.

**Validation and safety.** Check size and extension on the client for fast feedback, but treat it as UX only: the server validates content type by sniffing magic bytes, enforces size via the presigned policy, and scans. Never render an uploaded filename as HTML, and serve user content from a separate origin so a malicious file can't run in your origin's context.

**Client-side work worth doing.** Downscale or compress images before upload — often a 10x saving and the single biggest perceived improvement. Hash the file to dedupe and skip an upload that already exists. Do both in a worker; hashing a large file on the main thread freezes the UI.

**UX and a11y.** A drop zone is a progressive enhancement — there must be a real `<input type="file">` behind it, keyboard reachable. Announce state changes in a live region. Warn on navigating away with uploads in flight.

## Why it matters

It's the prompt that tests whether you know the browser's file and network APIs rather than just React, and it maps directly onto real work at any company handling user media. Presigned direct-to-storage and per-chunk resumability are the two answers the interviewer is waiting for; going through your own API server is the answer that ends the round early.

## Key points

- Upload directly to object storage with a presigned URL; proxying large files through your API is the mistake this prompt is built to catch.
- Mark a file ready from a storage webhook, not from the client's word.
- Chunk with `Blob.slice()`, upload 3–6 parts concurrently, and cap concurrency — saturating the uplink makes everything time out.
- Persist the part manifest to IndexedDB so an upload survives a tab close or a lost connection.
- Retry per chunk with backoff and jitter; a failed chunk must never restart the whole file.
- Handle presigned URL expiry mid-upload by requesting a fresh one.
- Client-side type and size checks are UX; the server sniffs magic bytes and enforces limits.
- Compress images and hash for dedupe in a worker — hashing on the main thread freezes the page.
- Serve user-uploaded content from a separate origin so it can't execute in yours.
- Keep a real file input behind any drag-and-drop zone and announce progress in a live region.
