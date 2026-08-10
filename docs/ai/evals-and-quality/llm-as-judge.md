---
title: LLM as Judge
summary: Using a model to score outputs makes subjective quality measurable at scale — provided you treat the judge as a component that itself needs validating.
level: core
minutes: 20
order: 3
tags: [evals, quality, testing]

related:
  - ai/evals-and-quality/building-an-eval-set
  - ai/evals-and-quality/why-evals-are-the-real-work
  - ai/rag-and-retrieval/evaluating-retrieval-quality

resources:
  - title: Evaluating the effectiveness of LLM-evaluators
    url: https://eugeneyan.com/writing/llm-evaluators/
    source: Eugene Yan
    type: article
    minutes: 40
    primary: true
  - title: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"
    url: https://arxiv.org/abs/2306.05685
    source: Zheng et al.
    type: article
    minutes: 35
  - title: Your AI product needs evals
    url: https://hamel.dev/blog/posts/evals/
    source: Hamel Husain
    type: article
    minutes: 35
---

## In one line

Give a model the input, the output, and a rubric, and have it return a score — cheap enough to run on every change, and only trustworthy once you have measured it against human judgement.

## What it is

Some qualities have no deterministic check. Is this summary faithful? Is this tone right for our brand? Is this explanation actually helpful? A model can assess these reasonably well, at a cost and speed that makes continuous evaluation possible where human review would not be.

What makes a judge work:

**A specific rubric.** "Rate quality 1–10" produces noise. "Score 1–5 on faithfulness, where 5 means every factual claim appears in the provided context and 1 means the answer contains claims absent from it" produces something usable. Define each point on the scale, and prefer coarse scales — binary or three-point — because fine-grained numeric scores from a model are poorly calibrated and cluster in the middle.

**Reasoning before the verdict.** Have the judge explain, then score. It improves accuracy and — more usefully — gives you an artifact to read when the judge disagrees with a human.

**Pairwise comparison over absolute scoring** where it fits. "Which of these two is better?" is a far more reliable question than "rate this out of ten", which is why preference comparisons dominate model leaderboards. Use it for A/B-ing prompt versions.

**Evidence in the prompt.** Judges are dramatically more reliable when checking against something concrete — is this claim in the retrieved context? — than when assessing quality in the abstract.

The biases are well documented and need controlling for. **Position bias**: with two candidates, the order affects the verdict, so run both orders and discard disagreements or average them. **Verbosity bias**: longer answers score higher regardless of quality. **Self-preference**: models tend to favour their own output, which argues for a different model as judge than the one being evaluated. And judges are systematically lenient on failures that require domain expertise to spot.

The step teams skip is **validating the judge**. Have humans label 50–100 outputs, run the judge on the same set, and measure agreement. If the judge disagrees with your reviewers a third of the time, its scores are decoration. Iterate on the rubric until agreement is acceptable, then treat that agreement rate as a known error bar on everything the judge reports. And re-validate when you change the judge model — a judge is a versioned dependency like any other.

Judges do not replace human review; they extend it. Sample and read real outputs regularly regardless of what the judge says.

## Why it matters

Anything with subjective output — summarisation, chat, writing assistance, explanation — cannot be evaluated at scale without this, and it is a standard interview follow-up to "how would you measure quality?". The differentiator is mentioning validation against human labels: candidates who propose a judge and stop have described a metric nobody has any reason to believe.

## Key points

- A judge makes subjective quality measurable continuously, at a cost that permits running it on every change.
- Rubrics must be specific and anchored per scale point; "rate 1–10" returns noise.
- Prefer coarse scales — binary or three-point — because fine-grained model scores are poorly calibrated.
- Ask for reasoning before the verdict; it improves accuracy and gives you something to inspect on disagreement.
- Pairwise comparison is more reliable than absolute scoring and is the right tool for comparing prompt versions.
- Judges are most reliable when checking against supplied evidence rather than assessing quality in the abstract.
- Control for position bias by running both orders; be aware of verbosity bias and self-preference.
- Use a different model as judge than the one under evaluation.
- Validate the judge against human labels and treat the agreement rate as the error bar on its scores.
- Re-validate whenever the judge model changes — it is a versioned dependency, not a fixed instrument.
