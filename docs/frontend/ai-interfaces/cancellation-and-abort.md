---
title: Cancellation & Abort
summary: Letting the user stop a generation, and making sure the request actually stops rather than just disappearing from the screen.
level: core
minutes: 20
order: 3
tags: [ai, ux, network]

related:
  - frontend/ai-interfaces/streaming-responses-in-the-ui
  - frontend/browser-platform/fetch-cors-and-credentials
  - frontend/ai-interfaces/cost-telemetry-and-feedback-capture

resources:
  - title: AbortController
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
    source: MDN
    type: docs
    minutes: 15
    primary: true
  - title: AbortSignal
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
    source: MDN
    type: docs
    minutes: 15
  - title: Route Handlers
    url: https://nextjs.org/docs/app/api-reference/file-conventions/route
    source: Next.js
    type: docs
    minutes: 20
---

## In one line

A stop button must abort the fetch, propagate that abort through your server to the provider, and keep the partial output — because tokens already generated are already paid for.

## What it is

`AbortController` is the mechanism. Create one per request, pass `controller.signal` into `fetch`, and call `abort()` when the user hits stop. The fetch rejects with an `AbortError`, which your error handling must distinguish from a real failure — showing "something went wrong" because the user pressed stop is a bug people ship regularly.

The part that gets missed is **propagation**. Aborting the browser's fetch closes the connection to *your server*. Whether the request to the provider also stops depends on whether your route handler notices. In a Next.js route handler, `request.signal` fires when the client disconnects; forward it to the provider SDK call. Without that, the generation continues server-side and you keep paying for tokens nobody will read.

**Keep the partial output.** The user stopped because they had seen enough, or because it was going the wrong way — deleting the text they were reading is hostile, and the tokens are already billed. Mark the message as stopped, keep it in the transcript, and make regeneration available.

The same signal covers more than a stop button. Navigating away should abort; unmounting the component should abort in the effect's cleanup; a new message sent while one is streaming should abort the previous. `AbortSignal.timeout()` gives you an upper bound, and `AbortSignal.any()` combines several sources — a user abort, a timeout, and an unmount — into one.

Two correctness details. Aborting is not instant, so guard against a late delta arriving after the state has moved on — track a request id and ignore stale ones. And if the turn involved a tool call that was already dispatched, decide whether abort cancels its side effects or merely stops rendering; for anything that writes, that is a real decision, not a detail.

## Why it matters

Long generations make stop a required control, not a nicety, and the server-side propagation is the part interviewers probe — "does the model actually stop generating?" separates people who wired the button from people who traced the request.

It is also a direct cost lever: abandoned generations that keep streaming are money spent on output nobody sees.

## Key points

- One `AbortController` per request; `abort()` rejects the fetch with `AbortError`, which must not be rendered as a failure.
- Forward the server's `request.signal` to the provider, or generation continues and bills after the user has stopped it.
- Keep partial output and mark it stopped — the tokens are paid for and the user was reading them.
- Abort on unmount, on navigation, and when a new message supersedes the current one.
- `AbortSignal.timeout()` and `AbortSignal.any()` combine deadline and user cancellation cleanly.
- Ignore late deltas via a request id, and decide explicitly what abort means for tool calls already in flight.
