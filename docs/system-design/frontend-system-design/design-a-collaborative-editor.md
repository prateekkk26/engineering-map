---
title: Design a Collaborative Editor
summary: Two people typing in one document — why last-write-wins fails, what OT and CRDTs each cost, and the parts you can actually build in 45 minutes.
level: core
minutes: 30
order: 11
tags: [frontend-system-design, design-problem, realtime, collaboration]

related:
  - frontend/state-and-data/realtime-state-sync
  - frontend/state-and-data/offline-and-local-first
  - system-design/distributed-systems/consistency-models
  - system-design/frontend-system-design/design-a-chat-application

resources:
  - title: Yjs — Shared Types and CRDT Internals
    url: https://docs.yjs.dev/
    source: Yjs
    type: docs
    minutes: 30
    primary: true
  - title: Operational Transformation — What Google Docs Uses
    url: https://drive.googleblog.com/2010/09/whats-different-about-new-google-docs.html
    source: Google
    type: article
    minutes: 15
  - title: Local-First Software
    url: https://www.inkandswitch.com/local-first/
    source: Ink & Switch
    type: article
    minutes: 60
---

## In one line

Concurrent edits to shared text can't be resolved by sending the whole document — you send intent-preserving operations, and the algorithm you pick decides who has to run a server.

## What it is

**Requirements first, and scope hard.** Plain text, rich text, or structured (a canvas, a spreadsheet)? How many concurrent editors — 3 or 300? Does it need offline editing? Is there history and undo? Presence and cursors? Comments? Rich text is dramatically harder than plain text, and saying so is a point in your favour, not an evasion.

**Why the naive approach fails.** Sending the full document on every change is O(document) per keystroke and last-write-wins means one person's paragraph silently vanishes. Sending diffs isn't enough either: two edits at different offsets, applied in different orders on different clients, produce different documents. The requirement is **convergence** — everyone ends at the same state regardless of arrival order — plus intent preservation.

**OT vs CRDT — have a position.** *Operational Transformation* transmits operations (`insert(5,"a")`) and transforms each against concurrent ones so offsets stay correct. Compact on the wire, but the transform functions are notoriously hard to get right and it effectively requires a central server to sequence operations. *CRDTs* give each character a unique, ordered identifier so merges are commutative and need no coordination — peer-to-peer and offline work fall out for free, at the cost of metadata overhead (tombstones for deletions, which need compaction). Practical answer for an interview: **CRDT via a mature library (Yjs, Automerge) unless you're Google**, because the failure mode of a hand-rolled OT implementation is silent divergence you find in production.

**The client architecture.** Local edits apply to the local document immediately — latency must be zero, this is typing. Operations go into an outbound queue, get sent over a WebSocket, and remote operations are applied to the same document. Keep a persistent local copy (IndexedDB) so a refresh or an offline period doesn't lose work; on reconnect, exchange state vectors and sync only the delta. The server is a relay plus a persistence and snapshot point — periodically compact the op log into a snapshot, or new clients replay the entire history to load.

**Presence is a separate channel.** Cursors, selections and avatars are ephemeral, high-frequency and don't belong in the document history — send them as unversioned awareness messages, throttled (~50–100ms), and expire them on disconnect. Mapping a remote cursor position through your local edits is real work: store it as a CRDT-relative position, not an index.

**Undo must be local.** Ctrl+Z should undo *your* last change, not whoever typed most recently, which means a per-client undo stack over your own operations rather than a global one.

**Optimisations and edge cases.** Batch operations per animation frame instead of per keypress. Cap document size and warn. Handle a client that's been offline for a week (large delta, or force a reload). Show connection state honestly — "reconnecting", "all changes saved" — because trust in a collaborative editor is the product.

**Accessibility.** Remote cursors and live edits are hostile to screen readers; announce collaborator joins and significant changes politely, not every character, and never move focus in response to a remote edit.

## Why it matters

It's the hardest of the standard frontend prompts and the one where interviewers are testing whether you can reason about consistency at all rather than expecting an implementation. Naming convergence as the requirement, giving the OT/CRDT tradeoff cleanly, and then *scoping down* to what's buildable is the whole exercise.

## Key points

- Last-write-wins on a whole document silently destroys concurrent work; the requirement is convergence plus intent preservation.
- OT transmits transformed operations and needs a central sequencer; CRDTs merge commutatively and enable offline and P2P at the cost of metadata.
- Recommend a battle-tested CRDT library — a hand-rolled OT implementation diverges silently in production.
- Apply local edits optimistically and immediately; typing latency cannot wait on a round trip.
- Persist the document locally in IndexedDB and sync deltas via state vectors on reconnect.
- Snapshot and compact the operation log, or new clients pay full history replay on load.
- Presence and cursors ride a separate ephemeral, throttled channel and are never part of document history.
- Store remote cursor positions relative to CRDT identifiers, not integer offsets.
- Undo is per-client over your own operations, never a global stack.
- Announce collaborator activity politely and never move focus in response to a remote edit.
