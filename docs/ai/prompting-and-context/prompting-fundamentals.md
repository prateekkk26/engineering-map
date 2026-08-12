---
title: Prompting Fundamentals
summary: The small number of techniques that actually move quality, and why most prompt advice is folklore that stopped being true two model generations ago.
level: core
minutes: 20
order: 1
tags: [prompting, llm, quality]

related:
  - ai/prompting-and-context/system-prompts-and-instruction-design
  - ai/prompting-and-context/few-shot-examples
  - ai/evals-and-quality/why-evals-are-the-real-work

resources:
  - title: Prompt engineering overview
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
    source: Anthropic
    type: docs
    minutes: 25
    primary: true
  - title: Prompt Engineering Guide
    url: https://www.promptingguide.ai/
    source: DAIR.AI
    type: docs
    minutes: 40
  - title: Prompt engineering
    url: https://platform.openai.com/docs/guides/prompt-engineering
    source: OpenAI
    type: docs
    minutes: 20
---

## In one line

Say precisely what you want, show an example of it, give the model the material it needs, and constrain the output shape — the rest of the folklore is mostly noise.

## What it is

A useful prompt does four things, roughly in order of leverage.

**It is specific about the output.** "Summarise this" produces something; "summarise this in three bullets for an engineer deciding whether to read the full document, and skip background" produces the thing you wanted. Vagueness in, variance out. Most disappointing outputs are under-specified requests, not model failures.

**It shows rather than describes.** One well-chosen example of the input/output pair beats three paragraphs describing the format, especially for tone and structure. This is the highest-return-per-token move available.

**It supplies context the model cannot have.** Your schema, your conventions, the relevant document, the user's prior choices. Absent that, the model fills gaps with the most statistically ordinary alternative, which is how you get generic React code that ignores your codebase entirely.

**It constrains the shape.** Schemas, enumerated fields, explicit sections. Structure reduces the space of things that can go wrong and makes the output consumable by code.

Everything else is second-order and increasingly obsolete. "You are an expert senior engineer" was worth something on older models and is close to a no-op now; describing the *task* precisely does the work that the persona used to. "Think step by step" is largely subsumed by models that reason natively. Threats, bribes, all-caps CRITICAL and MUST — these now actively backfire, because current models follow instructions literally and aggressive language causes over-triggering: a tool that fires when it shouldn't, a caveat on every answer.

Two habits that do still matter. **Positive instructions beat negative ones** — "respond in prose" outperforms "do not use bullet points", because a negative instruction still puts the concept in the context. And **structure the prompt itself**: clear delimiters between instructions, context, and data, with the untrusted user data clearly marked as data, which is a security property as well as a clarity one.

The uncomfortable part: none of this is knowable without measurement. Prompt changes that feel obviously better routinely test worse. Ten to fifty real cases with a pass/fail check turns prompting from taste into engineering, and that transition is what the topic is actually about.

## Why it matters

Prompting is the cheapest, fastest lever in an LLM product — an afternoon versus weeks for retrieval or fine-tuning — so it is where every quality conversation starts. Interviews probe it indirectly: given a flaky output, does the candidate reach for a specific instruction, an example, and an eval, or for "we should fine-tune"? Knowing which advice has expired is itself a signal, because a lot of it is still repeated confidently.

## Key points

- Specificity about the desired output is the highest-leverage change; most bad outputs are under-specified requests.
- One concrete example outperforms several paragraphs of description, particularly for format and tone.
- Positive instructions beat negative ones — naming what you don't want still puts it in the context.
- Personas ("you are an expert…") are near-no-ops on current models; describing the task precisely does that work now.
- Aggressive language — CRITICAL, MUST, "always use this tool" — causes over-triggering on instruction-following models. Dial it down rather than adding guardrails.
- Delimit instructions, context, and user data clearly; it improves reliability and is the first line of defence against injection.
- "Think step by step" is largely built in now; reach for effort settings instead of prompting for reasoning.
- No prompt change is real until it is measured on a set of cases — intuition about prompts is reliably wrong.
