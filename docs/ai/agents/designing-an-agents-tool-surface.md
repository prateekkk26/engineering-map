---
title: Designing an Agent's Tool Surface
summary: The tools you expose are the agent's entire vocabulary — and choosing between one general tool and twenty specific ones is the highest-leverage design call you make.
level: core
minutes: 20
order: 3
tags: [agents, tools, architecture, security]

related:
  - ai/tool-use/designing-tool-schemas
  - ai/agents/human-in-the-loop-and-approvals
  - ai/ai-security/agent-permissions-and-blast-radius

resources:
  - title: Writing effective tools for agents
    url: https://www.anthropic.com/engineering/writing-tools-for-agents
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
  - title: Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 20
---

## In one line

An agent can only do what its tools allow, so the tool surface simultaneously defines its capability, its blast radius, and what your harness is able to gate, log, or render.

## What it is

The first decision is granularity. A **broad tool** — a shell, a query interface, a code sandbox — gives enormous leverage: the agent can compose actions you never anticipated. What it hands your harness is an opaque string, identical in shape for a harmless read and a destructive write. A **dedicated tool** gives up some flexibility for typed arguments the harness can inspect.

That trade is the whole design. Promote an action from the broad tool to a dedicated one when you need to:

- **gate it** — anything irreversible or outward-facing (sending, publishing, deleting, paying) should be a named tool so approval can hook onto it;
- **enforce an invariant** — an `edit` tool can reject a write when the file changed since it was last read; a shell command cannot;
- **render it** — asking the user a question becomes a modal only if asking is a tool;
- **parallelise it** — the harness can mark a read-only tool safe to run concurrently, but cannot tell a safe `grep` from an unsafe `push` inside a shell string.

The rule of thumb: start broad for reach, promote specific actions as you discover you need to control them.

The second decision is count. Too few and the agent improvises badly. Too many and it picks wrong, and every definition sits in the context on every request. Keep the set small and orthogonal; when it genuinely has to be large, load definitions on demand rather than declaring all of them up front.

Then the details that decide whether the agent uses them well. Descriptions should say **when** to call the tool, not just what it does — trigger conditions measurably improve selection, especially on models that reach for tools conservatively. Parameters should be hard to get wrong: enums over free strings, ids over natural-language references, required fields marked. Results should be shaped for a model rather than a machine — a filtered, labelled, human-readable summary beats a 50,000-token JSON blob, and any large result should be truncated or written to a file with a pointer returned. Errors should say what to do next, because the model will read them and try again.

Finally, tools are a security boundary, not just an API. Every tool is an entry point that untrusted content in the context might trigger, so permissions belong on the tool, enforced server-side, scoped to what the task needs.

## Why it matters

Tool design is where agent projects succeed or fail, and it is a favourite interview probe because it exposes judgement rather than recall: given "an agent that manages support tickets", the tools you name — and which of them you gate — say everything about whether you have thought about failure. In production, the most common cause of an agent that behaves erratically is a tool surface that is too large, too vague, or returning results nobody shaped for a model to read.

## Key points

- Broad tools maximise capability; dedicated tools give the harness typed arguments it can gate, validate, render, and parallelise.
- Promote an action to its own tool when it needs approval, an invariant check, custom UI, or safe concurrency.
- Keep the set small and orthogonal; load definitions on demand when it must be large, since every definition costs context on every call.
- Descriptions should state the trigger condition — when to use this — not only what it does.
- Design parameters so the wrong call is hard: enums, ids, explicit required fields, no free-text where a set exists.
- Shape results for a model: filter, label, summarise, and return a pointer rather than a 50K-token payload.
- Error messages are prompts. Say what went wrong and what to try instead.
- Tools are the security boundary — enforce permissions server-side per tool, never by asking the model nicely in the system prompt.
- Test tools by watching real traces; misuse is nearly always a description or schema problem, not a model problem.
