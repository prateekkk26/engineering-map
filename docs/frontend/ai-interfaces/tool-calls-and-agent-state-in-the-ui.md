---
title: Tool Calls & Agent State in the UI
summary: Showing what an agent is doing — tool calls, results, approvals and multi-step traces — without turning the screen into a log file.
level: core
minutes: 25
order: 5
tags: [ai, agents, ux]

related:
  - frontend/ai-interfaces/chat-ui-architecture
  - frontend/state-and-data/ui-state-machines
  - ai/agents/agent-vs-workflow

resources:
  - title: Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 30
    primary: true
  - title: Chatbot Tool Usage
    url: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage
    source: Vercel
    type: docs
    minutes: 25
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
---

## In one line

A tool-using turn is a loop — the model asks for a tool, your code runs it, the result goes back — and the UI has to make that legible without showing the user a transcript of machine chatter.

## What it is

Mechanically, the model returns a `tool_use` block naming a tool and its arguments; the arguments stream in as JSON deltas, so they are incomplete until the block closes. Your code executes the tool and sends back a `tool_result` referencing the call's id. The model continues, possibly with more tool calls, until it stops with a final answer. A single user message can therefore produce many blocks across several round trips.

The UI decision is **how much of that to show**. Three levels, and the right one depends on the product. *Invisible*: the user sees only the final answer, with a generic "working" indicator — fine for a search box, wrong for anything the user must trust. *Summarised*: a compact line per step ("Searched the docs", "Read 3 files"), expandable for detail — the sane default. *Full trace*: every call and result, for developer tools and debugging.

Each tool call is a small state machine — pending, running, succeeded, failed — and rendering it as one is what makes a long agent run readable. Show the tool's *intent* in human language rather than the raw function name, and let the arguments and the raw result live behind a disclosure.

**Approval flows** are where this gets product-critical. Anything with side effects — sending a message, writing a file, spending money — should be gated: the UI pauses on the pending call, shows what will happen in plain language with the actual arguments, and waits for a decision. Denial needs a path back to the model with a reason, not a dead end.

Two practical hazards. Long agent runs need progress that is honest — a spinner for ninety seconds reads as broken, so surface the current step. And a failed tool is not a failed turn: pass the error back and let the model recover, rather than ending the conversation.

## Why it matters

Agentic products are what these companies are building, and the interface — not the model — is where trust is won or lost. Interviewers ask how you would show an agent's work, and the strong answer is a level of disclosure chosen deliberately, plus an approval gate on side effects.

## Key points

- Tool arguments stream as JSON deltas and are incomplete until the block closes — do not parse mid-stream.
- A tool result must reference the call's id, and one user turn can span several tool round trips.
- Choose disclosure deliberately: invisible, summarised, or full trace — summarised with expansion is the usual right answer.
- Render each call as a state machine (pending, running, succeeded, failed) and describe intent in human language.
- Gate side-effecting tools behind explicit approval showing the real arguments, with a reasoned denial path.
- Show the current step on long runs; an undifferentiated spinner reads as a hang.
- Return tool errors to the model so it can recover instead of ending the turn.
