---
title: System Prompts & Instruction Design
summary: The stable instruction block that defines your product's behaviour — how to structure it, and why it should almost never change mid-conversation.
level: core
minutes: 20
order: 2
tags: [prompting, llm, architecture]

related:
  - ai/prompting-and-context/prompting-fundamentals
  - ai/working-with-the-api/prompt-caching
  - ai/ai-security/prompt-injection

resources:
  - title: System prompts
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts
    source: Anthropic
    type: docs
    minutes: 15
    primary: true # unverified
  - title: Claude Code best practices
    url: https://www.anthropic.com/engineering/claude-code-best-practices
    source: Anthropic
    type: article
    minutes: 25
  - title: Leaked system prompts collection
    url: https://github.com/jujumilk3/leaked-system-prompts
    source: jujumilk3
    type: repo
    minutes: 30
---

## In one line

The system prompt is a separate top-level field carrying the instructions that hold for every request — which makes it both the definition of your product's behaviour and the natural cache boundary.

## What it is

It is not just "a message with special powers". It sits outside the conversation, it carries more instruction-following weight than user text, and because it renders first it is the prefix everything else is cached against. Those three properties determine how you should use it.

What belongs in it: role and scope, the rules that always apply, output format conventions, the tone, what to do when the model doesn't know, and how to use the available tools. What does not: the user's current question, retrieved documents for this request, timestamps, per-request identifiers, and anything else that changes per call. Those go in messages — partly for clarity, mostly because interpolating a volatile value into the system prompt invalidates your cache for every request that follows it.

Structure matters at length. Real production system prompts run to thousands of tokens and read like a specification: clearly delimited sections (role, capabilities, constraints, output format, examples), one rule per line, concrete rather than abstract. XML-style tags or markdown headings both work; consistency matters more than the choice. Put the most important constraints at the beginning and repeat the critical one near the end, because attention is strongest at the boundaries.

Two failure modes recur. **Instruction pile-up**: every bug gets a new line, nobody removes anything, and after six months you have a 4,000-token prompt with rules that contradict each other and a model that follows the wrong one. Treat it as code — review it, delete from it, and test changes against your eval set. **Over-emphasis**: current models follow instructions closely, so the "CRITICAL: YOU MUST" phrasing written to overcome an older model's reluctance now causes over-triggering.

When something has to change mid-conversation — a mode switch, freshly learned context, a toggled setting — do not rewrite the top-level system prompt. That changes the front of the prefix and re-bills the whole cached transcript. Newer models accept a system-role message appended to the conversation instead: it preserves the cache and, importantly, it is a channel a user cannot spoof, unlike an instruction embedded in a user turn.

Finally: assume it will leak. Users extract system prompts routinely. Nothing secret, no credentials, no security-by-obscurity.

## Why it matters

For most AI products the system prompt *is* the product logic — it is where behaviour is specified, and it is the artifact you iterate on most. Interviewers ask what goes in it versus the user turn, and the answer reveals whether you understand caching, instruction hierarchy, and injection boundaries. In real work, an unowned, unreviewed, ever-growing system prompt is one of the more common quality regressions.

## Key points

- The system prompt is a separate top-level field, carries elevated instruction weight, and renders first — which makes it the cache prefix.
- Only stable content belongs there. Per-request context, retrieved documents, and timestamps go in messages, or you invalidate the cache on every call.
- At length, structure it like a spec: delimited sections, one rule per line, critical constraints at the start and echoed at the end.
- Prune it. An append-only system prompt accumulates contradictory rules and silently degrades quality.
- Version it with the code and test changes against evals — it is production logic, not configuration.
- Drop the aggressive emphasis; current models over-trigger on CRITICAL/MUST phrasing written for older ones.
- To change instructions mid-conversation, append a system-role message rather than editing the top-level prompt — it preserves the cache and cannot be spoofed by user input.
- Assume the system prompt will be extracted; never put secrets or access rules that only work if unknown in it.
