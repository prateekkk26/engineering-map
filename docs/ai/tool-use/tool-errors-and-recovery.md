---
title: Tool Errors & Recovery
summary: An error result is a prompt — how you word a failure decides whether the model fixes its call, gives up, or loops forever.
level: core
minutes: 15
order: 4
tags: [tools, llm, reliability, agents]

related:
  - ai/tool-use/designing-tool-schemas
  - ai/agents/debugging-and-observing-agents
  - ai/working-with-the-api/rate-limits-and-retries

resources:
  - title: Writing effective tools for agents
    url: https://www.anthropic.com/engineering/writing-tools-for-agents
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 20
  - title: Handling stop reasons
    url: https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons
    source: Anthropic
    type: docs
    minutes: 10
---

## In one line

Return failures as `tool_result` blocks flagged as errors, with text that says what went wrong and what to try instead — never as an exception that kills the loop or a block you quietly omit.

## What it is

Tools fail constantly in production: bad arguments, a missing record, a timeout, a permission denial, a rate limit upstream. The model is unusually good at recovering from all of these *if you tell it what happened*, and completely helpless if you don't.

The mechanics first. A failure still returns a `tool_result` with the matching `tool_use_id` and an error flag set. Dropping the block breaks the pairing and the next request errors. Throwing an exception that unwinds the agent loop turns a recoverable hiccup into a dead session.

Then the wording, which is where the leverage is. Compare `Error: 400 Bad Request` with `No customer found with email "x@y.com". Search by name with search_customers, or check the spelling.` The first produces a retry of the identical call or an apology to the user; the second produces a corrected call. Error text is read by a model, so write it as instruction: state the cause, and name the next action. Include the valid options when a value was rejected — an invalid enum error that lists the accepted values is fixed on the next turn essentially every time.

Classify failures by who should handle them:

- **Model-fixable** — bad arguments, wrong tool, malformed value, not-found. Return a descriptive error and let it retry.
- **Harness-fixable** — timeouts, 429s, transient 5xx. Retry with backoff *inside the tool* before the model ever sees it; a model retry costs a full round trip to solve something your code solves in milliseconds.
- **Terminal** — permission denied, resource gone, budget exhausted. Say so unambiguously and make clear not to retry, or you get a loop.

That loop risk is the thing to instrument. The classic pathology is an uninformative error, an identical retry, and repeat until the iteration cap. Detect repeated identical calls, cap per-tool retries, and after two failures of the same tool tell the model explicitly to stop and try a different approach.

Two design notes. Success responses should carry the information needed to avoid the *next* error — return the valid range, the current state, the available options. And an empty result is not an error: "no matches" should say so plainly, because a bare `[]` is regularly interpreted as a malfunction and retried.

## Why it matters

Error handling is what separates an agent that degrades gracefully from one that gets stuck on turn three of a ten-step task, and it comes up whenever an interviewer asks what happens when a tool fails. It is also cheap and rarely done — most teams return their raw API error payloads and then wonder why the agent flails.

## Key points

- A failure returns a `tool_result` with an error flag, never a dropped block or a thrown exception that ends the loop.
- Error text is a prompt: state the cause and name the corrective action.
- When a value is rejected, list the valid ones — the next call is then almost always correct.
- Retry transient failures inside the tool with backoff; a model-level retry wastes a full round trip on something your code fixes instantly.
- Mark terminal failures — permissions, missing resources, exhausted budgets — as do-not-retry, explicitly.
- Detect repeated identical calls and cap per-tool retries; the uninformative-error loop is the most common way an agent burns its iteration budget.
- After two failures of the same tool, instruct the model to change approach rather than try again.
- Empty results are not errors — say "no matches found", because a bare empty array reads as a malfunction.
- Return enough on success to prevent the next error: valid ranges, current state, available options.
