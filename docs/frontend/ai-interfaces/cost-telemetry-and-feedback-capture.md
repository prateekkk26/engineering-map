---
title: Cost, Telemetry & Feedback Capture
summary: Measuring what a model feature costs and whether it works — token accounting, quality signals, and the privacy line.
level: deep
minutes: 20
order: 9
tags: [ai, observability, product]

related:
  - frontend/architecture/frontend-observability
  - frontend/security/privacy-consent-and-gdpr
  - frontend/ai-interfaces/latency-and-perceived-speed-for-llm-uis

resources:
  - title: Prompt caching
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
    source: Anthropic
    type: docs
    minutes: 25
    primary: true
  - title: Token counting
    url: https://platform.claude.com/docs/en/build-with-claude/token-counting
    source: Anthropic
    type: docs
    minutes: 15
  - title: OpenTelemetry JS
    url: https://opentelemetry.io/docs/languages/js/
    source: OpenTelemetry
    type: docs
    minutes: 30
---

## In one line

Model features have a per-interaction cost and no automatic measure of whether the answer was any good, so both have to be instrumented deliberately — server-side, and with a clear line about what is stored.

## What it is

**Cost.** Every response carries usage: input tokens, output tokens, and — importantly — cache-read and cache-creation counts separately, because they are priced very differently. Record them per request alongside the model, the feature, and the user or tenant, then derive cost from a rate table rather than storing a currency figure that goes stale on the next price change. The units worth watching are cost per conversation and cost per active user; a total that only goes up tells you nothing about whether the feature is viable.

Two things move that number more than anything you will do in the UI: **prompt caching hit rate**, which is why the cached prefix must stay byte-stable, and **abandoned generations**, which is why abort propagation is a cost feature as much as a UX one.

**Latency**, split the way the user experiences it: time to first token, total duration, and inter-token pace, at the 75th and 95th percentiles rather than the mean. Capture it client-side, because server-side timing misses your own network hop.

**Quality** has no automatic signal, so you have to collect one. Explicit thumbs up and down are cheap and low-volume; treat the negative ones as the useful signal and always allow an optional comment. Implicit signals are higher-volume and often more honest: did the user copy the answer, retry, rephrase, stop the generation early, or abandon the session. Regeneration rate in particular is a good proxy for dissatisfaction.

**The privacy line is the part to get right before shipping any of it.** Conversations contain whatever users typed — credentials, health details, other people's personal data. Decide explicitly whether transcripts are stored, for how long, who can read them, and whether they are used for training or evaluation; say so in the interface; and give users deletion. Under GDPR that is a legal requirement, not a policy preference. The safe default is aggregate metrics plus opt-in transcript retention, with feedback events keyed by conversation id rather than embedding the text.

And send telemetry from the server, not the browser: it cannot be blocked or forged, and it keeps the numbers honest.

## Why it matters

Model features have a unit cost that scales with usage, which makes cost a product constraint rather than an infrastructure detail — and the frontend decisions (context length, caching stability, abort) move it directly.

The privacy question is also the one most likely to be asked in a European hiring loop, where storing conversation data without a lawful basis is a real problem.

## Key points

- Record input, output, cache-read, and cache-creation tokens separately; derive cost from a rate table, not a stored figure.
- Track cost per conversation and per active user — a rising total on its own is not a signal.
- Cache hit rate and abandoned generations are the two biggest cost levers, and both are frontend-adjacent.
- Measure time to first token, total duration, and inter-token pace at p75 and p95, from the client.
- Collect explicit feedback with an optional comment, and mine implicit signals — copy, retry, early stop, abandonment.
- Decide and disclose transcript retention before shipping; default to aggregates plus opt-in retention.
- Emit telemetry server-side so it cannot be blocked or forged.
