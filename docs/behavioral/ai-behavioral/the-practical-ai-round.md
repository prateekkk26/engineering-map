---
title: The Practical AI Round
summary: The take-home or pairing session is frequently "build a small UI against an LLM API", and it's scored on the states you handle, not the happy path.
level: core
minutes: 20
order: 2
tags: [ai, take-home, interviewing, frontend]

related:
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - behavioral/technical-communication/writing-as-a-hiring-signal
  - behavioral/common-questions/working-in-ambiguity

resources:
  - title: Streaming messages
    url: https://platform.claude.com/docs/en/build-with-claude/streaming
    source: Anthropic
    type: docs
    minutes: 15
    primary: true
  - title: Chatbots and conversational UI
    url: https://www.nngroup.com/articles/chatbots/
    source: Nielsen Norman Group
    type: article
    minutes: 15
  - title: Design patterns for securing LLM agents against prompt injection
    url: https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/
    source: Simon Willison
    type: article
    minutes: 20
---

## In one line

Everyone gets the happy path working; the score comes from streaming, cancellation, errors, empty states, and the fact that you handled the model being wrong.

## What it is

At these companies the practical round is usually a few hours of take-home or a 90-minute pairing session, and the brief is often deliberately thin: a chat interface, a summariser, a document Q&A, something with tool calls. Thin briefs are the test — see working in ambiguity.

**What separates submissions**, roughly in order of how often it's the deciding factor:

**The non-happy states.** Loading that isn't a spinner blocking the page, an error the user can act on, a retry, an empty state, a request the user can cancel mid-stream. Cancellation specifically is the detail that gets noticed, because it means you thought about a user changing their mind on a slow response — and because getting an `AbortController` correctly wired through a stream is a real skill.

**Streaming done properly.** Tokens rendering as they arrive without layout thrash, a visible stop control, partial output preserved when the stream breaks. If you only have time for one advanced thing, this is it.

**Handling the model being wrong.** Malformed JSON, a refusal, an empty response, a truncated tool call. A submission that degrades gracefully instead of throwing signals someone who has done this before. Never render model output as raw HTML — treat it as untrusted, because it is.

**Restraint.** Four hours spent on scope you chose is worse than three hours on a smaller thing done well plus a README explaining what you cut. Don't add auth, a database, and a design system to a summariser.

**A key in the repo, ever.** Server-side proxy, `.env.example`, and a note in the README. Committing a key is an instant fail at security-conscious companies and it happens constantly.

Ask up front whether AI tools are allowed — usually yes — and if so, use them and be ready to explain every line you submitted.

## Why it matters

This round is the closest thing to the actual job at these companies, and it's weighted accordingly. It's also the one where preparation transfers directly: having built one streaming interface with cancellation before means you spend the session on judgement rather than mechanics.

## Key points

- The happy path is table stakes; loading, error, empty, and cancel states are where the score is.
- Streaming with a working stop control is the single highest-value thing to get right.
- Wire cancellation through properly — abort the request, not just the UI.
- Handle malformed, refused, empty, and truncated model output without crashing.
- Never render model output as HTML; treat it as untrusted input.
- Never commit an API key — proxy server-side and ship a `.env.example`.
- Keep scope small and put what you cut, and why, in the README.
- Ask whether AI tools are permitted, and be able to explain every line you submit either way.
