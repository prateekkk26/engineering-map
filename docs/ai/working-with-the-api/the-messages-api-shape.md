---
title: The Messages API Shape
summary: One stateless endpoint that takes a system prompt, an alternating message list, and a tool list, and returns typed content blocks with a stop reason.
level: core
minutes: 20
order: 1
tags: [llm, api, integration]

related:
  - ai/working-with-the-api/streaming-and-server-sent-events
  - ai/tool-use/what-function-calling-actually-is
  - ai/llm-foundations/tokens-and-context-windows

resources:
  - title: Messages API reference
    url: https://platform.claude.com/docs/en/api/messages
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Handling stop reasons
    url: https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons
    source: Anthropic
    type: docs
    minutes: 10
  - title: Errors
    url: https://platform.claude.com/docs/en/api/errors
    source: Anthropic
    type: docs
    minutes: 10
  - title: anthropic-sdk-typescript
    url: https://github.com/anthropics/anthropic-sdk-typescript
    source: Anthropic
    type: repo
---

## In one line

Everything — chat, extraction, tool use, vision, agents — goes through one `POST /v1/messages` call whose request is a message list and whose response is a list of typed content blocks plus a reason it stopped.

## What it is

The request has four parts that matter. **`model`** and **`max_tokens`** are required, and `max_tokens` caps output — including reasoning tokens on models where thinking is on — not the whole request. **`system`** is a separate top-level field, not a message; it is the stable instruction block and it is where you put things you want cached. **`messages`** is the conversation: alternating `user` and `assistant` roles, starting with `user`, where each `content` is either a plain string or an array of typed blocks (`text`, `image`, `document`, `tool_use`, `tool_result`). **`tools`** declares what the model may call.

The response is not a string. It is `content`, an array of blocks — some `text`, possibly `thinking`, possibly one or more `tool_use`. Code that reaches for `response.content[0].text` works until the day the first block is a thinking block or a refusal. Alongside it come `usage` (input, output, and cache token counts — this is your billing and telemetry source) and `stop_reason`, which is the actual control flow of your integration: `end_turn` means done, `tool_use` means execute and call back, `max_tokens` means you truncated it, `refusal` means content policy declined and `content` may be empty.

The endpoint is **stateless**. There is no session, no thread, no server-side history. Every request carries the entire conversation, which is why token cost grows with conversation length and why prompt caching exists.

Two integration habits separate a solid implementation from a fragile one. Use the official SDK rather than raw HTTP — retries with backoff, streaming accumulation, typed errors, and token counting are already there. And branch on `stop_reason` before touching `content`, every time.

Errors follow ordinary HTTP semantics: 400 for a malformed request (wrong role order, a removed parameter, a schema violation), 401/403 for auth, 429 for rate limits with a `retry-after`, 5xx and 529 for overload. The retryable set is 429 and 5xx; the rest are your bug.

## Why it matters

This is the surface you write against in the practical round, and the details are where candidates lose time: forgetting that `system` is not a message, assuming the response is text, or never handling `stop_reason: "tool_use"` and wondering why the tool never runs. Knowing the shape also makes the cost and latency conversation concrete, because `usage` and statelessness are right there in it.

## Key points

- One endpoint serves every use case; tools, images, and structured output are parameters on it, not separate APIs.
- `system` is a top-level field, not a message — it is the stable prefix, which makes it the natural cache boundary.
- Response `content` is an array of typed blocks. Always iterate and narrow by type; never index block zero and read `.text`.
- `stop_reason` is control flow: `tool_use` means loop, `max_tokens` means you truncated, `refusal` means handle it before reading content.
- The API is stateless — the full conversation is re-sent every turn, which is the root of both the cost curve and the need for caching and compaction.
- `usage` on every response is the source of truth for cost and cache-hit telemetry; log it from day one.
- Retry 429 and 5xx with backoff and jitter; 400 and 401 are bugs and must never be retried in a loop.
- Use the official SDK — retries, streaming, typed errors, and token counting are solved there and easy to get subtly wrong by hand.
