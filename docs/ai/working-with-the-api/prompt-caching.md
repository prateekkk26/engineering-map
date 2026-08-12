---
title: Prompt Caching
summary: Reusing the processed prefix of a prompt across requests for roughly a tenth of the price — and the byte-level rule that decides whether it works at all.
level: core
minutes: 20
order: 5
tags: [llm, api, cost, caching, performance]

related:
  - ai/working-with-the-api/token-accounting-and-cost
  - ai/observability-and-cost/caching-strategies-for-llm-apps
  - _shared/caching

resources:
  - title: Prompt caching
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
    source: Anthropic
    type: docs
    minutes: 25
    primary: true
  - title: Prompt caching
    url: https://platform.openai.com/docs/guides/prompt-caching
    source: OpenAI
    type: docs
    minutes: 10
  - title: Pricing
    url: https://platform.claude.com/docs/en/about-claude/pricing
    source: Anthropic
    type: docs
    minutes: 10
---

## In one line

Mark a stable prefix of the prompt as cacheable and subsequent requests that share it byte-for-byte reuse the processed state, cutting input cost by around 90% and time-to-first-token substantially.

## What it is

The invariant everything follows from: **caching is a prefix match**. The provider renders your request in a fixed order — tools, then system, then messages — and hashes it up to each cache breakpoint. Any byte that changes anywhere before that point invalidates the cache from that byte onward. One interpolated timestamp at the top of the system prompt makes the entire request uncacheable, silently, with no error.

So the design job is ordering by stability. Never-changing content first: tool definitions, the core system prompt, few-shot examples, a large reference document. Then per-session content. Then per-turn content, after the last breakpoint. If your prompt builder interpolates the current date, a request id, or a per-user field into the system prompt, move it into a message near the end.

The economics are simple and worth memorising: a cache write costs about 1.25× normal input tokens, a cache read about 0.1×. Two requests against the same prefix already pay it back at the default five-minute TTL; a longer TTL costs more to write and needs more reads to break even. Minimum cacheable prefix lengths are model-specific and in the hundreds-to-thousands of tokens — below that it silently does not cache.

The two highest-value patterns are a long shared system prompt across many users, and a multi-turn conversation where you place the breakpoint at the end of the newest turn so each request reuses the entire prior transcript. That second one is what makes a long agent session economically viable at all.

Three things break it that people forget: switching model, changing the tool list, and editing the system prompt mid-conversation. The first has no workaround — caches are per-model. For the second and third there are increasingly first-class escape hatches (deferred tool loading, appending operator instructions as a system message inside the conversation rather than editing the top-level prompt), and both exist precisely because rebuilding the prefix on a long session is so expensive.

Verification is non-negotiable: `usage.cache_read_input_tokens` tells you whether it worked. If it is zero across repeated identical-prefix requests, something is invalidating the prefix — non-deterministic JSON key ordering and injected timestamps are the usual suspects.

## Why it matters

This is the largest single cost lever in a typical LLM product — an agent or a long-document assistant can drop its bill by most of an order of magnitude, and time-to-first-token improves at the same time. It is also a favourite follow-up in system design: "your prompt is 30K tokens and you call it on every keystroke — what do you do?" And it is an easy thing to have quietly broken, which is why the answer must include checking the usage field rather than assuming.

## Key points

- Caching is a byte-exact prefix match in render order (tools → system → messages); a single changed byte invalidates everything after it.
- Order content by stability, with volatile content after the last breakpoint. Never interpolate timestamps, UUIDs, or per-user fields into the system prompt.
- Writes cost about 1.25× input, reads about 0.1× — two hits against the same prefix already pay for the write at the default TTL.
- There is a minimum cacheable prefix length, and it varies by model; shorter prefixes silently fail to cache with no error.
- In a multi-turn conversation, put the breakpoint at the end of the most recent turn so each request reuses the whole prior transcript.
- Switching models invalidates unconditionally — caches are per-model. Route sub-tasks to a subagent rather than swapping model mid-session.
- Changing the tool list or editing the system prompt mid-conversation invalidates the prefix; use deferred tools and mid-conversation system messages instead.
- Always verify with `usage.cache_read_input_tokens`; a persistent zero means a silent invalidator, most often unsorted JSON or an injected timestamp.
