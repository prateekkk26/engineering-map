---
title: MCP Primitives
summary: Tools, resources, and prompts — three capability types distinguished by who decides to use them, which is the detail most explanations skip.
level: core
minutes: 15
order: 2
tags: [mcp, tools, architecture]

related:
  - ai/mcp/what-mcp-is
  - ai/mcp/building-an-mcp-server
  - ai/tool-use/designing-tool-schemas

resources:
  - title: MCP — Server concepts
    url: https://modelcontextprotocol.io/docs/learn/server-concepts
    source: Model Context Protocol
    type: docs
    minutes: 25
    primary: true # unverified
  - title: MCP specification
    url: https://modelcontextprotocol.io/specification
    source: Model Context Protocol
    type: docs
    minutes: 40
  - title: Example servers
    url: https://github.com/modelcontextprotocol/servers
    source: Model Context Protocol
    type: repo
    minutes: 20
---

## In one line

Servers expose tools (model-controlled actions), resources (application-controlled data), and prompts (user-controlled templates), and the difference between them is who initiates.

## What it is

**Tools** are model-controlled. The server describes an action with a JSON Schema, and the model decides when to invoke it — `create_issue`, `run_query`, `send_message`. These are the primitive everyone uses, and they behave exactly like ordinary function calling once they reach the model. Because the model chooses, tools carry the risk: anything with side effects needs authorisation on the server side and, for irreversible actions, an approval gate in the host.

**Resources** are application-controlled. They are addressable data identified by URI — a file, a schema, a record, a document. The host decides what to attach, not the model. This is the primitive people skip, and skipping it is why so many servers turn every read into a tool call: `list_files` and `read_file` as tools means the model burns turns discovering what a resource listing could have handed over directly. Resources also support templates for parameterised URIs, and subscriptions so a client can be notified when the underlying data changes.

**Prompts** are user-controlled. They are named, parameterised templates the server offers and the user explicitly invokes — the slash commands in an IDE assistant are usually these. The point is that the server, which understands the domain, ships the good workflow rather than expecting every user to write it.

Servers can also ask things of the client. **Sampling** lets a server request a model completion through the host, so a server can use an LLM without holding its own API key or model access. **Elicitation** lets a server ask the user for input mid-operation — a missing parameter, a confirmation. Both invert the usual direction and both require host support, so check before designing around them.

The practical guidance: expose data as resources and actions as tools, and resist the temptation to make everything a tool because tools are the best-supported primitive. Client support is genuinely uneven — most clients implement tools well, fewer implement resources and prompts, and sampling and elicitation are patchier still. That unevenness is real enough that a server aimed at broad compatibility often does need tool-shaped fallbacks for reads, which is a compatibility compromise rather than the design intent.

## Why it matters

Knowing the three primitives and the who-controls-it axis is the difference between describing MCP accurately and describing it as "a way to give models tools". In design terms it changes what you build: a server that models its data as resources gives the host a way to attach exactly the right context, while a server that exposes only tools forces the model to go fishing for it, one round trip at a time.

## Key points

- Three primitives, separated by initiator: tools (model), resources (application), prompts (user).
- Tools are schema-described actions and behave like ordinary function calls once they reach the model.
- Resources are URI-addressable data the host attaches directly — using them avoids wasting model turns on discovery.
- Resources support URI templates for parameterisation and subscriptions for change notification.
- Prompts let the server ship the good workflow as an invocable template rather than leaving it to each user.
- Sampling lets a server request a completion through the host, so servers need no model credentials of their own.
- Elicitation lets a server ask the user for input mid-operation.
- Client support is uneven — tools are universal, resources and prompts less so, sampling and elicitation least — so verify before depending on a primitive.
- Anything with side effects needs authorisation on the server; the model choosing to call it is not authorisation.
