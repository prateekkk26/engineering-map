---
title: Building an Eval Set
summary: Where the cases come from, how many you need, and why a set built from imagination tests a product nobody is using.
level: core
minutes: 20
order: 2
tags: [evals, quality, testing]

related:
  - ai/evals-and-quality/why-evals-are-the-real-work
  - ai/evals-and-quality/llm-as-judge
  - ai/rag-and-retrieval/evaluating-retrieval-quality

resources:
  - title: Your AI product needs evals
    url: https://hamel.dev/blog/posts/evals/
    source: Hamel Husain
    type: article
    minutes: 35
    primary: true
  - title: Create strong empirical evaluations
    url: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    source: Anthropic
    type: docs
    minutes: 20
  - title: OpenAI Evals
    url: https://github.com/openai/evals
    source: OpenAI
    type: repo
    minutes: 20
  - title: Task-specific LLM evals that do and don't work
    url: https://eugeneyan.com/writing/evals/
    source: Eugene Yan
    type: article
    minutes: 40
---

## In one line

Collect real inputs, define what an acceptable output looks like for each, and keep the set small enough to run constantly and representative enough to be worth trusting.

## What it is

A case is an input, optionally an ideal output, and a check. The check is the design decision: an exact match for classification, a set of required and forbidden elements for generation, a schema for extraction, a rubric for subjective quality, or a comparison against a reference answer.

**Where cases come from**, in descending order of value:

*Production traffic* is the gold standard — real inputs, real distribution, real weirdness. Log inputs from day one, because a set built from actual usage tests the product you have rather than the one you imagined.

*Bug reports and complaints* are already-known failures; every one should become a permanent case so it cannot come back.

*Domain expert authorship* covers what should work but hasn't been hit yet, especially in regulated or specialised domains where the expert knows the edges.

*Synthetic generation* — ask a model to produce plausible inputs — is the way to bootstrap before launch. It carries a known bias toward well-formed, on-distribution examples, so treat it as scaffolding and replace it as traffic arrives.

**Composition matters more than size.** Cover the common path, but weight the set toward the boundaries: ambiguous inputs, adversarial ones, empty and malformed inputs, unusually long inputs, other languages, and — critically — the cases where the correct behaviour is to refuse or say "I don't know". A suite of only happy-path cases will pass while your product fails on everything users actually send.

**Size**: 50–100 cases is enough to make decisions for most features, and hundreds only if the surface is genuinely broad. The binding constraint is that the suite must be cheap and fast enough to run on every change; a suite too expensive to run is not a suite.

**Hygiene**: version it with the code, hold out a portion you do not iterate against so you can detect overfitting to your own eval set, and re-examine it periodically because usage drifts and a stale set gradually measures the wrong product. Store cases in something readable and diffable — a CSV or JSONL in the repo — so a change to expectations shows up in review.

Track pass rate per category rather than one aggregate number. A single score hides that you fixed summarisation and broke extraction.

## Why it matters

This is the concrete follow-up after "we'd build evals": where do the cases come from, and how do you know they're representative? Answering with production logs, bug reports, and deliberate boundary coverage — plus a held-out slice — reads as someone who has run the loop. It is also where most eval efforts fail in practice: a set of invented happy-path examples that stays green while users complain.

## Key points

- A case is input, expected behaviour, and a check; choosing the check is the real design work.
- Production traffic is the best source, so log inputs from the first day the feature exists.
- Every reported bug becomes a permanent case — the suite grows from reality, not imagination.
- Synthetic cases are a pre-launch bootstrap with a known happy-path bias; replace them as real traffic arrives.
- Weight the set toward boundaries: ambiguous, adversarial, empty, malformed, multilingual, and unanswerable inputs.
- Include cases where the correct answer is refusal or "I don't know", or you never measure abstention.
- 50–100 cases decides most questions; cheap and fast to run matters more than large.
- Hold out a slice you never tune against, or you will overfit to your own eval set.
- Version cases in the repo in a diffable format so changed expectations surface in code review.
- Report pass rate per category — one aggregate number hides offsetting regressions.
