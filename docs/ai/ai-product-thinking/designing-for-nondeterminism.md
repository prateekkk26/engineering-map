---
title: Designing for Nondeterminism
summary: The same input can produce different output and sometimes a wrong one, so the product has to be built around being occasionally wrong rather than around being right.
level: core
minutes: 20
order: 1
tags: [product, ux, quality, judgement]

related:
  - ai/llm-foundations/sampling-and-determinism
  - ai/ai-product-thinking/ai-ux-patterns
  - ai/llm-foundations/hallucination-and-grounding

resources:
  - title: People + AI Guidebook
    url: https://pair.withgoogle.com/guidebook/
    source: Google PAIR
    type: docs
    minutes: 60
    primary: true
  - title: Guidelines for Human-AI Interaction
    url: https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/
    source: Microsoft Research
    type: article
    minutes: 30
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
---

## In one line

Design the feature so that a wrong or varying answer is cheap — visible, correctable, reversible — rather than trying to build a system that is never wrong.

## What it is

Conventional software has a correct output per input, so the UI presents results as facts and errors as exceptions. LLM features break both assumptions: output varies run to run, and a confident wrong answer arrives through the same code path as a correct one, with no error to catch.

The design consequences.

**Match the interaction to the stakes.** Where being wrong is cheap — a draft, a suggestion, a summary the user reads anyway — the model can act directly. Where it is expensive, the model proposes and the human disposes: draft rather than send, suggest rather than apply, preview rather than execute. Most successful AI features are aggressive about which side of that line they sit on, and most failed ones put an automatic action where a draft belonged.

**Make correction cheaper than starting over.** Regenerate, edit in place, "try again with more detail", a way to steer rather than only accept or reject. If the fastest recovery from a bad answer is to do the whole task manually, the feature has negative value on its bad runs.

**Make wrongness visible.** Citations, the retrieved source, the reasoning summary, the SQL that produced the number. The point is not transparency for its own sake — it is that verification has to be nearly free, or nobody verifies and errors propagate silently.

**Set expectations in the interface.** Labelling output as AI-generated, showing a draft state, and describing what the feature is good and bad at all reduce the trust miscalibration that produces the worst outcomes. Over-trust is more dangerous than under-trust because it is invisible until something goes wrong.

**Design the unhappy paths explicitly.** No answer, low confidence, a refusal, a timeout, a partial stream that dies. These are normal operating states here, not exceptions, and the ones teams leave to a generic error toast are exactly where users lose faith.

And accept variation where it does not matter. Two acceptable phrasings of a summary are fine; two different extracted totals are not. Deciding which parts of the product need pinning — via schemas, deterministic post-processing, or caching a chosen answer — is a design decision, not a technical inevitability.

## Why it matters

This is the founder-round question in disguise: given an AI feature, do you understand what it means for users that it is sometimes wrong? Teams that skip it ship a confident oracle, users get burned once, and the feature is abandoned regardless of its accuracy. The framing — make wrongness cheap rather than impossible — is the single most useful thing to be able to say about AI product design.

## Key points

- The same input can yield different output, and a wrong answer arrives through the same path as a right one with no error.
- Match interaction to stakes: act directly where being wrong is cheap, propose-and-confirm where it is not.
- Draft rather than send, suggest rather than apply — the highest-value pattern for consequential actions.
- Make correction cheap: regenerate, edit in place, steer. If manual redo is faster, bad runs have negative value.
- Show sources, reasoning, or the query so verification costs almost nothing — otherwise nobody verifies.
- Label AI output and set expectations; over-trust is more dangerous than scepticism because it is invisible.
- Treat no-answer, low-confidence, refusal, timeout, and dropped streams as designed states, not error toasts.
- Accept variation where it is harmless and pin it where it is not — with schemas, post-processing, or caching.
- Never surface model confidence as a number; self-reported confidence is generated text, not calibration.
