---
title: Citations & Attribution
summary: Linking each claim back to the span that supports it — the feature that makes a knowledge product trustworthy and, not coincidentally, more accurate.
level: core
minutes: 15
order: 6
tags: [rag, retrieval, ux, trust]

related:
  - ai/llm-foundations/hallucination-and-grounding
  - ai/ai-product-thinking/trust-transparency-and-citations
  - ai/rag-and-retrieval/rag-in-one-picture

resources:
  - title: Citations
    url: https://platform.claude.com/docs/en/build-with-claude/citations
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Introducing Contextual Retrieval
    url: https://www.anthropic.com/news/contextual-retrieval
    source: Anthropic
    type: article
    minutes: 25
  - title: "Attributed Question Answering: Evaluation and Modeling"
    url: https://arxiv.org/abs/2212.08037
    source: Bohnet et al.
    type: article
    minutes: 30
---

## In one line

Give each sentence of the answer a pointer to the exact span it came from, so a user can verify in one click instead of trusting the model — which also measurably reduces fabrication.

## What it is

There are three implementation levels, and they are meaningfully different in quality.

**Prompted citations** ask the model to tag claims with a source id — "[3]" — and you map ids back to chunks. Cheap, works with any provider, and unreliable in the specific way that matters: the model can cite the wrong chunk, cite a chunk that does not support the claim, or invent an id. You must validate that every id exists before rendering.

**Provider citations** are a first-class feature: you pass documents as structured content blocks with citations enabled, and the response comes back split into text blocks where cited blocks carry an array of references with character or page locations. Because the mechanism, not the model's prose, produces the reference, it cannot point at a document that was not supplied. The trade is that it is generally incompatible with structured output schemas — you get citations or a pinned JSON shape, not both.

**Post-hoc verification** takes the generated answer and independently checks each claim against the retrieved context with a second call. Expensive and slow, worth it in high-stakes domains.

The interesting empirical point is that asking for citations improves answer accuracy, not just verifiability. Requiring the model to point at supporting text pushes it toward answering from the provided material rather than from parametric memory. Attribution is a grounding technique as much as a UI feature.

The UX carries as much of the value as the mechanism. Inline markers that expand into the quoted span beat a list of links at the bottom, because the cost of checking has to be near zero or nobody checks. Show the quoted text, not just a document title. Deep-link into the source at the right position. And handle the uncited sentence honestly — if part of the answer has no support, that is exactly the part the user should be told about, and hiding it is worse than showing an unsupported answer with no citations at all.

Two failure modes to guard against. **Citation theatre**: references that look authoritative and do not support the claim, which is worse than no citations because it manufactures unearned trust. And **broken links**: a chunk that has since been deleted or moved, which requires stable ids and a deletion path that also updates rendered history.

## Why it matters

For any knowledge or research product, citations are the difference between a tool people rely on and a toy they check manually. It is also a very common take-home requirement at AI companies, and the graded detail is whether every rendered citation is validated against a real retrieved chunk — the unvalidated version passes a demo and fails the first user who clicks one.

## Key points

- Three levels: prompted ids (cheap, unreliable), provider-native citations (mechanically grounded), post-hoc verification (expensive, high assurance).
- Always validate that a cited id maps to a real retrieved chunk before rendering — a fabricated reference is worse than none.
- Provider citations cannot reference a document you did not supply, which removes the whole class of invented sources.
- Native citations are usually incompatible with pinned output schemas; pick attribution or structure per feature.
- Requiring citations improves accuracy, because it pushes the model to answer from the supplied context rather than memory.
- Show the quoted span inline, not a bare link — verification has to be nearly free or users skip it.
- Say when part of an answer is unsupported rather than quietly presenting it alongside cited claims.
- Citation theatre — plausible references that do not support the claim — manufactures trust you have not earned.
- Use stable chunk ids and make deletion propagate, or citations rot into broken links.
