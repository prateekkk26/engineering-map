---
title: Streaming & Server-Sent Events
summary: Why every serious LLM feature streams, what the event sequence actually looks like, and the plumbing problems that appear the moment you put a server in the middle.
level: core
minutes: 25
order: 2
tags: [llm, api, streaming, integration]

related:
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - ai/working-with-the-api/the-messages-api-shape
  - ai/observability-and-cost/latency-budgets

resources:
  - title: Streaming Messages
    url: https://platform.claude.com/docs/en/build-with-claude/streaming
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Using server-sent events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    source: MDN
    type: docs
    minutes: 15
  - title: Streaming API responses
    url: https://platform.openai.com/docs/guides/streaming-responses
    source: OpenAI
    type: docs
    minutes: 15
---

## In one line

Set `stream: true` and the response arrives as a sequence of server-sent events describing content blocks being opened, appended to, and closed — which turns a thirty-second wait into a two-hundred-millisecond one.

## What it is

Generation is sequential, so a long answer takes as long as it takes. Streaming does not make it faster; it makes the wait *legible*, and the difference between first token at 300ms and a blank screen for twenty seconds is the difference between a usable feature and an abandoned one. There is also a hard reason: large non-streaming requests hit HTTP timeouts, so above a fairly modest `max_tokens` streaming is the only option that works.

The event sequence is a state machine, not a text firehose. `message_start` carries metadata and initial usage. Then, per block, `content_block_start` (announcing its type — text, thinking, tool_use), a run of `content_block_delta` events, and `content_block_stop`. Finally `message_delta` carries `stop_reason` and final output token counts, and `message_stop` ends it. Deltas are typed too: `text_delta` for prose, `thinking_delta` for reasoning, `input_json_delta` for a tool call's arguments streaming in as partial JSON.

The practical consequences: you cannot parse tool arguments until the block closes, because JSON arrives in fragments. The final token counts live in `message_delta`, not in the first event, so cost telemetry has to be collected at the end. And a stream that dies mid-flight leaves you with partial content and no `stop_reason` — you have to decide whether to keep the partial, and you are billed for what was generated either way.

Then there is the middle tier. You almost never stream from the browser directly to the provider, because that would expose your API key, so your server proxies. That means re-emitting the stream to the client, and the pitfalls are consistent: buffering proxies and compression middleware that hold the response until it completes, serverless platforms with response timeouts shorter than the generation, and client disconnects that must actually abort the upstream request or you keep paying for tokens nobody will see. Framework abstractions over this — Server Actions, streamed React components, purpose-built SDK helpers — hide most of it, but knowing the layer underneath is what lets you debug the day nothing appears until the very end.

## Why it matters

The AI-company take-home is very often "build a streaming chat UI", and streaming is where it goes wrong. It is also the highest-leverage perceived-performance decision in the entire product: nothing else you do to a slow model changes the experience as much. In interviews the follow-up is always cancellation and error handling mid-stream, which is precisely where a proxy that ignores client aborts shows up.

## Key points

- Streaming does not reduce total generation time; it collapses perceived latency to time-to-first-token, which is the number users feel.
- Above a moderate `max_tokens`, streaming is mandatory rather than optional — non-streaming requests hit HTTP timeouts.
- The protocol is a block state machine: `content_block_start` / `delta` / `stop` per block, with typed deltas for text, thinking, and tool input.
- Tool arguments stream as partial JSON fragments — accumulate and parse only after `content_block_stop`.
- Final `stop_reason` and output token counts arrive in `message_delta` at the end, so usage telemetry is collected on completion, not on the first chunk.
- Never stream from browser to provider directly — the API key would be exposed. Proxy through your server and re-emit.
- A client disconnect must abort the upstream call; otherwise you pay for tokens nobody receives.
- Buffering reverse proxies, compression middleware, and serverless response timeouts are the three usual causes of "the whole answer appears at once".
