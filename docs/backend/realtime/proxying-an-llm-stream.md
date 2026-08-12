---
title: Proxying an LLM Stream
summary: The backend every AI product has — relaying provider tokens to the browser while keeping the key, the abort, the cost, and the transcript.
level: core
minutes: 25
order: 4
tags: [ai, streaming, realtime, architecture]

related:
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - frontend/ai-interfaces/cancellation-and-abort
  - ai/working-with-the-api/streaming-and-server-sent-events

resources:
  - title: Streaming messages
    url: https://docs.claude.com/en/docs/build-with-claude/streaming
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: AI SDK — streaming
    url: https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data
    source: Vercel
    type: docs
    minutes: 20
  - title: AbortSignal
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
    source: MDN
    type: docs
    minutes: 10
---

## In one line

Your server sits between the browser and the model provider, and it exists because the API key, the authorization check, the cost accounting and the transcript all have to live somewhere the client can't reach.

## What it is

The naive version is a pipe: open a streaming request to the provider, forward each chunk to the client as SSE. Four things make the real version harder.

**Abort has to propagate the whole way.** The user hits stop, the browser aborts the `fetch`, your handler must notice (`request.signal`) and abort the provider call via the SDK's `AbortSignal`. Miss the second half and generation continues — you keep paying for tokens nobody will see. This is the single most common bug in AI proxies, and it's invisible until the bill arrives.

**A disconnect must not lose the work.** If the client drops mid-response, you still want the partial assistant message persisted; otherwise a refresh shows a conversation missing its last turn. So the proxy accumulates the text as it forwards it and writes on completion *or* on disconnect — which means the persistence path can't be a `.then()` hanging off a response the client already abandoned.

**The stream is not just text.** Real chat surfaces need tool calls, citations, usage, and errors interleaved. Define your own event types (`event: text-delta`, `event: tool-call`, `event: usage`, `event: error`) rather than forwarding the provider's raw format — that decouples your client from the vendor and lets you swap models without touching the frontend.

**Errors after the first byte are the awkward case.** The status code is already `200`, so a mid-stream provider failure can only be reported as an in-band error event the client knows how to render. Design that event before you need it.

Everything else is discipline: authenticate and authorise before you open the upstream call; enforce per-user rate limits and token quotas *before* spending; record model, tokens and latency when the stream ends; and never let the provider's key or system prompt cross to the client. On serverless, check the platform's maximum response duration — a long generation can exceed it, which is one of the main reasons to run this on a long-lived server or an edge runtime that supports streaming.

## Why it matters

This is the single most representative backend task at the companies these loops hire for — a common take-home, and the thing the practical round most often builds. Cancellation propagation and mid-stream error handling are precisely the follow-ups that distinguish someone who has shipped this from someone who has read about it.

## Key points

- The proxy exists to keep the API key, the auth check and the cost accounting off the client.
- Propagate the client's abort into the provider request, or cancellation only stops the UI, not the spend.
- Persist the partial response on disconnect; work already paid for shouldn't vanish on a refresh.
- Define your own event schema over the provider's, so switching models doesn't break the frontend.
- After the first byte the status is fixed — mid-stream failures need an in-band error event.
- Check quotas and rate limits before opening the upstream stream, not after.
- Record tokens, model and latency at stream end for billing, quotas and evals.
- Serverless response-duration limits can truncate long generations; verify the ceiling for your runtime.
