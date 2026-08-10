---
title: Tokens & Context Windows
summary: The unit you are billed in, limited by, and truncated at — and the reason English prose, JSON, and Japanese cost wildly different amounts for the same information.
level: core
minutes: 25
order: 2
tags: [llm, fundamentals, cost, context]

related:
  - ai/llm-foundations/how-llms-generate-text
  - ai/working-with-the-api/token-accounting-and-cost
  - ai/prompting-and-context/context-engineering

resources:
  - title: "Let's build the GPT Tokenizer"
    url: https://www.youtube.com/watch?v=zduSFxRajkE
    source: Andrej Karpathy
    type: video
    minutes: 120
    primary: true
  - title: Context windows
    url: https://platform.claude.com/docs/en/build-with-claude/context-windows
    source: Anthropic
    type: docs
    minutes: 10
  - title: Token counting
    url: https://platform.claude.com/docs/en/build-with-claude/token-counting
    source: Anthropic
    type: docs
    minutes: 10
  - title: Tiktokenizer
    url: https://tiktokenizer.vercel.app/
    source: Diagram
    type: repo
    minutes: 5
---

## In one line

A token is a sub-word chunk of text, and the context window is the hard ceiling on how many of them the model can see at once — prompt, conversation history, retrieved documents, tool results, and the response combined.

## What it is

Tokenisers are built by finding the most frequent byte sequences in a training corpus and giving each one an id. Common English words become single tokens. Rarer words split into pieces. Whitespace, punctuation, and capitalisation all matter — `hello`, ` hello`, and `Hello` are three different tokens.

The practical consequences are unevenly distributed. English prose runs roughly four characters per token. Code runs denser in tokens because of indentation, punctuation, and identifier splitting. JSON is worse still — every brace, quote, and colon is paying rent. Non-Latin scripts can be several times more expensive per unit of meaning than English, which quietly makes a multilingual product cost more for exactly the users it was meant to serve. Tokenisation is also why a model miscounts letters in a word: it never sees the letters.

The **context window** is the total token budget for a request. Modern frontier models sit around one million tokens; smaller and cheaper models sit at 200K. Everything shares that budget — system prompt, every prior turn, retrieved chunks, tool definitions, tool results, and the tokens the model is about to generate. `max_tokens` caps the output portion specifically, and on models where reasoning is on by default it caps reasoning plus visible text together, which is a common way to get a truncated answer.

A big window is not a licence to fill it. Cost scales with what you send on every request, latency scales with prefill, and quality degrades before you hit the limit — models reliably attend better to the start and end of a long context than the middle.

Counting matters more than estimating. Every provider exposes a token-counting endpoint; character-count heuristics and other vendors' tokenisers are wrong by 15–30% on ordinary text and much worse on code.

## Why it matters

Tokens are the unit of every conversation about cost, latency, and limits, so they show up in the practical round ("this prompt is too expensive — what would you cut?") and in system design ("how do you handle a 400-page document?"). They are also the source of a whole class of production bugs: truncated responses, silently dropped history, and a bill that grows quadratically across a long chat because you resend the entire transcript every turn.

## Key points

- Everything shares one budget: system prompt, history, tools, retrieved context, and output. `max_tokens` bounds only the output slice, and on reasoning-enabled models it bounds reasoning plus answer together.
- Roughly four characters per token for English prose; code and JSON are denser, and non-Latin scripts can cost several times more for the same meaning.
- Count tokens with the provider's counting endpoint, never with a character heuristic or another vendor's tokeniser.
- A stateless API means an *n*-turn conversation sends O(n²) tokens in total unless you cache the prefix or compact the history.
- Retrieval quality beats context size: models attend worse to the middle of a long context, so a well-chosen 4K of context often beats a dumped 400K.
- The tokeniser explains the party tricks — miscounted letters, mangled rare words, and arithmetic errors on long numbers all come from the model never seeing characters.
- Different models tokenise differently, so token counts and therefore cost do not transfer when you switch model — re-baseline rather than scaling by a constant.
