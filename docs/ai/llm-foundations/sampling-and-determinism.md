---
title: Sampling & Determinism
summary: How the next token is actually chosen from the distribution, and why "set temperature to 0" was never the reproducibility guarantee people treated it as.
level: core
minutes: 20
order: 3
tags: [llm, fundamentals, inference, testing]

related:
  - ai/llm-foundations/how-llms-generate-text
  - ai/ai-product-thinking/designing-for-nondeterminism
  - ai/evals-and-quality/regression-testing-prompts

resources:
  - title: How to generate text — decoding methods for language generation
    url: https://huggingface.co/blog/how-to-generate
    source: Hugging Face
    type: article
    minutes: 20
    primary: true
  - title: Adaptive thinking
    url: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
    source: Anthropic
    type: docs
    minutes: 15
  - title: The Curious Case of Neural Text Degeneration
    url: https://arxiv.org/abs/1904.09751
    source: Holtzman et al.
    type: article
    minutes: 30
---

## In one line

The model produces a probability distribution; sampling is the policy for turning it into one token, and no setting of that policy makes the system deterministic end to end.

## What it is

Given the distribution over the vocabulary, the simplest policy is **greedy decoding** — always take the highest-probability token. It sounds ideal and produces noticeably worse text: repetitive, flat, prone to getting stuck in loops. The classic knobs soften that. **Temperature** rescales the distribution before sampling — below 1 it sharpens toward the top token, above 1 it flattens toward the tail. **Top-k** samples only from the k most likely tokens; **top-p** (nucleus) samples from the smallest set whose probabilities sum to p, which adapts to how confident the model is at that position.

Two things have changed and both matter for an interview in 2026.

First, the frontier models have been moving away from exposing these knobs at all. Anthropic's current models reject `temperature`, `top_p`, and `top_k` outright — the request errors rather than being ignored. Behaviour is steered through the prompt and through an **effort** setting that controls how much reasoning the model does, not through the sampling distribution. If your instinct in a design discussion is "set temperature to 0 for the extraction path", say what you actually want — a constrained schema, a tight prompt, low effort — because the knob may not be there.

Second, temperature 0 never bought reproducibility. Floating-point non-associativity means results depend on GPU batching, which depends on what other traffic the provider is serving at that moment. Add continuous model updates, a routed mixture of experts, and retrieval that returns a slightly different set of chunks, and identical input to identical output is not a property you can rely on. Providers who offer a `seed` describe it as best-effort.

What you get instead is a distribution of acceptable outputs. That reframes testing: assertions become properties (valid JSON, schema conforms, contains the required field, does not contain PII) or scores across a set of cases, not string equality against a golden file.

## Why it matters

"How would you test this?" is asked in effectively every AI-product interview, and the honest answer starts with acknowledging non-determinism rather than promising to pin it. It is also a real production trap: teams build a snapshot test suite on temperature 0, watch it go red on unrelated deploys, and eventually delete the tests instead of replacing them with the right ones.

## Key points

- Greedy decoding maximises per-token probability and produces measurably worse text than sampling — the highest-probability continuation is not the best one.
- Temperature reshapes the distribution; top-k and top-p truncate it. Top-p adapts to model confidence and is generally preferred to top-k.
- Current frontier models increasingly reject sampling parameters entirely — steer with the prompt, structured outputs, and effort instead.
- Temperature 0 gives you near-greedy decoding, not reproducibility: batching, floating-point non-associativity, and silent model updates all break exact repeatability.
- Because the same input can yield different valid outputs, tests assert properties and score distributions rather than comparing strings.
- Low variance is a product decision as much as a technical one — extraction and classification want it, ideation and copywriting are worse without it.
- If exact reproducibility is genuinely required, cache the output and key on the input; do not try to make the model deterministic.
