---
title: Context Engineering
summary: The real discipline that replaced prompt engineering — deciding what earns a place in a finite window, and in what order.
level: core
minutes: 25
order: 5
tags: [prompting, llm, architecture, rag]

related:
  - ai/prompting-and-context/context-rot-and-window-management
  - ai/rag-and-retrieval/rag-in-one-picture
  - ai/working-with-the-api/prompt-caching

resources:
  - title: Effective context engineering for AI agents
    url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    source: Anthropic
    type: article
    minutes: 30
    primary: true
  - title: "Lost in the Middle: How Language Models Use Long Contexts"
    url: https://arxiv.org/abs/2307.03172
    source: Liu et al.
    type: article
    minutes: 30
  - title: Context Engineering for Agents
    url: https://blog.langchain.com/context-engineering-for-agents/
    source: LangChain
    type: article
    minutes: 20
---

## In one line

Context engineering is curating the smallest set of high-signal tokens that makes the next model call succeed — a budgeting and retrieval problem, not a wordsmithing one.

## What it is

The window is finite and shared. Into it go the system prompt, tool definitions, conversation history, retrieved documents, tool results, and the output. Every token you add costs money, adds prefill latency, and — this is the non-obvious part — competes for the model's attention with everything else. More context is not monotonically better. Past a point, adding material makes the model worse, because the signal you care about is diluted by material you didn't need.

That gives you a budget to allocate deliberately. A rough working split for a retrieval-backed assistant might be a fifth to instructions and tools, half to retrieved material, a fifth to history, and the rest to output — with the numbers mattering less than the fact that someone chose them and something enforces them.

Position matters as much as inclusion. Models attend most reliably to the beginning and end of a long context and least reliably to the middle — the "lost in the middle" effect. So the practical ordering is stable instructions first (they also anchor the cache), the most relevant retrieved material near the end where the question is, and anything long and low-signal in between or, better, not included.

Then there is what you leave out. **Retrieve, don't dump**: five relevant chunks beat the whole document, and the whole document beats nothing only when it is small. **Summarise older turns** rather than carrying raw transcripts. **Compact tool results** — a 50,000-token API response should be filtered before it enters the context, ideally by code rather than by the model. **Externalise state**: files, scratchpads, and a task list on disk let an agent hold far more than the window, with only the pointer in context. **Load on demand**: tool definitions and instructions that surface only when relevant keep the fixed prefix small.

Two habits make this measurable rather than vibes. Instrument context composition — log how many tokens each source contributed per request, and you will usually find one source quietly consuming most of the window. And test with realistic sizes; a prompt that works beautifully on a two-turn conversation with one document behaves differently at turn forty with fifteen.

## Why it matters

Once a system has retrieval, tools, and multiple turns, context is the thing that determines whether it works, and most quality problems that look like model problems are context problems: the right document wasn't retrieved, the constraint got buried, the history crowded out the question. This is also the shift the field made — "prompt engineer" as a job title has largely dissolved into this, and using the current vocabulary correctly matters in an interview at an AI-forward company.

## Key points

- The window is a shared budget across instructions, tools, history, retrieval, and output; allocate it explicitly rather than letting it fill.
- More context is not better past a point — irrelevant material actively degrades quality by competing for attention.
- Models attend best to the start and end of long contexts, so put stable instructions first and the most relevant material closest to the question.
- Retrieve rather than dump; five good chunks beat a whole document, and a whole document beats a whole corpus.
- Compact aggressively — summarise old turns, filter large tool results in code before they reach the context.
- Externalise state to files or a scratchpad and keep only pointers in context; this is what lets long agent runs work at all.
- Load tools and instructions on demand so the fixed prefix stays small and cacheable.
- Instrument how many tokens each source contributes per request; the culprit is usually one source you weren't watching.
- Test at realistic context sizes — behaviour at turn forty is not behaviour at turn two.
