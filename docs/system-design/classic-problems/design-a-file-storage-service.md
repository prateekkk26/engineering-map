---
title: Design a File Storage Service
summary: Dropbox-shaped — chunked uploads, deduplication, metadata versus blobs, and syncing changes to multiple devices without losing data.
level: core
minutes: 25
order: 6
tags: [system-design, classic-problem, storage]

related:
  - system-design/building-blocks/object-storage
  - system-design/frontend-system-design/design-a-file-uploader
  - system-design/distributed-systems/consistency-models

resources:
  - title: Streaming File Synchronization
    url: https://dropbox.tech/infrastructure/streaming-file-synchronization
    source: Dropbox Engineering
    type: article
    minutes: 25
    primary: true
  - title: Rethinking Sync — Dropbox's Nucleus
    url: https://dropbox.tech/infrastructure/rewriting-the-heart-of-our-sync-engine
    source: Dropbox Engineering
    type: article
    minutes: 35
  - title: Uploading Objects Using Multipart Upload
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
    source: AWS
    type: docs
    minutes: 20
---

## In one line

Split files into content-addressed chunks, store the chunks in object storage and the tree in a database, and sync by exchanging the list of chunks each device is missing.

## What it is

**Scope.** Upload, download, folder structure, sync across devices, sharing, version history. Park real-time collaborative editing — that's a different problem (`design-a-collaborative-editor`).

**The split that defines the design: metadata versus blobs.** A relational database holds users, files, folders, versions, permissions and the chunk list per version — small, transactional, queryable. Object storage holds the bytes. Never the other way round.

**Chunking.** Split each file into blocks (~4MB) and identify each by the hash of its content. This buys you four things at once: resumable uploads (retry the failed chunk only), parallel transfer, **deduplication** (identical chunk already stored? just reference it — enormous savings when a hundred people have the same PDF), and **delta sync** (edit one page of a large document and only the changed chunks move). Variable-size, content-defined chunking (Rabin fingerprinting) is worth naming: with fixed offsets, inserting a byte at the start shifts every subsequent boundary and nothing dedupes.

**Upload flow.** Client hashes chunks → asks the server which it already has → uploads only the missing ones via presigned URLs directly to object storage → commits a new file version referencing the full chunk list. The commit is the single transactional moment; everything before it is idempotent and retryable.

**Sync.** Each user (or namespace) has a monotonically increasing **cursor**. A device says "give me everything after cursor N" and receives changed file metadata; it then fetches the chunks it lacks. Long-polling or a notification channel tells idle devices to check. This is the same mechanism as chat's sequence numbers, and it's the right answer for the same reason: one number covers reconnection, multi-device and restart.

**Conflicts.** Two devices edit while one is offline. Without operational transforms, the honest and standard resolution is to **keep both** — the losing version becomes "file (conflicted copy from Prateek's laptop)". Say plainly that silently discarding a user's edit is never acceptable, and that last-write-wins on files means data loss.

**Sharing and permissions.** Permissions live on the folder tree with inheritance; the check happens when the download URL is issued, and the presigned URL is short-lived so revoking access actually revokes it. Shared folders appearing in two users' trees means the namespace, not the user, is the unit that carries a cursor.

**Storage economics.** Deduplicate globally or per user — global saves far more and has a cross-user information-leak subtlety (upload timing can reveal whether a chunk already existed). Cold versions go to archival storage on a lifecycle rule; version history needs a retention policy or it grows without bound.

## Why it matters

It's the cleanest problem for showing you know where blobs belong versus where metadata belongs, and content-addressed chunking is one of those ideas that answers four follow-ups at once. The conflict question is also a good honesty test — the correct answer is a product decision (keep both) rather than a clever algorithm.

## Key points

- Metadata in a relational database, bytes in object storage — the split drives everything else.
- Content-hash chunks give resumability, parallelism, deduplication and delta sync from one mechanism.
- Content-defined chunk boundaries survive insertions; fixed-size boundaries don't dedupe after an edit.
- Clients upload only chunks the server doesn't have, straight to object storage via presigned URLs.
- Committing a new version referencing a chunk list is the single transactional step.
- A per-namespace monotonic cursor makes sync, reconnect and multi-device one mechanism.
- Resolve offline conflicts by keeping both versions; last-write-wins on files is data loss.
- Issue short-lived presigned URLs so revoked shares actually stop working.
- Version history and cold data need lifecycle and retention policies or storage grows forever.
