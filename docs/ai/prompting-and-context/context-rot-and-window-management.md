---
title: Context Rot & Window Management
summary: Long conversations degrade before they overflow, and the fixes — compaction, context editing, external memory — are now first-class API features.
level: deep
minutes: 20
order: 6
tags: [prompting, llm, agents, architecture]

related:
  - ai/prompting-and-context/context-engineering
  - ai/agents/agent-memory-and-state
  - ai/working-with-the-api/prompt-caching

resources:
  - title: Managing context on the Claude Developer Platform
    url: https://www.anthropic.com/news/context-management
    source: Anthropic
    type: article
    minutes: 20
    primary: true # unverified
  - title: Compaction
    url: https://platform.claude.com/docs/en/build-with-claude/compaction
    source: Anthropic
    type: docs
    minutes: 15
  - title: Context editing
    url: https://platform.claude.com/docs/en/build-with-claude/context-editing
    source: Anthropic
    type: docs
    minutes: 15
  - title: "Lost in the Middle: How Language Models Use Long Contexts"
    url: https://arxiv.org/abs/2307.03172
    source: Liu et al.
    type: article
    minutes: 30
---

## In one line

Quality decays as the context fills with stale turns and dead tool output long before you hit the limit, so long-running sessions need an active strategy for what to drop, summarise, or move out of the window.

## What it is

"Context rot" names the observed decay: as a session grows, the model starts ignoring earlier instructions, repeating work it already did, contradicting decisions from twenty turns ago, and attending to obsolete tool results as if current. It is not a limit error — nothing overflows — it is dilution. The instruction that mattered is now one of four hundred things competing for attention, and most of its competition is the raw output of tool calls whose value expired the moment they were read.

Three mechanisms address it, and they compose.

**Compaction** summarises the earlier conversation into a compact block and continues from there. Providers now offer this server-side: when the transcript approaches a threshold, prior history is replaced by a summary and the session carries on. The critical implementation detail is that the returned compaction block must be passed back on the next request — extracting just the text and appending that silently loses the compaction state.

**Context editing** prunes rather than summarises: clear old tool results, clear thinking blocks, drop the tool inputs that produced them. This is the right tool when the transcript is mostly large, stale tool output — the structure of the conversation is preserved and only the dead weight goes.

**External memory** moves state out of the window entirely — a file, a scratchpad, a notes directory, a task list — with only a pointer in context. This is the only one of the three that survives across sessions, and it is why capable agents write things down: the filesystem is unbounded, the window is not.

Choosing between them: editing prunes within a session, compaction summarises within a session when you approach the limit, memory persists across sessions. A long-running agent typically uses all three.

Manual patterns matter too. Re-anchor critical constraints periodically rather than trusting turn one to hold. Start a fresh session at a natural task boundary instead of letting one thread run forever. Filter tool output in code before it lands in the context. And note the tension with caching: anything that rewrites history invalidates the cached prefix, so compaction is a deliberate spend, not a free optimisation.

## Why it matters

Anything conversational or agentic hits this, and the symptom — "it was great at first and got worse" — is one of the most common real complaints about LLM products. In a system-design round, "the session runs for two hours, how do you keep it coherent?" is a direct probe, and answering with summarise, prune, externalise, plus the caching trade-off is a much stronger answer than "use a bigger context window".

## Key points

- Degradation starts well before the context limit; it is dilution of attention, not overflow, so there is no error to catch.
- The usual bulk of a rotten context is stale tool output, not conversation — filter results in code before they enter.
- Compaction summarises history server-side; the returned compaction block must be echoed back or the state is silently lost.
- Context editing clears old tool results and thinking blocks, preserving structure while dropping dead weight.
- External memory — files, scratchpads, task lists — is the only mechanism that survives across sessions and the only one that is effectively unbounded.
- The three compose: edit within a session, compact near the limit, persist to memory across sessions.
- Re-anchor critical instructions periodically; a constraint stated once at turn one will not hold at turn eighty.
- Rewriting history invalidates the prompt cache, so compaction has a real cost — trigger it deliberately, not on every turn.
- A clean session at a task boundary is often better than heroic management of a long one.
