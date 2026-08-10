---
title: What MCP Is
summary: An open protocol that turns the N×M problem of wiring every model to every tool into a plug-in interface both sides implement once.
level: core
minutes: 20
order: 1
tags: [mcp, tools, architecture, integration]

related:
  - ai/tool-use/what-function-calling-actually-is
  - ai/mcp/mcp-primitives
  - ai/mcp/when-mcp-is-the-wrong-answer

resources:
  - title: Model Context Protocol — Introduction
    url: https://modelcontextprotocol.io/introduction
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Introducing the Model Context Protocol
    url: https://www.anthropic.com/news/model-context-protocol
    source: Anthropic
    type: article
    minutes: 10
  - title: MCP specification
    url: https://modelcontextprotocol.io/specification
    source: Model Context Protocol
    type: docs
    minutes: 40
  - title: modelcontextprotocol on GitHub
    url: https://github.com/modelcontextprotocol
    source: Model Context Protocol
    type: repo
---

## In one line

MCP is a JSON-RPC protocol that lets any AI client discover and call tools, data, and prompts exposed by any MCP server, so an integration is written once instead of once per host application.

## What it is

The problem it solves is combinatorial. Before it, connecting a model to your issue tracker meant writing tool definitions inside whichever application was doing the calling — your own agent, an IDE assistant, a chat client — and every new host meant writing the integration again. With M hosts and N systems you had M×N integrations. MCP makes it M+N: the system exposes one server, every client speaks the protocol.

The architecture is three roles. A **host** is the application the user is in. Inside it, a **client** maintains a one-to-one connection to a **server**, which is the process exposing capabilities. Servers are typically small — a wrapper over an existing API, a database, or a local filesystem — and they are deliberately dumb: the server describes what it can do, the model decides what to invoke.

Underneath it is JSON-RPC 2.0 with a capability handshake on connect: the client asks what the server offers, the server responds, and the client makes those capabilities available to the model as tools. That discovery step is the whole point — capabilities are learned at runtime, not compiled in, so a server can add a tool and every connected client picks it up without redeploying.

Two things about its position in the stack are worth being precise about, because they are commonly muddled. MCP does not replace function calling — it is a **transport and discovery layer on top of it**. The model still emits a `tool_use` block; MCP is how that tool got into the list and how the call reaches the implementation. And MCP is not agent-to-agent communication; it connects an agent to capabilities, not to other agents.

Adoption is the reason it is worth knowing rather than an implementation detail. It was released by Anthropic in late 2024, donated to open governance, and is now supported across major model providers, IDEs, and agent frameworks, with a large ecosystem of servers for the obvious systems — GitHub, Slack, Postgres, Sentry, filesystems, browsers. For most integrations the realistic first question is whether a server already exists.

## Why it matters

MCP appears in job descriptions and design rounds at AI-forward companies as a matter of course now, and the expected answer distinguishes it from plain function calling rather than treating them as synonyms. It is also a genuine architectural decision: exposing your product's capability as an MCP server is how it becomes usable from Claude, Cursor, and everything else at once, which is a distribution argument as much as a technical one.

## Key points

- MCP turns M hosts × N systems into M + N integrations by standardising the interface between them.
- Three roles: host application, client (one per connection), server (the process exposing capabilities).
- It runs on JSON-RPC 2.0 with a capability handshake, so tools are discovered at runtime rather than hard-coded.
- It sits on top of function calling, not instead of it — the model still emits ordinary tool calls.
- It is agent-to-capability, not agent-to-agent; those are different problems with different protocols.
- Servers should be thin wrappers that describe capability; the model does the deciding.
- Runtime discovery means a server can add capabilities without any client redeploying.
- Check for an existing server before writing one — the ecosystem covers most common systems already.
- Exposing your own product as a server is a distribution decision: one server makes it reachable from every MCP-speaking client.
