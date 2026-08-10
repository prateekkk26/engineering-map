---
title: What Function Calling Actually Is
summary: The model never calls anything — it emits a structured request naming a tool and its arguments, and your code decides whether to honour it.
level: core
minutes: 20
order: 1
tags: [tools, llm, api, integration]

related:
  - ai/agents/the-agent-loop
  - ai/tool-use/designing-tool-schemas
  - ai/working-with-the-api/the-messages-api-shape

resources:
  - title: Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 25
    primary: true
  - title: Function calling
    url: https://platform.openai.com/docs/guides/function-calling
    source: OpenAI
    type: docs
    minutes: 20
  - title: Toolformer — Language Models Can Teach Themselves to Use Tools
    url: https://arxiv.org/abs/2302.04761
    source: Schick et al.
    type: article
    minutes: 30
---

## In one line

You declare a list of tools with JSON schemas, the model responds with a `tool_use` block containing a tool name and validated arguments, and your application executes it and sends the result back as another message.

## What it is

The name is misleading and the misunderstanding is common enough to be worth stating plainly: the model has no network access, no runtime, and no ability to invoke anything. It emits structured text. "Function calling" is a protocol in which the model's output happens to be a well-formed request rather than prose, and every actual side effect happens in your code.

The round trip has four steps. You send `messages` plus a `tools` array, each tool being a name, a description, and a JSON Schema for its inputs. The model responds with `stop_reason: "tool_use"` and one or more `tool_use` blocks, each carrying an `id`, a `name`, and an `input` object. You execute — or refuse to execute — and append a user message containing `tool_result` blocks whose `tool_use_id` matches. You call again, and the model now has the result and continues.

Everything follows from that. The model's request is **advice, not a command**: nothing stops you validating the arguments, checking permissions, asking the user, or returning an error instead. A model that requests `delete_account` has done nothing yet, which is exactly why authorisation belongs in the harness rather than in the prompt.

Reliability comes from the schema. Modern providers validate arguments against it, and `strict` mode guarantees conformance, which turns "hope the JSON parses" into a type. It does not guarantee the arguments are *right* — a well-formed call to the wrong tool with plausible invented ids is the normal failure mode, not malformed JSON.

Two things trip people up in implementation. A `tool_use` block must be echoed back in the assistant message you append, not summarised or dropped, and every one needs a matching `tool_result` — including failures, which return a result with an error flag rather than nothing. And `tool_choice` lets you force the issue: `auto` lets the model decide, `any` requires some tool, a named tool forces that one, and `none` forbids all of them. Forcing a specific tool is the clean way to do one-shot extraction without an agent loop.

## Why it matters

Tool use is the substrate under agents, MCP, retrieval-with-search, and every "connect it to our system" feature, so it comes up constantly. The specific thing interviewers listen for is whether you place the security boundary correctly — candidates who describe the model as "calling our API" have usually not thought about who authorises the call.

## Key points

- The model emits a structured request; your code executes. Nothing happens that your harness did not choose to do.
- Because execution is yours, authorisation, validation, and rate limiting belong in the harness — never as an instruction in the system prompt.
- The contract is a JSON Schema per tool; strict mode makes conforming arguments a guarantee rather than a hope.
- Schema conformance is not correctness — the common failure is a well-formed call to the wrong tool with invented identifiers.
- Echo `tool_use` blocks back verbatim in the assistant message, and return one `tool_result` per call with a matching `tool_use_id`.
- A failed tool returns an error result, not silence; the model can recover from an error and cannot recover from a missing block.
- `tool_choice` controls the decision: `auto`, `any`, a forced named tool, or `none` — forcing one tool is a clean way to do single-shot extraction.
- Tool definitions sit in the prompt on every request, so they cost tokens and belong in the cached prefix.
