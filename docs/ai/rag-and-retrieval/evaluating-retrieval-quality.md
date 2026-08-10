---
title: Evaluating Retrieval Quality
summary: Measure the retriever separately from the generator, because a bad answer is usually a retrieval miss and you cannot tell by reading the answer.
level: core
minutes: 20
order: 5
tags: [rag, retrieval, evals, quality]

related:
  - ai/evals-and-quality/building-an-eval-set
  - ai/rag-and-retrieval/hybrid-search-and-reranking
  - ai/rag-and-retrieval/rag-in-one-picture

resources:
  - title: Your AI product needs evals
    url: https://hamel.dev/blog/posts/evals/
    source: Hamel Husain
    type: article
    minutes: 35
    primary: true
  - title: Ragas — evaluation framework for RAG
    url: https://github.com/explodinggradients/ragas
    source: Exploding Gradients
    type: repo
    minutes: 25
  - title: Evaluation measures in information retrieval
    url: https://en.wikipedia.org/wiki/Evaluation_measures_(information_retrieval)
    source: Wikipedia
    type: article
    minutes: 20
---

## In one line

Build a set of questions with the chunks that should answer them, then measure recall and precision at *k* on the retriever alone — before anyone argues about the prompt.

## What it is

A RAG system has two failure surfaces, and the end-to-end answer cannot distinguish them. Either the right material was not retrieved, or it was retrieved and the model ignored, misread, or overrode it. These have completely different fixes — chunking and search versus prompting and model choice — so measuring them separately is the first thing to build.

**Retrieval metrics** come straight from information retrieval and are cheap because they need no model call. **Recall@k**: for what fraction of questions does the correct chunk appear in the top *k*? This is the ceiling on everything downstream, so it is the number to watch. **Precision@k**: how much of what you passed was actually relevant — which matters because noise degrades generation. **MRR** and **NDCG** add rank sensitivity, rewarding the right chunk appearing first rather than eighth, which matters once you rerank.

The eval set is the work, and it does not need to be big — 50 to 100 question-to-chunk pairs is enough to make decisions. Sources, in order of value: real user queries from logs (the only ones with the true distribution), questions your support team actually gets, and, to bootstrap, LLM-generated questions from each chunk ("what question does this passage answer?"). Synthetic questions are a starting point with a known bias — they are phrased like the document, whereas real users are not — so replace them with real queries as soon as you have traffic.

**Generation metrics** sit on top, once retrieval is trusted. The two useful ones are **faithfulness** — is every claim in the answer supported by the retrieved context? — and **answer relevance** — does it address the question? Both are typically scored by an LLM judge against the retrieved chunks, which works reasonably here because the judge has the evidence in front of it. Faithfulness is the one that catches the dangerous failure: a fluent answer that quietly drew on the model's own memory instead of your documents.

Then run it as a suite. Every chunking change, embedding model change, fusion weight, and rerank depth is a hypothesis, and without a regression run you are trading a fix for an unknown number of new misses. Include the negative cases too — questions the corpus genuinely cannot answer — and check the system abstains rather than confabulating.

## Why it matters

"How do you know your RAG system is good?" is a direct probe, and the answer that lands is the split: retrieval metrics first, generation metrics second, with recall@k named as the ceiling. It is also the practical difference between teams who improve their system deliberately and teams who churn on prompt wording while the retriever quietly misses a third of the questions.

## Key points

- Evaluate retrieval separately from generation; the end-to-end answer cannot tell you which one failed.
- Recall@k is the ceiling on answer quality — if the right chunk isn't in the context, nothing downstream can fix it.
- Precision@k matters too, because irrelevant chunks dilute attention and invite wrong-source answers.
- Use MRR or NDCG once reranking is in play, since rank position starts to matter.
- 50–100 question-to-chunk pairs is enough to make decisions; the set does not need to be large.
- Real user queries are the gold standard; LLM-generated questions are a biased bootstrap because they are phrased like the source.
- Faithfulness — every claim supported by retrieved context — is the generation metric that catches answers drawn from model memory.
- Include unanswerable questions and check the system abstains instead of inventing.
- Run the suite on every chunking, embedding, fusion, or rerank change; each is a hypothesis, not an improvement.
- Retrieval metrics need no model call, so they are cheap enough to run on every commit.
