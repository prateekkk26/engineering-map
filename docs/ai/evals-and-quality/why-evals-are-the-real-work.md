---
title: Why Evals Are the Real Work
summary: Without a way to measure quality you cannot tell improvement from regression, which means every change after the demo is a guess.
level: core
minutes: 20
order: 1
tags: [evals, quality, testing, practices]

related:
  - ai/evals-and-quality/building-an-eval-set
  - ai/prompting-and-context/prompt-versioning-and-iteration
  - ai/ai-product-thinking/shipping-and-iterating-on-ai-features

resources:
  - title: Your AI product needs evals
    url: https://hamel.dev/blog/posts/evals/
    source: Hamel Husain
    type: article
    minutes: 35
    primary: true
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
  - title: Create strong empirical evaluations
    url: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    source: Anthropic
    type: docs
    minutes: 20 # unverified
  - title: Evaluating the effectiveness of LLM-evaluators
    url: https://eugeneyan.com/writing/llm-evaluators/
    source: Eugene Yan
    type: article
    minutes: 40
---

## In one line

An eval suite is the test suite for a system with no deterministic output, and building one is the thing that converts an AI demo into an AI product.

## What it is

The pattern is consistent enough to be predictable. A prototype works impressively on the examples it was built against. It ships. Users find failures. Someone changes the prompt, checks the failing case, and ships again. A week later something else is broken and nobody can say which change did it. Progress becomes a random walk, and the team's confidence in its own product quietly collapses.

The cause is missing measurement. Traditional tests assert exact behaviour, which an LLM does not have. So teams skip testing entirely, substituting the demo — and the demo is the set of cases already optimised for.

An eval suite replaces that with: a fixed set of representative inputs, a definition of acceptable output per input, an automated runner, and a score you track over time. That is all. The sophistication of the scoring matters far less than the existence of the set.

Three scoring mechanisms, in order of preference. **Deterministic checks** wherever possible — valid JSON, schema conformance, required field present, code compiles, SQL runs, no PII in the output, correct label for a classification. These are cheap, fast, and unambiguous, and far more of a system is checkable this way than people assume. **LLM-as-judge** for subjective quality — tone, helpfulness, faithfulness to context — with its own reliability caveats. **Human review** on a sample, which is the ground truth everything else is calibrated against and the only way to discover failure modes you did not anticipate.

The economics are what make this worth arguing for. Evals are unglamorous and get deprioritised because they produce no visible feature. But they are what lets a team change a prompt, swap a model, or restructure retrieval without fear — and the ability to iterate quickly compounds. A team with evals ships weekly improvements; a team without ships changes and hopes.

Start absurdly small. Twenty cases in a CSV with a script that runs them and prints a pass rate is more valuable than a six-week evaluation platform, and it can exist this afternoon. The cases come from real failures, so the set grows naturally: every bug becomes a case, exactly like a regression test.

## Why it matters

"How do you evaluate this?" is asked in essentially every AI-focused interview, and the shallow answer — "we look at the outputs" — is immediately recognisable. It is also the single strongest predictor of whether a team's AI product improves over time, which is why hiring managers ask about it rather than about model internals.

## Key points

- Without measurement, every post-demo change is a guess, and quality becomes a random walk.
- The demo is not a test — it is the set of examples you already optimised against.
- An eval suite needs only four things: representative inputs, a definition of acceptable output, a runner, and a tracked score.
- Prefer deterministic checks; far more properties are mechanically checkable than teams assume.
- Use an LLM judge for subjective dimensions, and calibrate it against human review rather than trusting it.
- Human review on a sample is the ground truth and the only source of unanticipated failure modes.
- Twenty cases in a CSV today beats a proper platform next quarter — start smaller than feels respectable.
- Every production failure becomes a permanent case, so the suite grows from real usage rather than imagination.
- Evals are what make model swaps, prompt rewrites, and retrieval changes safe, which is where the compounding value is.
