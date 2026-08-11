---
title: Object Storage
summary: S3-class storage as a design primitive — cheap, effectively infinite, immutable-ish blobs that never belong in your database.
level: core
minutes: 15
order: 6
tags: [storage, infrastructure, cost]

related:
  - data/choosing-a-datastore/object-storage-and-large-blobs
  - system-design/classic-problems/design-a-file-storage-service
  - system-design/building-blocks/cdn-and-edge-delivery

resources:
  - title: Amazon S3 — How It Works
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html
    source: AWS
    type: docs
    minutes: 20
    primary: true
  - title: Uploading Objects Using Presigned URLs
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
    source: AWS
    type: docs
    minutes: 15
  - title: Building and Operating a Pretty Big Storage System (S3)
    url: https://www.allthingsdistributed.com/2023/07/building-and-operating-a-pretty-big-storage-system.html
    source: Werner Vogels
    type: article
    minutes: 30
---

## In one line

Object storage holds blobs by key with effectively unlimited capacity and very high durability, at a price per gigabyte that no database can approach.

## What it is

A flat key-to-blob store with HTTP access. No hierarchy despite the slashes in keys, no partial updates — you replace an object, you don't edit it — and no query capability beyond listing by prefix. In exchange: eleven nines of durability, capacity you never provision, and storage costs one to two orders of magnitude below block storage attached to a database.

**The design rules.**

*Blobs go here, metadata goes in the database.* The row holds the key, size, content type, owner, and status; the bytes live in the bucket. Storing images as `bytea` in Postgres bloats backups, thrashes the buffer cache, and makes every restore slower. This comes up constantly and the right answer is always the same.

*Clients talk to the bucket directly, via presigned URLs.* Your API issues a short-lived signed URL and the client uploads straight to storage. Nothing large ever flows through your application servers, which otherwise become a bandwidth bottleneck for no reason. Downloads work the same way for private content.

*The two-phase problem.* If the client uploads directly, your database never sees the write. The standard shape: create a `pending` row and hand out the URL, then confirm — either the client calls back, or the bucket emits an event that your service consumes. Sweep abandoned `pending` rows on a schedule. Interviewers reach for this one often.

*Large uploads use multipart*, which gives you parallelism and resumability from a failed part rather than restarting a 4GB upload.

**Cost and lifecycle.** Storage classes trade retrieval latency and cost against storage price — hot, infrequent-access, archive. Lifecycle rules move objects between them automatically. **Egress is the line item that surprises people**: serving media directly from the bucket to users is far more expensive than serving it through a CDN, which is a design-level argument, not an ops detail.

**Consistency.** Modern S3 is strongly read-after-write consistent for new objects and overwrites; listing can still lag. Don't build a design that depends on `LIST` being immediately accurate.

## Why it matters

Any design touching images, video, documents, backups, logs or model artefacts has an object store in it, and the interviewer is checking whether you know to keep bytes out of the database and traffic off your servers. Presigned uploads plus a pending-row reconciliation is a small pattern that answers a surprising number of follow-ups.

## Key points

- Blobs in object storage, metadata rows in the database — never the bytes in the database.
- Presigned URLs let clients upload and download directly, keeping large payloads off your servers.
- Direct upload means your database doesn't see the write: use a pending row plus a confirm callback or bucket event.
- Sweep abandoned pending uploads on a schedule or they accumulate forever.
- Multipart upload gives parallelism and resumes from a failed part instead of the whole file.
- Lifecycle rules to colder storage classes are the main cost lever; egress is the surprise line item.
- Put a CDN in front for anything served repeatedly — cheaper and much faster than serving from the bucket.
