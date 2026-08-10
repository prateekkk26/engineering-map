---
title: How LLMs Generate Text
summary: A model scores every possible next token given everything before it, one token picked at a time — and almost every strange behaviour you will debug follows from that.
level: core
minutes: 25
order: 1
tags: [llm, fundamentals, inference]

related:
  - ai/llm-foundations/tokens-and-context-windows
  - ai/llm-foundations/sampling-and-determinism
  - ai/llm-foundations/hallucination-and-grounding

resources:
  - title: "[1hr Talk] Intro to Large Language Models"
    url: https://www.youtube.com/watch?v=zjkBMFhNj_g
    source: Andrej Karpathy
    type: video
    minutes: 60
    primary: true
  - title: LLM Visualization
    url: https://bbycroft.net/llm
    source: Brendan Bycroft
    type: article
    minutes: 20
  - title: Attention Is All You Need
    url: https://arxiv.org/abs/1706.03762
    source: Vaswani et al.
    type: article
    minutes: 40
  - title: Deep Dive into LLMs like ChatGPT
    url: https://www.youtube.com/watch?v=7xTGNNLPyMI
    source: Andrej Karpathy
    type: video
    minutes: 210
---

## In one line

An LLM is a function from a sequence of tokens to a probability distribution over the next token, run in a loop with its own output fed back in.

## What it is

Text goes in as **tokens** — sub-word chunks from a fixed vocabulary. Each token becomes a vector, the stack of transformer layers mixes those vectors together using attention so that every position can look at every earlier position, and the final layer produces a score for each of the ~100,000 tokens in the vocabulary. Softmax turns those scores into probabilities. One token is picked. It gets appended to the input, and the whole thing runs again.

That loop is the entire generation model. There is no plan, no draft, no internal document being read out. The thousandth token of a response is produced by the same forward pass as the first, with a slightly longer prefix.

Two phases matter operationally. **Prefill** processes your whole prompt in one parallel pass — expensive in compute, but it happens once, which is why input tokens are cheaper than output tokens and why a 50,000-token prompt is not 50,000 times slower than a 1,000-token one. **Decode** produces output tokens one at a time, each requiring a full pass over the model, which is why time-to-last-token scales linearly with response length and why streaming exists at all. Time-to-first-token is roughly prefill; everything after is decode.

The weights are frozen at inference. The model does not learn from your conversation — everything it "remembers" is text sitting in the context window and re-read from scratch on every single request. A ten-turn chat sends all ten turns every time.

Reasoning models complicate the picture slightly but not fundamentally: they generate a long stretch of intermediate tokens before the visible answer. It is the same loop, just with more tokens spent before the part you show the user.

## Why it matters

This one mental model explains most of what an interviewer will probe. Why does the model invent a plausible citation? Because a plausible token is exactly what it optimises for. Why is your streaming UI worth building? Because decode is inherently sequential. Why does cost scale the way it does? Prefill versus decode. Why does the model forget the constraint from turn two? Because it is competing with everything else in the window.

Candidates who can explain a failure in terms of next-token prediction are visibly different from candidates who describe the model as thinking or looking things up.

## Key points

- Generation is autoregressive: the model's own output becomes its next input, so an early wrong token biases everything after it and the model will not spontaneously go back and fix it.
- The model outputs a distribution, not an answer — "confidence" in the text is generated prose, unrelated to the actual probabilities.
- Prefill is parallel and one-shot; decode is sequential and per-token. That asymmetry is the reason output tokens cost several times more than input tokens.
- Weights are frozen at inference time. Nothing you send in a conversation updates the model; context is the only channel.
- The API is stateless — a multi-turn conversation is re-sent in full on every request, which is why token cost grows quadratically over a long chat unless you cache or compact.
- Attention lets every position see every earlier position, which is what makes long-range instruction following possible and why cost grows faster than linearly with context length.
- A model with no relevant training data and no retrieved context will still produce fluent, well-formed, wrong text — there is no "I don't know" state built into the mechanism.
