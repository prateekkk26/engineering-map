---
title: Embeddings & Similarity
summary: Text as a vector whose direction encodes meaning, which is what makes "find me things like this" a database query instead of a keyword match.
level: core
minutes: 25
order: 4
tags: [llm, fundamentals, retrieval, embeddings]

related:
  - ai/rag-and-retrieval/vector-stores-and-indexing
  - ai/rag-and-retrieval/hybrid-search-and-reranking
  - ai/llm-foundations/how-llms-generate-text

resources:
  - title: What are embeddings?
    url: https://vickiboykis.com/what_are_embeddings/
    source: Vicki Boykis
    type: article
    minutes: 60
    primary: true
  - title: Embeddings
    url: https://platform.openai.com/docs/guides/embeddings
    source: OpenAI
    type: docs
    minutes: 15
  - title: Embeddings
    url: https://platform.claude.com/docs/en/build-with-claude/embeddings
    source: Anthropic
    type: docs
    minutes: 10
  - title: Massive Text Embedding Benchmark (MTEB) leaderboard
    url: https://huggingface.co/spaces/mteb/leaderboard
    source: Hugging Face
    type: repo
    minutes: 10
---

## In one line

An embedding model maps a piece of text to a fixed-length vector positioned so that semantically similar texts land close together, turning "similar meaning" into a distance you can index.

## What it is

An embedding model is a transformer that, instead of predicting the next token, pools its internal representation into one vector — typically 384 to 3,072 dimensions. It is trained so that texts humans consider related end up with a small angle between their vectors. `cancel my subscription` and `how do I stop being billed` share almost no words and sit close together; `bank of the river` and `bank account` share a word and sit apart.

Similarity is almost always **cosine similarity** — the angle between vectors, ignoring magnitude. Most production embeddings are normalised to unit length, at which point cosine similarity and dot product are the same computation, which is why vector databases talk about both interchangeably.

Three properties decide how you use them. Embeddings are **fixed-length regardless of input length**, so a whole document and a three-word query produce vectors of the same shape — and a long document's vector is a blurry average of everything in it, which is the core argument for chunking. They are **model-specific**: vectors from different models, or different versions of the same model, are not comparable, so changing the embedding model means re-embedding your entire corpus. And they are **not reversible in principle but leaky in practice** — inversion attacks can recover meaningful parts of the source text, so an embedding of sensitive data is sensitive data.

The failure mode worth naming is that embeddings capture topical similarity, not the thing you often actually want. They are weak on exact identifiers, product codes, negation, and numbers: `error code 5041` and `error code 5401` are near-identical vectors. That is precisely why serious retrieval systems run keyword search alongside vector search and fuse the results rather than betting on one.

Embeddings do more than retrieval, too — clustering support tickets, deduplication, semantic caching of previous requests, classification by nearest labelled example, and recommendation all fall out of the same primitive, and they are far cheaper than a generation call.

## Why it matters

Every RAG design question bottoms out here, and the interviewer is usually checking whether you know the limits rather than the definition. Saying "embeddings alone will miss the SKU in the query, so I'd run BM25 in parallel and rerank" is the answer that lands. It is also an operational trap in real work: re-embedding a large corpus after a model change is a migration, and teams that did not plan for it end up frozen on an old model.

## Key points

- An embedding is a fixed-length vector; similarity is the cosine of the angle between two of them, which for normalised vectors is just the dot product.
- Vectors from different models — or different versions of one model — are incomparable, so switching the embedding model means re-embedding the whole corpus.
- Embeddings encode topical similarity, and are unreliable on exact identifiers, numbers, and negation; that gap is the reason hybrid search exists.
- One vector per document averages everything in it, so retrieval quality depends heavily on chunking to a coherent unit of meaning.
- Embeddings leak: they can be partially inverted, so treat them with the same care as the source text for privacy and retention purposes.
- Embedding calls are orders of magnitude cheaper than generation, which makes semantic caching, clustering, and classification cheap wins independent of RAG.
- Query and document embeddings do not have to come from the same prompt shape — asymmetric models and query prefixes exist because a short question and a long passage are different distributions.
