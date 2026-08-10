---
title: Latency & Perceived Speed for LLM UIs
summary: Working with seconds-long responses — where the time actually goes, and the interface techniques that make the wait acceptable.
level: core
minutes: 20
order: 6
tags: [ai, performance, ux]

related:
  - frontend/performance/perceived-performance
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - frontend/ai-interfaces/error-retry-and-degraded-modes

resources:
  - title: Response Times — The 3 Important Limits
    url: https://www.nngroup.com/articles/response-times-3-important-limits/
    source: Nielsen Norman Group
    type: article
    minutes: 15
    primary: true
  - title: Streaming Messages
    url: https://platform.claude.com/docs/en/build-with-claude/streaming
    source: Anthropic
    type: docs
    minutes: 25
  - title: Prompt caching
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
    source: Anthropic
    type: docs
    minutes: 25
---

## In one line

The number that governs how a model UI feels is time-to-first-token, not total duration — so the work is to shorten the silence, then make the rest visibly productive.

## What it is

Split the wait into three parts, because they have different fixes. **Time to first token** is your server hop plus the model's prefill over the whole prompt; it is the silence the user actually judges. **Inter-token latency** determines whether the text reads at a comfortable pace. **Total time** matters least once the first two are handled — people will happily read a response that is still being written.

Frontend levers, roughly in order of impact:

**Acknowledge immediately.** The user's message appears in the transcript the instant they send it, the composer clears, and a typing indicator appears — all before the network call resolves. That converts a two-second silence into a two-second wait with visible progress.

**Stream, always.** A response that takes eight seconds to arrive whole and one that starts in eight hundred milliseconds and streams for eight seconds take the same time and feel nothing alike.

**Shorten the prompt.** Prefill scales with input length, so a bloated system prompt or an unpruned conversation history costs latency on every single turn. Trimming context is a frontend-adjacent performance fix that most teams never make.

**Exploit prompt caching.** Providers cache a stable prefix, so keeping the system prompt and early context byte-identical across turns cuts prefill dramatically. That is an architecture constraint with a UI consequence: interpolating a timestamp into the system prompt quietly destroys it.

**Show the step, not a spinner**, when the turn involves tool calls or retrieval — "Searching…", "Reading three sources…" is honest progress rather than an undifferentiated wait.

Two things worth not doing. Do not fake a typing animation on text that has already fully arrived; users notice, and it wastes real time. And do not let optimistic rendering imply success — a message that appears sent and then fails silently is worse than a slower, honest flow.

## Why it matters

Model latency is fixed by physics and the provider; the felt experience is entirely a frontend product. Two apps on the same API can feel a generation apart.

In interviews this is the natural follow-up to "the API takes four seconds" — and the expected answer is about first-token time and visible progress, not about caching the response.

## Key points

- Time to first token is what the user judges; total duration matters far less once streaming is in place.
- Echo the user's message and show a typing indicator before the network resolves.
- Prefill scales with prompt length — trimming system prompts and history is a real latency fix.
- Keep the cached prefix byte-stable; an interpolated timestamp silently disables prompt caching.
- Replace generic spinners with the current step during tool use or retrieval.
- Don't fake typing on already-delivered text, and don't let optimistic UI imply a success that hasn't happened.
