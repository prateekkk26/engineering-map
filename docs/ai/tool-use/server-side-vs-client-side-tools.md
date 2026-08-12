---
title: Server-Side vs Client-Side Tools
summary: Some tools run on the provider's infrastructure and return results inside the same response; the rest run on yours — and the split decides who holds the credentials.
level: deep
minutes: 15
order: 5
tags: [tools, llm, architecture, security]

related:
  - ai/tool-use/what-function-calling-actually-is
  - ai/mcp/what-mcp-is
  - ai/ai-security/agent-permissions-and-blast-radius

resources:
  - title: Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Code execution tool
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool
    source: Anthropic
    type: docs
    minutes: 15
  - title: Web search tool
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
    source: Anthropic
    type: docs
    minutes: 10
---

## In one line

Declare a server-side tool and the provider executes it for you, returning results as content blocks in the same response; declare a client-side tool and you get a `tool_use` block to execute yourself.

## What it is

**Server-side tools** are hosted by the provider. Web search, web fetch, and code execution are the common ones: you add them to the `tools` array and that is the whole integration. The provider runs the search, executes the sandboxed Python, fetches the page, and the results arrive interleaved in the response content. There is no loop to write for these — a single request can contain several rounds of internal tool use before the final answer.

Two consequences. Latency inside one request goes up substantially, because several internal iterations happen before you get anything. And a long internal loop can hit its own iteration cap, coming back with a "paused" stop reason that means *re-send the conversation to continue* rather than *something failed* — code that treats every non-`end_turn` stop as an error will silently truncate answers.

**Client-side tools** are everything specific to you: your database, your API, your business logic. Some are defined by the provider but executed by you — bash, a text editor, a memory backend — where the schema and the model's usage pattern are standardised and the implementation is yours, which is exactly where path-traversal and command-injection checks become your job.

The real decision axis is credentials and data. A server-side tool means the provider's infrastructure performs the action; a client-side tool means yours does, and your secrets never leave your environment. Anything touching customer data, internal systems, or a credential you cannot hand over is client-side by definition. Conversely, a sandboxed code interpreter is genuinely hard to build safely, and using the hosted one is usually the better engineering call than running untrusted model-generated code yourself.

Hosted agent platforms blur the line further — the provider runs the loop and a per-session container, and secrets are injected by a proxy after the request leaves the sandbox, so the container never sees them. That is a real pattern worth knowing, but the underlying question is unchanged: whose infrastructure runs the action, and whose credentials authorise it.

## Why it matters

"Would you use the built-in web search or build your own retrieval?" is a genuine design question with a cost, control, and data-boundary answer rather than a correct one. And the pause-and-resume stop reason is a concrete production bug — an integration that mishandles it truncates long research answers with no error anywhere in the logs.

## Key points

- Server-side tools execute on the provider's infrastructure; results come back as content blocks in the same response with no loop to write.
- Client-side tools return a `tool_use` block for your code to execute — that is where your data and credentials stay.
- A server-side tool can iterate several times inside one request, so latency is higher and a paused stop reason means "re-send to continue", not "failed".
- Some tools are provider-defined but client-executed (bash, text editor, memory); the schema is standardised, the sandboxing is your responsibility.
- Choose by credentials and data boundary first: anything touching your systems or secrets is client-side.
- Hosted code execution is usually safer than rolling your own sandbox for untrusted model-generated code.
- Server-side tools trade control for speed of integration — you cannot customise ranking, filtering, or the result shape.
- On hosted agent platforms, secrets are injected at egress so the sandbox never sees them; the trust question is still whose infrastructure acts.
