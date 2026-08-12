---
title: RAG in One Picture
summary: Index your documents once, retrieve the few relevant pieces at question time, put them in the prompt — and accept that retrieval quality, not the model, decides whether it works.
level: core
minutes: 25
order: 1
tags: [rag, retrieval, architecture]

related:
  - ai/llm-foundations/prompting-vs-rag-vs-fine-tuning
  - ai/rag-and-retrieval/chunking-strategies
  - ai/rag-and-retrieval/when-you-dont-need-rag

resources:
  - title: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
    url: https://arxiv.org/abs/2005.11401
    source: Lewis et al.
    type: article
    minutes: 40
    primary: true
  - title: Introducing Contextual Retrieval
    url: https://www.anthropic.com/news/contextual-retrieval
    source: Anthropic
    type: article
    minutes: 25
  - title: Retrieval augmented generation (RAG)
    url: https://platform.openai.com/docs/guides/retrieval
    source: OpenAI
    type: docs
    minutes: 15
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
---

## In one line

RAG is two pipelines: an offline one that splits documents into chunks and indexes them, and an online one that turns a question into a search, puts the top results into the prompt, and asks the model to answer from them.

## What it is

**Indexing**, offline: load documents, split them into chunks, embed each chunk, and store the vectors alongside the text and metadata. This runs when content changes, not when a user asks something.

**Retrieval and generation**, online: take the question, search the index, take the top *k* chunks, assemble a prompt that contains those chunks plus the question plus an instruction to answer only from the provided material, call the model, and return the answer with citations back to the chunks.

That is the whole architecture, and it has been the default for knowledge products since 2020 for good reasons: knowledge updates instantly when a document changes, answers can cite their sources, access control is enforceable at retrieval time, and nothing needs training.

The thing worth internalising is where quality actually comes from. **If retrieval returns the wrong chunks, no model can save the answer.** Most disappointing RAG systems are retrieval failures wearing a generation costume, and teams misdiagnose them because the symptom — a confidently wrong answer — looks like a model problem. When a RAG system underperforms, measure retrieval first, in isolation: did the chunk containing the answer appear in the top *k*? That number, not the answer quality, is what you improve.

The naive pipeline is a starting point, and the standard upgrades are all about getting better chunks in front of the model. **Hybrid search** adds keyword matching alongside vectors, because embeddings miss exact identifiers. **Reranking** retrieves generously then reorders with a cross-encoder that reads query and chunk together. **Query rewriting** turns "what about the second one?" into a standalone searchable question, which naive systems get badly wrong in multi-turn conversations. **Contextual retrieval** prepends a short document-level summary to each chunk before embedding, which substantially reduces the failure where a chunk is meaningless without its surroundings. **Metadata filtering** narrows by tenant, date, or document type before the semantic search runs.

The operational realities: the index is a system that needs freshness, re-embedding on model changes, and deletion that actually propagates; access control must be applied at retrieval, since anything retrieved is effectively disclosed; and retrieval adds latency before the first token, which shapes the UI.

## Why it matters

RAG is the single most common architecture in AI products, so "design a system that answers questions over our documentation" is a near-guaranteed design prompt. The senior answer moves quickly past the basic diagram to chunking, hybrid search, reranking, evaluation, access control, and freshness — and names retrieval quality as the thing that determines success.

## Key points

- Two pipelines: offline indexing (split, embed, store) and online retrieval-and-generation (search, assemble, answer, cite).
- Retrieval quality is the ceiling on answer quality; measure whether the right chunk appeared in the top *k* before touching the prompt or the model.
- RAG gives instant updates, citations, and access control — three things fine-tuning cannot give you at all.
- Hybrid search is close to mandatory: pure vector search misses identifiers, codes, and exact terms.
- Rerank a generous candidate set rather than trusting the first *k* from the vector store.
- Rewrite the query for standalone searchability in multi-turn conversations; raw follow-up questions retrieve badly.
- Contextual retrieval — prepending document-level context to each chunk before embedding — is a large, cheap accuracy win.
- Apply access control at retrieval time; a chunk in the prompt is disclosed regardless of what the answer says.
- Retrieval sits in the latency path before the first token, so budget it and consider showing a retrieval step in the UI.
