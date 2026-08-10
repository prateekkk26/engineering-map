---
title: Building an MCP Server
summary: A small process that declares capabilities over JSON-RPC — an afternoon's work, where the effort goes into designing the surface rather than the plumbing.
level: deep
minutes: 20
order: 3
tags: [mcp, tools, integration, typescript]

related:
  - ai/mcp/mcp-primitives
  - ai/mcp/transports-and-authorisation
  - ai/tool-use/designing-tool-schemas

resources:
  - title: MCP — Build an MCP server
    url: https://modelcontextprotocol.io/quickstart/server
    source: Model Context Protocol
    type: docs
    minutes: 30
    primary: true
  - title: TypeScript SDK
    url: https://github.com/modelcontextprotocol/typescript-sdk
    source: Model Context Protocol
    type: repo
    minutes: 20
  - title: MCP Inspector
    url: https://github.com/modelcontextprotocol/inspector
    source: Model Context Protocol
    type: repo
    minutes: 10
  - title: Writing effective tools for agents
    url: https://www.anthropic.com/engineering/writing-tools-for-agents
    source: Anthropic
    type: article
    minutes: 25
---

## In one line

Instantiate a server from the SDK, register tools and resources with schemas and handlers, pick a transport, and connect — the protocol work is done for you and the design work is not.

## What it is

The SDKs — TypeScript, Python, and others — reduce the mechanics to declaration. You create a server with a name and version, register each tool with a name, a description, an input schema (Zod or Pydantic, converted to JSON Schema automatically), and an async handler returning content blocks. Resources register with a URI or URI template and a read handler. Then you attach a transport and connect. A useful server is genuinely under a hundred lines.

Which means the work is design, and it is the same work as designing any tool surface — with one addition: **your server has no idea who is calling it.** It might be an IDE assistant, a chat client, or an autonomous agent, with wildly different context and supervision. So the surface has to be self-describing and safe on its own terms, not on the assumption of a careful caller.

Concretely, the things that separate a good server from a wrapper someone generated from an OpenAPI spec:

**Model the workflow, not the endpoints.** A REST API mechanically converted into forty tools is a bad MCP server. Real tasks map to coarse operations — `find_and_update_issue` beats a chain of three lookups — and forty definitions in context degrade selection while costing tokens on every request.

**Shape results for a model.** Return concise, labelled, human-readable text rather than raw API JSON. Truncate large payloads and return a pointer or a summary; an unbounded response can blow out the context of a client you will never see.

**Write descriptions that say when.** The model chooses from the description alone, with no documentation to consult.

**Be defensive at the boundary.** Validate every input, enforce authorisation on the server rather than trusting the caller, apply timeouts and rate limits, and never expose a tool whose blast radius you would not accept from an unsupervised agent.

For development, the Inspector is the standard harness — it connects to your server and lets you list and invoke capabilities interactively without wiring up a real client. Test the server as an ordinary process too: handlers are just functions, and they deserve normal unit tests.

Finally, versioning. Clients discover capabilities at runtime, so removing or changing a tool's schema breaks live sessions with no deploy on their side. Add rather than change, and deprecate in the description before removing.

## Why it matters

"Expose our product to AI clients" is now a routine piece of work, and it is a small enough project that it appears as a take-home. The differentiator is not getting JSON-RPC working — the SDK does that — but designing a surface that behaves well when the caller is an autonomous agent you cannot see and did not write.

## Key points

- The SDKs handle protocol, schema conversion, and transport; a working server is well under a hundred lines.
- Design for an unknown caller — your server may be driven by an unsupervised agent, so safety cannot depend on a careful client.
- Model workflows, not endpoints; a mechanically converted REST API makes a poor server.
- Keep the tool count small — every definition costs context and degrades selection in every connected client.
- Return concise, labelled text shaped for a model, and truncate large payloads rather than dumping raw JSON.
- Descriptions must state when to use the tool, since there is no documentation the model can go read.
- Validate inputs and enforce authorisation server-side; the client is not a trust boundary.
- Use the Inspector for interactive development, and unit-test handlers as ordinary functions.
- Capabilities are discovered at runtime, so schema changes break live clients — add and deprecate rather than change.
