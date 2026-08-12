---
title: When MCP Is the Wrong Answer
summary: If you control both the model harness and the tool, MCP is a protocol between two things you own — and that indirection buys nothing.
level: core
minutes: 15
order: 5
tags: [mcp, architecture, judgement]

related:
  - ai/mcp/what-mcp-is
  - ai/tool-use/what-function-calling-actually-is
  - ai/agents/agent-vs-workflow

resources:
  - title: Model Context Protocol — Introduction
    url: https://modelcontextprotocol.io/introduction
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Writing effective tools for agents
    url: https://www.anthropic.com/engineering/writing-tools-for-agents
    source: Anthropic
    type: article
    minutes: 25
  - title: Code execution with MCP
    url: https://www.anthropic.com/engineering/code-execution-with-mcp
    source: Anthropic
    type: article
    minutes: 25
---

## In one line

MCP earns its place when the client and the capability are owned by different parties; when you own both ends, a direct function call is simpler, faster, and easier to debug.

## What it is

The protocol's value is interoperability. That value is real when your product's capability should be reachable from Claude, Cursor, and an agent someone else wrote, or when you want to consume a capability someone else maintains without writing the integration. Both are common and both justify it.

It is close to zero in the case people reach for it most: a team building their own agent, calling their own service, and putting MCP in between. Now there is a process to run or an endpoint to operate, a handshake before the first call, a serialisation boundary, an extra failure mode, and a second place tools are defined — for the privilege of talking to code in the next directory. A tool definition and a function call does the same job with a stack trace that goes all the way through.

The other cost is contextual and less obvious. Every connected server's tool definitions sit in the context on every request. Connect five servers of a dozen tools each and you have spent thousands of tokens per call before the user has said anything, and the model is choosing among sixty options — which measurably degrades selection. The mitigations exist (deferred loading, tool search, per-server allowlists, and the newer pattern of having the model write code that calls tools rather than loading every definition up front), but the cheapest mitigation is not connecting servers you do not need.

So the test: **is there a boundary between two parties here?** If yes — someone else's system, someone else's client — MCP is the right shape. If no, use the function calling you already have. And if the honest answer is "not yet, but we'll want it later", note that converting a direct tool into an MCP server is a small refactor, so building it now is speculative work.

Three more cases where it is the wrong tool. **Deterministic pipelines** — if the code decides the sequence, you want a function call, not a discovery protocol. **Latency-critical paths** — the handshake plus an extra hop is real overhead. **Data volume** — pushing large payloads through a tool result to land in a context window is the wrong architecture regardless of protocol; retrieve, filter, and summarise instead.

## Why it matters

MCP is fashionable enough that proposing it is a reflex, and reflexive architecture is precisely what design rounds probe. Being able to say "we own both ends, so this is a function call" — and then name the case that *would* change your mind — is the same judgement as arguing against an agent when a workflow will do. It also matters in practice: teams that MCP-ify their internal tooling inherit an ops burden and a debugging step for no gain.

## Key points

- The value is interoperability across an ownership boundary; without that boundary the protocol is pure indirection.
- Own the harness and the tool? Use function calling directly — fewer moving parts and a stack trace that spans the whole call.
- Every connected server's definitions occupy context on every request, so connecting several servers costs tokens and degrades tool selection.
- Mitigations exist — deferred loading, tool search, allowlists, code-driven invocation — but not connecting unneeded servers is cheaper.
- Converting a direct tool to an MCP server later is a small refactor, so adopting it "for the future" is speculative work.
- Deterministic pipelines want code-controlled calls, not runtime discovery.
- Latency-sensitive paths pay for the handshake and extra hop with nothing in return.
- Large data belongs in retrieval and filtering, not in a tool result pushed through the context window.
- The strongest reasons to build one: you want third-party clients to reach your product, or you want to consume an integration you would otherwise have to maintain.
