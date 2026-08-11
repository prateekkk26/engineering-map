---
title: Trust, Transparency & Citations
summary: Trust has to be calibrated rather than maximised — users should believe the system exactly as much as it deserves, which means showing your work and admitting limits.
level: core
minutes: 15
order: 3
tags: [product, ux, trust, quality]

related:
  - ai/rag-and-retrieval/citations-and-attribution
  - ai/ai-product-thinking/designing-for-nondeterminism
  - ai/llm-foundations/hallucination-and-grounding

resources:
  - title: People + AI Guidebook
    url: https://pair.withgoogle.com/guidebook/
    source: Google PAIR
    type: docs
    minutes: 60
    primary: true
  - title: Citations
    url: https://platform.claude.com/docs/en/build-with-claude/citations
    source: Anthropic
    type: docs
    minutes: 20
  - title: Guidelines for Human-AI Interaction
    url: https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/
    source: Microsoft Research
    type: article
    minutes: 30
---

## In one line

The goal is calibrated trust — users relying on the system where it is reliable and checking it where it is not — which you build by making verification cheap and limits explicit.

## What it is

Both miscalibrations are expensive. **Over-trust** produces users who paste a fabricated citation into a filing or ship generated code without reading it; it is the dangerous one, because it is invisible until it fails. **Under-trust** produces users who check everything manually, which means the feature costs more time than it saves and gets abandoned. Aiming for maximum trust is the wrong objective — the objective is accuracy of trust.

The mechanisms that build it:

**Show the source.** Citations to spans, the retrieved passage, the row the number came from, the query that was run. The value is that a user can verify in a second rather than reconstructing your reasoning. This is also why citation quality matters more than citation presence — references that look authoritative and do not support the claim actively manufacture over-trust.

**Show the work where it is checkable.** For a data question, the SQL. For a calculation, the arithmetic. For a multi-step task, the steps. A reasoning *summary* is a legitimate progress signal, but it is not a faithful account of how the answer was produced and should not be presented as the explanation for a decision.

**Admit uncertainty honestly.** "I don't have information about that in the provided documents" is a better product than a confident guess, and it requires explicitly licensing abstention in the prompt plus a UI that treats a non-answer as a valid result rather than a failure. Do not surface a model-generated confidence score — it is prose, not calibration. Where you need a real signal, derive it from something measurable, like retrieval scores or agreement across samples.

**Be clear about what this is.** Label AI-generated content, say what the feature is good and bad at, and — increasingly a legal requirement rather than a courtesy under EU rules — disclose that users are interacting with an AI system.

**Let users correct it.** Editing, feedback, and reporting close the loop and also signal that you expect to be wrong sometimes, which itself calibrates expectations.

Trust is asymmetric: it is built slowly across many correct answers and destroyed by one confident error the user catches. That asymmetry is the argument for conservative defaults early in a product's life.

## Why it matters

For any product where the model's output informs a decision, trust design is the product. It is also a common founder-round topic because it sits between engineering and product judgement, and the phrase "calibrated trust" — with the observation that maximum trust is the wrong goal — is a genuinely differentiating answer.

## Key points

- The goal is calibrated trust, not maximum trust: reliance where the system is reliable, checking where it is not.
- Over-trust is the dangerous failure because it is invisible until something goes wrong.
- Under-trust kills adoption — if users verify everything manually, the feature costs more than it saves.
- Make verification nearly free: inline citations to spans, the retrieved passage, the query, the steps.
- Citation quality matters more than presence; plausible references that don't support the claim manufacture false confidence.
- A reasoning summary is a progress signal, not a faithful explanation — never present it as why the system decided something.
- Support and display honest abstention; treat "not in the documents" as a valid answer, not an error state.
- Never surface model self-reported confidence; derive any confidence signal from something measurable.
- Disclose AI involvement — increasingly a legal requirement in the EU, not just good practice.
- Trust is slow to build and lost in one caught error, which argues for conservative defaults early.
