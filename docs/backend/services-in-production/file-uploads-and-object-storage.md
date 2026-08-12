---
title: File Uploads & Object Storage
summary: Getting bytes from a browser to a bucket without passing them through your service, and validating what actually arrived.
level: core
minutes: 25
order: 5
tags: [uploads, storage, security]

related:
  - backend/node-runtime/streams-and-backpressure
  - system-design/building-blocks/object-storage
  - backend/backend-security/injection-and-untrusted-input

resources:
  - title: Uploading objects with presigned URLs
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
    source: AWS
    type: docs
    minutes: 20
    primary: true
  - title: Multipart upload overview
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
    source: AWS
    type: docs
    minutes: 20
  - title: File Upload Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 20
---

## In one line

The upload should go straight from the browser to object storage using a short-lived presigned URL, with your service issuing permission before and recording the result after.

## What it is

Proxying uploads through your API is the obvious design and the wrong one at any size: it consumes a request slot for the duration of a slow mobile upload, it's bounded by your instance's memory or disk, and on serverless it hits body-size limits immediately. Instead, the client asks your API for permission; you check auth and quota and return a **presigned URL** — a time-limited, operation-limited, key-scoped credential for a single `PUT` — and the browser uploads directly. Constrain it: expiry in minutes, a content-length range, an enforced content type, and a key **you generate** (never a client-supplied filename, which is how you get path traversal and overwritten objects).

The upload finishing is not the same as your database knowing about it. Two ways to close the loop: the client calls a confirm endpoint, or the bucket emits an event that triggers a worker. The client callback is simpler and unreliable (tabs close); the storage event is authoritative. Many systems do both, with the row created upfront in a `pending` state and a sweeper deleting rows that never confirm — which is also how you clean up orphaned objects.

**Validate on the server, after arrival.** A `Content-Type` header is a claim by the client. Check the magic bytes, cap dimensions and page counts for anything you'll process, and remember that image and document parsers are a large attack surface — decompression bombs and malicious PDFs are real. Serve user content from a **separate domain** with `Content-Disposition: attachment` and a restrictive `Content-Security-Policy`, so an uploaded HTML file can't run as your origin. Strip EXIF from photos, which carries GPS coordinates users don't know they're publishing.

For **downloads**, the mirror image: presigned GET URLs, short-lived, generated after an authorization check — never a public bucket with unguessable names, which is authorization by obscurity. Large files use **multipart upload** with per-part retries and a lifecycle rule to abort incomplete uploads, which otherwise accumulate as invisible storage cost.

## Why it matters

Uploads appear in a large share of practical rounds, and the presigned-URL pattern is the expected answer — proxying bytes through the API reads as inexperience. The security half (server-side type validation, separate serving origin) is where the follow-ups go, because uploaded files are user-controlled content executing inside your product.

## Key points

- Presigned URLs let the browser upload straight to storage, keeping bytes out of your request path.
- Constrain the presign: short expiry, size range, content type, and a server-generated key.
- Never trust a client-supplied filename — sanitise or replace it, or you get traversal and collisions.
- Track upload state explicitly (`pending` → `ready`) and reconcile with storage events; client callbacks get lost.
- Verify file type from magic bytes on the server; the `Content-Type` header is an assertion, not evidence.
- Serve user content from a separate domain with `attachment` disposition so it can't execute as your origin.
- Strip EXIF metadata, which leaks location data the uploader didn't intend to share.
- Use multipart upload for large files, plus a lifecycle rule to abort abandoned ones.
