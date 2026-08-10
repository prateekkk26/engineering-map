---
title: Prompting vs RAG vs Fine-Tuning
summary: The three ways to make a general model do your specific job, and the order you should try them in.
level: core
minutes: 20
order: 6
tags: [llm, fundamentals, architecture, rag]

related:
  - ai/rag-and-retrieval/rag-in-one-picture
  - ai/rag-and-retrieval/when-you-dont-need-rag
  - ai/prompting-and-context/context-engineering

resources:
  - title: Building LLM applications for production
    url: https://huyenchip.com/2023/04/11/llm-engineering.html
    source: Chip Huyen
    type: article
    minutes: 40
    primary: true
  - title: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
    url: https://arxiv.org/abs/2005.11401
    source: Lewis et al.
    type: article
    minutes: 40
  - title: Fine-tuning
    url: https://platform.openai.com/docs/guides/fine-tuning
    source: OpenAI
    type: docs
    minutes: 20
  - title: Introducing Contextual Retrieval
    url: https://www.anthropic.com/news/contextual-retrieval
    source: Anthropic
    type: article
    minutes: 20
---

## In one line

Prompting changes what you ask, RAG changes what the model knows for this request, and fine-tuning changes how the model behaves by default — and you should exhaust them in that order.

## What it is

**Prompting** is instructions, examples, and structure in the context window. It costs nothing to change, deploys instantly, and is the only one of the three you can iterate on in an afternoon. Its ceiling is real but higher than people assume — most "we need to fine-tune" conversations are a prompt that hasn't been given a fair attempt, without examples, without a clear output schema, and without anyone having built an eval set to tell whether it improved.

**RAG** is prompting with a fetch step: retrieve the relevant material at request time and put it in the context. This is the answer whenever the problem is *knowledge* — private documents, current data, per-tenant content, anything that changes. It gives you attribution, access control, and instant updates for free: delete a document and the model stops citing it on the next request. It costs you a retrieval pipeline, an index to maintain, and latency before the first token.

**Fine-tuning** continues training on your examples to shift the weights. It is the answer whenever the problem is *behaviour* rather than knowledge — a house tone of voice, a rigid output format, a domain-specific classification boundary, a task where you want a small cheap model to match a frontier model's quality on one narrow job. It buys shorter prompts and lower per-call cost. It costs a labelled dataset in the low thousands, a training and evaluation loop, and a versioning problem: your fine-tune is pinned to a base model that will be superseded, and the retrain is on you.

The killer detail is that fine-tuning does not reliably teach facts. New knowledge injected through fine-tuning is learned unevenly, forgotten, and cannot be attributed or revoked. "Fine-tune the model on our documentation" is the classic wrong answer to a RAG problem.

They compose. A common mature stack is a well-structured prompt, retrieval for the facts, and — much later, only if the numbers justify it — a fine-tuned small model handling a high-volume narrow step.

## Why it matters

"Would you fine-tune?" is a standard system-design probe, and it is testing judgement about cost and iteration speed, not knowledge of training. The senior answer names the knowledge/behaviour split, insists on evals before any of it, and defends starting cheap. Reaching for fine-tuning early is the most expensive way to be wrong: you spend weeks building a dataset for a problem a prompt change would have solved, and you find out only because you never had a baseline.

## Key points

- Try in order — prompt, then retrieve, then fine-tune. Each step up multiplies iteration cost by roughly an order of magnitude.
- Knowledge problems are retrieval problems. Fine-tuning teaches facts unreliably, cannot cite them, and cannot un-learn them when a document changes.
- Behaviour problems — format, tone, a narrow classification boundary — are what fine-tuning is genuinely good at.
- Fine-tuning's real payoff is usually economic: a small model doing one job at frontier quality for a fraction of the cost and latency.
- A fine-tune is pinned to a base model. Every base-model upgrade is a retrain, which is an ongoing commitment, not a one-off project.
- None of the three can be compared without an eval set. Building the evals is the prerequisite, not a later phase.
- RAG gives you access control and instant revocation as a side effect; weights give you neither, which matters for per-tenant and regulated data.
- The strongest systems combine all three rather than choosing — they are layers, not alternatives.
