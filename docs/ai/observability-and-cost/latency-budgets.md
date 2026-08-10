---
title: Latency Budgets
summary: Where the seconds actually go in an LLM request, which of them the user perceives, and the handful of techniques that move each one.
level: core
minutes: 20
order: 3
tags: [latency, performance, observability, ux]

related:
  - frontend/ai-interfaces/latency-and-perceived-speed-for-llm-uis
  - ai/working-with-the-api/streaming-and-server-sent-events
  - ai/working-with-the-api/reasoning-effort-and-thinking

resources:
  - title: Streaming Messages
    url: https://platform.claude.com/docs/en/build-with-claude/streaming
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Artificial Analysis — model comparison
    url: https://artificialanalysis.ai/
    source: Artificial Analysis
    type: repo
    minutes: 15
  - title: Response Times — The 3 Important Limits
    url: https://www.nngroup.com/articles/response-times-3-important-limits/
    source: Nielsen Norman Group
    type: article
    minutes: 10
---

## In one line

Break the request into retrieval, prefill, reasoning, and decode, budget each one, and optimise for time-to-first-token because that is the number the user experiences.

## What it is

The components, in the order they happen:

**Your own preprocessing** — query rewriting, embedding the query, retrieval, reranking. Often 200–800ms, and entirely yours to control. It happens before the model call, so it sits directly in the time-to-first-token path.

**Prefill** — processing the prompt. Scales with prompt size, which makes context length a latency concern and not only a cost one. Prompt caching cuts this substantially, which is why caching is a performance feature as well as an economic one.

**Reasoning** — on models that think before answering, a stretch of token generation with nothing visible. This can be seconds, it scales with effort, and it is the most common cause of "why is there a long pause before anything appears".

**Decode** — the visible tokens, at some tokens-per-second rate. Total decode time scales linearly with response length, so capping output length is a latency lever too.

Users perceive these very differently. Time-to-first-token is what registers as responsiveness; once tokens are flowing at a readable rate, total duration matters much less. That asymmetry is why streaming is the highest-leverage change available and why optimising total completion time is often the wrong target.

The levers, per component. Retrieval: parallelise the query embedding with anything else you can, cap candidate counts, keep the reranker small. Prefill: cache the prefix, and trim context — a shorter prompt is faster and cheaper simultaneously. Reasoning: lower effort where the task does not need it, and route simple requests to a model that does not reason at all. Decode: a smaller or faster model, and shorter outputs.

Architecturally, two more. **Do independent work in parallel** rather than sequentially — retrieval alongside a moderation check, several tool calls in one turn. And **decide what to prefetch or speculate on**: kicking off retrieval while the user is still typing trades some wasted work for a visibly faster response.

When latency cannot be fixed, manage it. A skeleton, a "searching…" step, a streamed reasoning summary, and — for genuinely long work — moving it to a background job with a notification are all legitimate answers. What is not legitimate is an unexplained spinner for twelve seconds.

Instrument all of it separately. A single end-to-end number cannot tell you whether the fix is caching, effort, or your own retrieval, and the p95 is what users complain about while the mean looks fine.

## Why it matters

Latency is the most common complaint about AI features, and it is a standard interview question with a genuinely structured answer — most candidates say "use streaming" and stop, while the components-and-levers breakdown shows you know where the time actually goes. It is also where frontend and backend meet, which is exactly the surface these roles own.

## Key points

- Four components: your preprocessing, prefill, reasoning, decode. Measure them separately or you cannot fix the right one.
- Time-to-first-token is what users perceive as speed; total duration matters far less once tokens are flowing.
- Retrieval and reranking sit in the first-token path and are entirely under your control — often the easiest win.
- Prefill scales with prompt size, so context trimming and prompt caching are latency levers as well as cost levers.
- Reasoning happens before anything visible; lowering effort or routing to a non-reasoning model removes the silent pause.
- Decode time scales with response length, so capping output shortens the tail.
- Parallelise independent work — retrieval with moderation, multiple tool calls in one turn.
- Prefetch or speculate where the waste is acceptable, such as starting retrieval while the user types.
- When it cannot be made fast, make it legible: staged progress, streamed reasoning summaries, or a background job with notification.
- Track p95 and p99, not the mean — the tail is what generates complaints.
