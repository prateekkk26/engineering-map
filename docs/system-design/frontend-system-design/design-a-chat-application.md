---
title: Design a Chat Application
summary: Optimistic sends with client-generated IDs, ordering and dedupe, reverse-scrolling history, and the streaming-LLM variant these companies actually ask.
level: core
minutes: 30
order: 10
tags: [frontend-system-design, design-problem, realtime, ai]

related:
  - frontend/ai-interfaces/chat-ui-architecture
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - frontend/state-and-data/optimistic-updates-and-rollback
  - frontend/state-and-data/realtime-state-sync
  - system-design/classic-problems/design-a-chat-system

resources:
  - title: Writing WebSocket Client Applications
    url: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Server-Sent Events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    source: MDN
    type: docs
    minutes: 20
  - title: "Response Times: The 3 Important Limits"
    url: https://www.nngroup.com/articles/response-times-3-important-limits/
    source: Nielsen Norman Group
    type: article
    minutes: 15
---

## In one line

A list that grows from the bottom, where messages arrive out of order, sends can fail after you've already drawn them, and — increasingly — one participant is a model streaming tokens.

## What it is

**Ask which chat.** Human-to-human messaging and an LLM chat surface share a UI and share almost no design. At the companies in PRD §1.1 the prompt is very often the second one, and the take-home frequently is. Design for the one you're asked.

**Sending.** Generate a client-side ID (UUID) *before* the request, render the message immediately as `sending`, and reconcile when the server echoes it back with its canonical ID and timestamp. The client ID is what makes dedupe possible — the same message arriving via the socket must not appear twice. On failure, keep the bubble and mark it `failed` with a retry, don't delete it; queue outbound messages while offline and flush on reconnect, in order.

**Ordering.** Client clocks lie, so sort by server timestamp with a sequence number as the tiebreak, and treat the socket as a delivery mechanism, not a source of order. On reconnect, fetch anything missed since the last known sequence rather than trusting that the stream was continuous.

**History.** Reverse-cursor pagination scrolling upward, which is the fiddly bit: prepending content above the viewport moves the scroll position, so capture `scrollHeight` before insert and restore the delta after, or anchor with `overflow-anchor`. Keep the view pinned to the bottom only when the user is already at the bottom — if they've scrolled up to read, a new message must not yank them down; show a "new messages" pill instead.

**Transport.** WebSocket for bidirectional human chat (typing indicators, presence, read receipts all need the upstream channel). SSE for LLM streaming, which is one-way and where SSE is what the major model APIs actually speak. Either way: heartbeat, reconnect with backoff and jitter, resume cursor, and a visible connection state.

**The LLM variant, specifically.** Stream tokens and append to the in-flight assistant message; render markdown incrementally and sanitise before injecting anything as HTML — model output is untrusted input. Support cancellation with an `AbortController` and keep the partial response rather than discarding it. Handle tool calls as a distinct message part with its own collapsed rendering. Throttle DOM updates — committing state per token at high token rates is a real INP problem, so batch on animation frames. Show a stop button, not just a spinner, and persist the conversation so a refresh doesn't lose it.

**Optimisations.** Virtualise long conversations, but with variable-height measurement and careful anchoring. Debounce typing indicators and expire them client-side. Lazy-load images and attachments. Group consecutive messages by sender for both visual density and fewer nodes.

**Accessibility.** The message list is a log — `role="log"` with `aria-live="polite"` — so new messages are announced without stealing focus. For streaming, do not announce every token: announce once on completion, or the screen reader output is unusable. Enter to send with Shift+Enter for a newline, and say that out loud.

## Why it matters

Chat is the default surface for AI products, so this prompt is now standard in these loops and the take-home is often a version of it. The optimistic-send-with-client-ID pattern and streaming cancellation are the two specifics that show you've built one; token-level rendering cost is the follow-up that catches people.

## Key points

- Generate a client-side message ID before sending — it drives optimistic rendering, reconciliation and dedupe.
- Failed sends stay visible and retryable; deleting the bubble is the wrong recovery.
- Order by server timestamp and sequence number, never client clock, and refetch the gap on reconnect.
- Prepending history moves the scroll position; capture and restore the offset or use scroll anchoring.
- Only auto-scroll when the user is already at the bottom, otherwise show a "new messages" affordance.
- WebSocket when you need the upstream channel; SSE for LLM streaming, which is what model APIs speak.
- Batch streamed tokens per animation frame — per-token state updates are a genuine INP failure.
- Treat model output as untrusted: sanitise markdown before rendering it as HTML.
- Support cancellation and keep the partial response; a stop button is a requirement, not a nicety.
- Use `role="log"` with polite announcements, and announce a streamed reply once it completes rather than per token.
