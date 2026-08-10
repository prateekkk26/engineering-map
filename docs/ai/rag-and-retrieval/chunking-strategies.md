---
title: Chunking Strategies
summary: How you split documents decides what can be retrieved at all — and the fixed-size split everyone starts with is the most common cause of bad answers.
level: core
minutes: 20
order: 2
tags: [rag, retrieval, embeddings]

related:
  - ai/rag-and-retrieval/rag-in-one-picture
  - ai/llm-foundations/embeddings-and-similarity
  - ai/rag-and-retrieval/evaluating-retrieval-quality

resources:
  - title: Introducing Contextual Retrieval
    url: https://www.anthropic.com/news/contextual-retrieval
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: Chunking strategies for LLM applications
    url: https://www.pinecone.io/learn/chunking-strategies/
    source: Pinecone
    type: article
    minutes: 20
  - title: Text splitters
    url: https://python.langchain.com/docs/concepts/text_splitters/
    source: LangChain
    type: docs
    minutes: 20 # unverified
---

## In one line

A chunk is the unit of retrieval, so it should be one coherent idea — large enough to answer a question on its own, small enough that its embedding means something specific.

## What it is

The tension is fundamental. Big chunks carry more context but their embeddings are averages, so they match everything vaguely and nothing precisely. Small chunks embed sharply but arrive at the model as fragments — a sentence about "the limit" with nothing saying which limit, in which product, under which plan.

The strategies, roughly in order of how well they work:

**Fixed-size with overlap** — split every N tokens with a few hundred tokens of overlap. Trivial, and it cuts through the middle of tables, code blocks, and sentences. It is a baseline, not a design.

**Structural** — split on the document's own boundaries: markdown headings, HTML sections, function definitions, slide breaks. Almost always better, because documents are already organised into coherent units by their authors. This should be the default for anything with structure, which is most things.

**Semantic** — split where the topic shifts, detected by embedding successive sentences and cutting where similarity drops. More expensive to index, useful for unstructured prose with no headings.

**Contextual retrieval** — the highest-leverage refinement. Before embedding, prepend a short generated summary situating the chunk in its document ("From the Enterprise billing policy, section on overage charges: ..."). It costs an LLM call per chunk at index time, cached across a document, and it substantially reduces retrieval failures, because the chunk's embedding now encodes what it is about rather than only what it literally says.

Two structural patterns worth knowing. **Small-to-big**: embed small precise chunks for matching, but return the larger parent section to the model — you get retrieval precision with generation context. And **metadata on every chunk**: source, title, section path, date, tenant, permissions. Metadata is what makes filtering, citation, and access control possible, and it is much harder to backfill than to capture during ingestion.

A few things that reliably matter more than the split algorithm: preserve tables and code blocks intact rather than splitting them; keep headings with their content; treat lists as units; and put the document title and section path into the chunk text itself, not only in metadata, so the embedding sees it.

Chunk size should follow the content — a few hundred tokens for dense reference material, larger for narrative — and be tuned against a retrieval eval set, not chosen by convention.

## Why it matters

Chunking is where most RAG quality is won or lost, and it is invisible in the architecture diagram, so it is a good discriminator in interviews: a candidate who says "split on headings, prepend document context, keep tables intact, and tune size against a retrieval eval" has clearly built one. It is also expensive to fix late, since changing the strategy means re-indexing everything.

## Key points

- The chunk is the retrieval unit: it must stand alone as an answer and embed to something specific.
- Fixed-size splitting is a baseline that destroys tables, code, and sentence boundaries — do not ship it as a design.
- Structural splitting on the document's own headings and sections should be the default.
- Contextual retrieval — prepending a generated document-level summary before embedding — is the single biggest cheap win.
- Small-to-big retrieval gets you precise matching plus generous generation context: embed small, return the parent.
- Attach rich metadata at ingestion — source, section path, date, tenant, permissions — because backfilling it later is painful.
- Put titles and section paths into the chunk text, not just metadata, so the embedding captures them.
- Keep tables, code blocks, and lists intact; a split table is unreadable to the model and unciteable to the user.
- Tune chunk size against a retrieval eval set per corpus; there is no universally correct number.
- Changing chunking means re-indexing the whole corpus, so treat it as a migration and version your index.
