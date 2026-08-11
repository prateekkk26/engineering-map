---
title: Object Storage & Large Blobs
summary: Files belong in S3 with a row pointing at them — and the upload should never pass through your server.
level: core
minutes: 20
order: 5
tags: [data, storage, files]

related:
  - system-design/frontend-system-design/design-a-file-uploader
  - data/schema-design-and-migrations/designing-a-schema-for-a-feature
  - frontend/tooling/cdn-and-edge-delivery

resources:
  - title: Uploading objects with presigned URLs
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
    source: AWS
    type: docs
    minutes: 20
    primary: true
  - title: S3 storage classes
    url: https://aws.amazon.com/s3/storage-classes/
    source: AWS
    type: docs
    minutes: 15
  - title: Multipart upload overview
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
    source: AWS
    type: docs
    minutes: 15
---

## In one line

Object storage holds the bytes cheaply and durably; the database holds a row describing them, and the two must be reconciled because there is no transaction across both.

## What it is

An object store is a flat namespace of immutable-ish blobs with metadata, addressed by key, served over HTTP, at roughly a hundredth the cost of database storage and effectively unlimited in size. Keys look hierarchical but aren't; there are no directories.

**Don't put files in the database.** A large `bytea` column bloats the table, wrecks backup and restore times, blows up memory on every query that forgets to exclude it, and makes replication expensive. Store the key, the content type, the size, a checksum, and the owning entity.

**Don't proxy uploads through your API either.** A **presigned URL** lets the client PUT directly to the bucket with a short-lived, scope-limited credential your server generates — no bandwidth through your service, no request-size limits, no blocked worker for the duration of a 500MB upload. Use presigned GETs for private downloads, with an expiry. Large files use multipart upload so a failure resumes rather than restarts.

**The reconciliation problem is the interesting part.** Two writes — an object and a row — with no shared transaction, so any failure leaves them inconsistent. The workable pattern: create a `pending` row first, hand out the presigned URL, and mark it `ready` when the client confirms or when a bucket event notification arrives. Orphan objects are then cleaned by a sweeper over old `pending` rows, and orphan rows never happen because the row comes first. Deletion runs the other way: delete the row, queue the object deletion, tolerate retries.

The rest is policy. **Never trust the client's content type or filename** — sniff, constrain by extension, and serve user content from a separate origin so a malicious upload can't run as your site. **Versioning and lifecycle rules** move old objects to cheaper classes and delete what expires. **Egress costs** are the line item that surprises people, which is why a CDN sits in front of anything public. And **immutability plus a content hash in the key** makes caching trivial and makes an overwrite impossible to get wrong.

## Why it matters

File upload is one of the standard frontend system design prompts, and presigned direct upload plus the pending/ready state machine is the expected answer. Getting it wrong in production means either a memory-exhausting API or a bucket full of orphaned files nobody can attribute.

## Key points

- Files belong in object storage; the database holds a row with the key, size, type and checksum.
- Presigned URLs let clients upload and download directly, keeping bandwidth and long-lived requests out of your API.
- Multipart upload makes large transfers resumable instead of all-or-nothing.
- There is no transaction spanning the bucket and the database — use a pending row, confirm on completion, and sweep orphans.
- Create the row before the object so failures leave orphaned bytes, which are cheap, rather than dangling references.
- Never trust client-supplied content types or filenames, and serve user content from a separate origin.
- Content-hash keys make objects immutable and cacheable forever; lifecycle rules control the storage bill.
