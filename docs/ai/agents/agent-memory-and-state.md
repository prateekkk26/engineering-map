---
title: Agent Memory & State
summary: The context window is working memory that vanishes; anything an agent must remember across a long run or a later session has to live somewhere else.
level: core
minutes: 20
order: 4
tags: [agents, llm, architecture, context]

related:
  - ai/prompting-and-context/context-rot-and-window-management
  - ai/prompting-and-context/context-engineering
  - ai/agents/the-agent-loop

resources:
  - title: Effective context engineering for AI agents
    url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    source: Anthropic
    type: article
    minutes: 30
    primary: true
  - title: Memory tool
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
    source: Anthropic
    type: docs
    minutes: 15
  - title: MemGPT — Towards LLMs as Operating Systems
    url: https://arxiv.org/abs/2310.08560
    source: Packer et al.
    type: article
    minutes: 35
  - title: LLM Powered Autonomous Agents
    url: https://lilianweng.github.io/posts/2023-06-23-agent/
    source: Lilian Weng
    type: article
    minutes: 40
---

## In one line

Split state into working memory (the context window, bounded and expensive), durable memory (files or a store, unbounded and cheap), and application state (your database, authoritative) — and be explicit about which is which.

## What it is

The default failure is treating the transcript as the agent's memory. It is not: it is bounded, it degrades as it fills, it is re-sent and re-billed every iteration, and it disappears when the session ends.

**Working memory** is what is in the window right now — the current task, recent tool results, the immediate plan. Keep it small and current. Filter tool output before it lands here.

**Durable memory** is anything the agent should still know later: notes it wrote to itself, a task list, learned conventions about a codebase, per-user preferences. In practice the filesystem is the most effective form — a directory of small Markdown files, one fact per file, that the agent reads and writes with ordinary file tools. Providers now offer this as a first-class memory tool and as managed memory stores, but the shape is the same: unbounded storage, a pointer in context, retrieval on demand.

**Application state** is your database — the ticket, the order, the user record. The agent reads and writes it through tools with real permissions. It is not memory, it is the system of record, and blurring the two is how an agent's "recollection" ends up disagreeing with production data.

Making durable memory work has a few rules that are easy to get wrong. Give the agent a **format and a place**, or it writes sprawling unstructured logs that are useless to retrieve from. Tell it explicitly **when** to read and when to write — models under-reach for memory unless the trigger is spelled out. Keep entries **small and single-purpose** so retrieval can be selective. Prefer **updating over appending**, or the store fills with contradictory versions of the same fact and the agent picks one at random. And **never store secrets there**: memory is replayed verbatim into future contexts, so a credential written once leaks into every later session.

Two more properties worth designing for. Memory needs an eviction and correction path — facts go stale, and an agent confidently applying last month's convention is worse than one with no memory. And it is user-visible surface: for anything personal, people expect to see what was remembered and delete it.

## Why it matters

Memory is what separates an agent that starts from zero every session from one that gets more useful over time, and "how would you give this agent memory?" is a common design follow-up. The strong answer distinguishes the three tiers, picks files-plus-pointers over stuffing history into the prompt, and raises the parts nobody enjoys — staleness, correction, privacy, and deletion.

## Key points

- The context window is working memory: bounded, degrading, re-billed every turn, and gone at session end. Do not treat it as storage.
- Durable memory lives outside the window — files or a memory store — with only a pointer in context and retrieval on demand.
- Application state belongs in your database and is reached through permissioned tools; it is the system of record, not memory.
- Give memory a format, a location, and explicit read/write triggers; without them agents under-use it or produce unusable sprawl.
- One fact per entry, updated in place rather than appended, or the store accumulates contradictions.
- Never write credentials or secrets to memory — it is replayed verbatim into every future session that loads it.
- Plan for staleness and correction; a confidently applied out-of-date fact is worse than no memory.
- Personal memory is user-visible surface: people expect to inspect and delete what was stored about them.
- Reading memory into context costs tokens, so retrieve selectively rather than loading the whole store each run.
