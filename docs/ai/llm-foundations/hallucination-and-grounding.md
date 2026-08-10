---
title: Hallucination & Grounding
summary: Why a fluent, confident, completely invented answer is the system working as designed, and what actually reduces it.
level: core
minutes: 20
order: 5
tags: [llm, fundamentals, quality, rag]

related:
  - ai/llm-foundations/how-llms-generate-text
  - ai/rag-and-retrieval/rag-in-one-picture
  - ai/rag-and-retrieval/citations-and-attribution

resources:
  - title: Why Language Models Hallucinate
    url: https://arxiv.org/abs/2509.04664
    source: OpenAI
    type: article
    minutes: 30
    primary: true # unverified
  - title: Reduce hallucinations
    url: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
    source: Anthropic
    type: docs
    minutes: 10 # unverified
  - title: Citations
    url: https://platform.claude.com/docs/en/build-with-claude/citations
    source: Anthropic
    type: docs
    minutes: 10
  - title: Survey of Hallucination in Natural Language Generation
    url: https://arxiv.org/abs/2202.03629
    source: Ji et al.
    type: article
    minutes: 45
---

## In one line

A model always produces the most plausible continuation, and plausible-but-false is indistinguishable from plausible-and-true from inside the mechanism — so the fix is not better instructions but putting the truth in the context and making the answer checkable.

## What it is

Hallucination is not a bug that gets patched. The model has no representation of "I looked this up" versus "this pattern fits"; both produce tokens the same way. Worse, the training and evaluation regime rewards guessing: a plausible answer scores better than an abstention on almost every benchmark, so models are selected for confident answers rather than calibrated ones.

Some shapes recur. **Fabricated specifics** — citations, URLs, API methods, case numbers — are the most dangerous because they look exactly like the real thing; a made-up function name is well-formed, idiomatic, and doesn't exist. **Confident extrapolation past the training cutoff** produces answers about versions and events the model cannot know about. **Answering from the wrong source** happens when retrieved context is present but thin, and the model quietly falls back on parametric memory. **Instruction drift** in long conversations reintroduces constraints the user removed twenty turns ago.

Grounding is the family of countermeasures, and they work in a rough order of effectiveness. Put the source material in the context (retrieval) so the answer is a reading-comprehension task rather than a recall task. Require **citations back to spans in that material**, which both improves accuracy and gives the user a way to check. Give the model a **licensed way out** — an explicit instruction that "the context does not contain this" is a correct and expected answer, since without it the pressure is entirely toward producing something. Constrain the output shape so the model fills known fields rather than composing free prose. Where correctness is verifiable — code, SQL, arithmetic, a schema — let it run the check and iterate, which is far more reliable than asking it to be careful.

What barely works: telling the model not to hallucinate, and asking it how confident it is. Self-reported confidence is generated text, not a probability.

## Why it matters

This is the first question a sceptical hiring manager asks about any AI feature: "what happens when it's wrong?" The answer that lands is architectural — retrieval, citations, an abstention path, verification for anything checkable, and a UI that makes the source visible — not a promise that a better prompt will fix it. It is also the concrete reason a feature ships with a citation panel and a thumbs-down button rather than as an oracle.

## Key points

- Hallucination is the same mechanism as correct output; the model cannot distinguish recall from plausible pattern-completion, so it cannot warn you.
- Benchmarks and training reward answering over abstaining, which is why models guess confidently rather than saying they don't know.
- Retrieval is the highest-leverage mitigation because it converts a memory task into a reading-comprehension task.
- Explicitly licensing "not in the provided context" as an acceptable answer measurably raises abstention on unanswerable questions; without it the model has no incentive to abstain.
- Span-level citations serve two purposes — they reduce fabrication and they make it cheap for the user to catch the cases that survive.
- Self-reported confidence is prose, not calibration. Never gate a decision on the model saying it is sure.
- For anything machine-checkable — code, SQL, JSON schema, arithmetic — run the check and feed failures back; verification beats persuasion.
- Fabricated specifics are the highest-risk shape because they are syntactically perfect; validate identifiers, URLs, and API names against a real source before showing them.
