---
title: Errors, Retries & Degraded Modes
summary: The failure modes specific to model APIs — rate limits, refusals, truncation, mid-stream drops — and what the UI should do about each.
level: core
minutes: 25
order: 7
tags: [ai, errors, reliability]

related:
  - frontend/architecture/resilient-ui-error-handling
  - frontend/ai-interfaces/cancellation-and-abort
  - frontend/ai-interfaces/streaming-responses-in-the-ui

resources:
  - title: Errors
    url: https://platform.claude.com/docs/en/api/errors
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Handling stop reasons
    url: https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons
    source: Anthropic
    type: docs
    minutes: 20
  - title: Rate limits
    url: https://platform.claude.com/docs/en/api/rate-limits
    source: Anthropic
    type: docs
    minutes: 20
---

## In one line

Model APIs fail in ways ordinary APIs do not — the request can succeed while the answer is unusable — so "did it 200?" is not the question the UI should be asking.

## What it is

Sort the failures by what the UI must do.

**Transport failures** are familiar: a 429 with a `retry-after`, a 5xx, an overloaded response, a dropped connection. Retry with exponential backoff and jitter, respect `retry-after` rather than guessing, and cap attempts. A 429 deserves an honest message about capacity, not a generic error.

**Mid-stream disconnects** are the awkward one. You have partial text on screen and the connection is gone. Keep the partial, mark it incomplete, and offer continue-or-retry. Silently discarding what the user was reading is the worst option.

**Stop reasons are not errors but change the outcome.** A response completing with `max_tokens` is truncated mid-sentence — offer to continue rather than pretending it finished. A `refusal` means safety classifiers declined; that needs a distinct, non-alarming message, and it is not something a retry of the same prompt will fix. And critically: **check the stop reason before reading the content**, because a refusal can arrive with an empty content array and code that indexes the first block will throw.

**Tool failures** belong to the loop, not the UI: return the error to the model as a tool result and let it adapt. Ending the conversation because one tool 500'd wastes the turn.

**Content problems** are the category with no HTTP status at all — valid JSON that fails your schema, a citation to a document that does not exist, an answer that is confidently wrong. Validate structured output against a schema at the boundary and treat a parse failure as a retryable condition, not a crash.

Then the degraded modes worth designing rather than discovering: fall back to a smaller or alternative model when the primary is unavailable, queue with an honest wait when rate-limited, and preserve the user's input on every failure path so nobody retypes a paragraph.

## Why it matters

These products fail more often and more strangely than CRUD apps, and the error surface is a large share of the perceived quality. Reviewers of a take-home look for the failure paths specifically — the happy path is the easy half.

The empty-content-on-refusal detail is a genuine crash people ship.

## Key points

- Retry transport failures with backoff and jitter, honouring `retry-after`; give 429s a truthful capacity message.
- On a mid-stream drop, keep the partial output, mark it incomplete, and offer continue or retry.
- Check the stop reason before reading content — a refusal can carry an empty content array.
- `max_tokens` means truncated, not finished; offer continuation.
- Return tool errors to the model rather than ending the turn.
- Validate structured output against a schema and treat parse failure as retryable.
- Design the degraded modes — fallback model, honest queueing — and never lose the user's typed input.
