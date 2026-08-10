---
title: Few-Shot Examples
summary: Showing the model two or three worked examples is usually cheaper and more effective than describing the rules — until the examples become the problem.
level: core
minutes: 15
order: 3
tags: [prompting, llm, quality]

related:
  - ai/prompting-and-context/prompting-fundamentals
  - ai/working-with-the-api/structured-outputs
  - ai/evals-and-quality/building-an-eval-set

resources:
  - title: Use examples (multishot prompting)
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/multishot-prompting
    source: Anthropic
    type: docs
    minutes: 15
    primary: true # unverified
  - title: Language Models are Few-Shot Learners
    url: https://arxiv.org/abs/2005.14165
    source: Brown et al.
    type: article
    minutes: 45
  - title: Prompt Engineering Guide — few-shot prompting
    url: https://www.promptingguide.ai/techniques/fewshot
    source: DAIR.AI
    type: docs
    minutes: 10
---

## In one line

Include a handful of input/output pairs in the prompt and the model infers the pattern — format, tone, edge-case handling — far more reliably than from a description of it.

## What it is

Zero-shot is instructions only. Few-shot adds worked examples, and the improvement is largest exactly where prose is weakest: output format, level of detail, house tone, and how to treat awkward inputs. "Classify sentiment" plus five labelled examples, two of which are genuinely ambiguous, communicates a decision boundary that a paragraph of criteria cannot.

Selection matters more than count. Three to five is the usual sweet spot; beyond that returns fall off and you are paying tokens on every request. The examples should span the real distribution rather than showcase the easy path — include the ambiguous case, the empty case, the malformed case, and show the desired handling. Ordering has a real effect too, and models are somewhat biased toward the label of the last example, which is why examples should not be sorted by class.

The two failure modes are opposite and both common. **Over-fitting to the examples**: the model latches onto an incidental property — every example was two sentences, so every output is two sentences; every example was about billing, so it handles billing well and shipping badly. **Label leakage into structure**: examples that all follow one shape teach that shape as a rule even where it doesn't apply.

Where few-shot has been displaced: pure output-format enforcement. If the only thing the examples were doing was showing the JSON shape, a structured-output schema does that better, with a guarantee instead of a tendency, and without paying for the examples on every call. Examples remain the right tool for *judgement* — the classification boundary, the editorial voice, what to do when the input is bad.

Two operational notes. Examples belong in the cached prefix, so their token cost is amortised rather than paid per call. And they are prompt code: when the desired behaviour changes, the examples are the first thing to go stale, and stale examples silently pull the model back to the old behaviour no matter what the instructions now say.

A useful pipeline: harvest examples from real traffic, correct the outputs by hand, promote the good ones into the prompt and the interesting ones into the eval set. The same corrections do double duty.

## Why it matters

It is the fastest quality win in prompting and the one most often skipped, and in a practical round "add two examples" is frequently the difference between an output that nearly works and one that does. Knowing when *not* to use examples — because a schema now handles it — is the part that reads as current rather than remembered.

## Key points

- Examples beat descriptions for format, tone, and edge-case handling; they are the highest return per token in a prompt.
- Three to five well-chosen examples is usually the sweet spot; more costs tokens on every request for diminishing gain.
- Cover the real distribution, including ambiguous and malformed inputs — examples that show only the happy path teach only the happy path.
- Watch for over-fitting to incidental properties of the examples, like length, domain, or structure.
- Shuffle rather than group by label; ordering and recency bias the model's choice.
- If the examples exist only to pin the output format, replace them with a structured-output schema — a guarantee beats a tendency and costs nothing per call.
- Put examples in the cached prefix so their cost is amortised.
- Treat examples as versioned code and refresh them when behaviour changes; stale examples quietly override current instructions.
