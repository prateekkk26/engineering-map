---
title: Chat UI Architecture
summary: The state model behind a conversation surface — messages, streaming status, branching, and where the transcript actually lives.
level: core
minutes: 25
order: 2
tags: [ai, architecture, state]

related:
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - frontend/state-and-data/ui-state-machines
  - system-design/frontend-system-design/design-a-chat-application

resources:
  - title: Chatbot
    url: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
    source: Vercel
    type: docs
    minutes: 25
    primary: true
  - title: Messages API
    url: https://platform.claude.com/docs/en/api/messages
    source: Anthropic
    type: docs
    minutes: 25
  - title: Virtualizing long lists
    url: https://tanstack.com/virtual/latest/docs/introduction
    source: TanStack
    type: docs
    minutes: 20
---

## In one line

A chat UI is an append-only list of typed messages plus one streaming slot, and most of the difficulty is in what surrounds that: status, persistence, branching, and a list that grows without bound.

## What it is

Model the transcript as an ordered list of messages, each with a role, an id, a timestamp, and **content as an array of blocks** rather than a string. That last choice is what lets one assistant turn hold text, a tool call, a tool result, and more text — matching the API's own shape and avoiding a rewrite the first time you add tools.

The conversation has a status, and it deserves a union rather than booleans: `idle | submitting | streaming | error`. Each state enables different affordances — the composer is disabled while submitting, the stop button replaces send while streaming, a retry appears on error.

Persistence is the architectural fork. **Client-owned** transcripts (in memory, or in IndexedDB) are simple and private but do not survive a device change. **Server-owned** transcripts give history, sharing, and cross-device sync, at the cost of writes on every turn. The common shape is server-owned with an optimistic local append: the user's message renders instantly, the assistant's streams in, and both are persisted as they complete — so a refresh mid-stream does not lose the turn.

Two product features have outsized architectural cost, so decide early. **Editing a previous message** means the transcript is a tree, not a list — the edit forks a new branch and the old one must still be reachable. **Regenerate** is the same problem in miniature. Retrofitting either onto a flat array is a rewrite.

The list itself grows unboundedly. Long conversations need virtualisation, and virtualisation plus a streaming last item plus auto-scroll is a genuinely fiddly combination — the usual resolution is to render the streaming message outside the virtualised window.

Finally, the composer is not a text input. It needs multiline with Enter-to-send and Shift+Enter for newline, attachment handling, a stop control, and a disabled state that explains itself.

## Why it matters

"Build a chat interface against this API" is the most common practical round at AI-forward companies, and it is evaluated on the state model and the awkward states — not on whether tokens appear.

The persistence and branching decisions are exactly the trade-off questions a design round probes.

## Key points

- Model message content as an array of blocks, matching the API — a string field is the first thing tool use breaks.
- Give the conversation a status union rather than parallel booleans; the UI affordances follow from it.
- Choose client- versus server-owned transcripts deliberately; the common answer is server-owned with optimistic local append.
- Message editing and regeneration make the transcript a tree — design for it up front or accept a rewrite.
- Virtualise long transcripts, and keep the streaming message outside the virtualised window.
- The composer needs multiline, Enter-versus-Shift+Enter, attachments, a stop control, and explained disabled states.
