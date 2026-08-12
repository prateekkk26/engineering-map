---
title: Eval & Experiment Infrastructure
summary: The system that tells you whether a prompt or model change made things better — datasets, graders, CI gating, and online experiments.
level: core
minutes: 25
order: 7
tags: [ai, evals, quality]

related:
  - ai/evals-and-quality/why-evals-are-the-real-work
  - ai/evals-and-quality/llm-as-judge
  - ai/evals-and-quality/offline-and-online-evaluation
  - system-design/ai-system-design/prompt-and-model-versioning

resources:
  - title: Your AI Product Needs Evals
    url: https://hamel.dev/blog/posts/evals/
    source: Hamel Husain
    type: article
    minutes: 40
    primary: true
  - title: Building Evaluations
    url: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    source: Anthropic
    type: docs
    minutes: 25 # unverified
  - title: Patterns for Building LLM-based Systems
    url: https://eugeneyan.com/writing/llm-patterns/
    source: Eugene Yan
    type: article
    minutes: 40
---

## In one line

Eval infrastructure is a test harness for a non-deterministic system: versioned datasets, graders that produce a score, and a pipeline that runs them on every change so you can tell improvement from regression.

## What it is

**Why it's infrastructure rather than a script.** Any prompt or model change makes some cases better and some worse. Without a harness you're comparing vibes on the three examples you happen to remember, and you will ship regressions. The eval system is what turns "this feels better" into "this is +4% on the eval set, with these five new failures."

**The four pieces.**

*Datasets.* Versioned collections of inputs with expected outputs or grading criteria. They start from real production traffic — especially the failures — and grow every time you find a bug: the bug becomes a test case, permanently. Keep a held-out set you don't iterate against, or you overfit the prompt to the eval.

*Graders.* Exact match and structural checks where the answer is unambiguous (JSON valid, correct label, tool called with the right arguments). Deterministic assertions for properties (contains a citation, under N words, no PII). **LLM-as-judge** for the subjective majority — and it needs its own validation: measure the judge's agreement with human labels before you trust it, or you're optimising against a broken ruler. For RAG, grade retrieval and generation separately.

*A runner.* Executes the dataset against a configuration (prompt version × model × parameters), in parallel, with caching so unchanged cases aren't re-run, and stores per-case results rather than only an aggregate. The aggregate tells you *whether* something changed; the per-case diff tells you *what*, and that's what you actually act on. This is the natural home for the batch API — half price and no interactive rate-limit pressure.

*A results store and comparison view.* Score by version, per-case diffs against the previous run, and the ability to answer "which cases did this change break?"

**CI gating.** Evals run on every prompt change like tests. Gate on a threshold, and treat a drop as a failing build. Because scores are noisy, gate on a meaningful delta rather than exact equality, and re-run flaky cases before failing.

**Online evaluation is the other half.** Offline evals tell you about the cases you thought of; production tells you about the rest. Log real interactions, sample for human review, capture explicit feedback (thumbs) and implicit signals (regeneration, copy, abandonment), and monitor quality proxies continuously. Feed newly-found failures back into the offline set — that loop is the whole point.

**Experiments.** A/B a prompt or model version with real traffic, with per-variant quality, latency and cost. Note that cost is a legitimate experiment metric here in a way it usually isn't: a variant that's 2% better and 3× the price may be the wrong ship.

## Why it matters

This is the highest-signal AI answer available, because it's what separates teams that ship model features reliably from teams that guess. It's also the least glamorous and most-skipped part of every AI system, so raising it unprompted — and treating it as infrastructure with datasets, CI and an online loop — is a strong differentiator.

## Key points

- Without an eval harness you cannot distinguish improvement from regression on a non-deterministic system.
- Build datasets from real traffic, especially failures, and add every bug as a permanent case.
- Keep a held-out set, or you overfit the prompt to the eval.
- Use exact and structural graders where possible; validate LLM judges against human labels before trusting them.
- Store per-case results — the diff is actionable, the aggregate isn't.
- Run eval sweeps on the batch API: about half the cost and off the interactive rate limit.
- Gate CI on a meaningful score delta, not exact equality, because scores are noisy.
- Close the loop: online feedback and sampled review generate the next round of offline cases.
- Treat cost and latency as first-class experiment metrics alongside quality.
