---
title: Streaming Responses in the UI
summary: Getting tokens from a model API onto the screen as they arrive, and the event model you are actually consuming.
level: core
minutes: 25
order: 1
tags: [ai, streaming, ui]

related:
  - frontend/ai-interfaces/chat-ui-architecture
  - frontend/browser-platform/files-blobs-and-streams
  - frontend/ai-interfaces/cancellation-and-abort

resources:
  - title: Streaming Messages
    url: https://platform.claude.com/docs/en/build-with-claude/streaming
    source: Anthropic
    type: docs
    minutes: 25
    primary: true
  - title: Streams API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
    source: MDN
    type: docs
    minutes: 30
  - title: AI SDK — Streaming
    url: https://ai-sdk.dev/docs/foundations/streaming
    source: Vercel
    type: docs
    minutes: 20
---

## In one line

A model response arrives as a sequence of server-sent events describing incremental deltas, and the UI's job is to accumulate them into state and render without re-laying-out the whole conversation on every token.

## What it is

The wire format is SSE. A response opens with `message_start` carrying metadata, then for each piece of content a `content_block_start`, a run of `content_block_delta` events, and a `content_block_stop`. A `message_delta` near the end carries the `stop_reason` and final usage, and `message_stop` closes it. Deltas are typed — `text_delta` for prose, `input_json_delta` for a tool call's arguments arriving piecewise, `thinking_delta` where reasoning is surfaced.

That structure matters because the UI is not consuming a string. It is consuming a description of *content blocks*, and a single response can contain several: some text, then a tool call, then more text. A renderer that concatenates every delta into one string will mangle the moment tool use appears.

**Never call a model provider directly from the browser.** The API key would be in the bundle. The architecture is browser → your server → provider, with your route handler returning a `ReadableStream` that proxies the provider's stream. That hop is also where you enforce auth, rate limits, and logging.

On the client, `response.body` is a `ReadableStream`; read it with a reader, decode with `TextDecoderStream`, and parse SSE frames — or use a library. The accumulation pattern that works is one piece of state per block, appended to, with the whole assistant message re-rendered from that state.

Two rendering problems are specific to this. **Re-render cost**: naively setting state per token re-renders the conversation dozens of times a second. Batch deltas into an animation frame, keep the streaming message in its own component so the rest of the list is untouched, and memoise completed messages. **Markdown mid-stream**: partial text contains unclosed code fences and half-written tables. Either parse incrementally with a tolerant renderer, or hold back the trailing incomplete block.

And scroll: users expect the view to follow the output, but hijacking scroll when they have deliberately scrolled up is infuriating. Track whether they are pinned to the bottom and only auto-scroll while they are.

## Why it matters

Streaming is the defining interaction of an AI product — it is what makes a ten-second response tolerable — and building it well is the single most likely practical-round task at these companies.

It also exercises real frontend skill: stream parsing, state accumulation, render batching, and scroll behaviour, all at once.

## Key points

- The stream is typed events describing content blocks, not a flat token string — a response can contain text and tool calls together.
- `message_delta` carries `stop_reason` and final usage; check it rather than assuming the text simply ended.
- Proxy through your own server: a key in the browser is a published key, and the proxy is where auth and limits live.
- `response.body` is a `ReadableStream` — decode and parse SSE frames, or use a library that does.
- Batch deltas per animation frame and isolate the streaming message so the whole conversation does not re-render per token.
- Partial markdown has unclosed fences — render tolerantly or withhold the trailing incomplete block.
- Auto-scroll only while the user is pinned to the bottom.
