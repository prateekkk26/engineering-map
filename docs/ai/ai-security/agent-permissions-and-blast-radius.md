---
title: Agent Permissions & Blast Radius
summary: An agent acts with whatever credentials you hand it, so the security question is not whether it will misbehave but what the worst run can reach.
level: core
minutes: 20
order: 4
tags: [security, agents, architecture, auth]

related:
  - ai/agents/human-in-the-loop-and-approvals
  - ai/ai-security/the-lethal-trifecta
  - ai/mcp/transports-and-authorisation

resources:
  - title: OWASP Top 10 for LLM Applications
    url: https://owasp.org/www-project-top-10-for-large-language-model-applications/
    source: OWASP
    type: docs
    minutes: 30
    primary: true
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
  - title: Writing effective tools for agents
    url: https://www.anthropic.com/engineering/writing-tools-for-agents
    source: Anthropic
    type: article
    minutes: 25
---

## In one line

Scope every credential to the task, enforce authorisation server-side per call, and design so that a fully compromised agent run does damage you can absorb.

## What it is

Excessive agency is its own entry in the OWASP LLM list, and it usually arrives the same way: the agent needs to do several things, so it gets a broad token, and nobody revisits it. Then one injected instruction has the run of your systems.

The controls, in order of importance.

**Scope the credential, not the prompt.** An agent that reads tickets gets read-only ticket access — not an admin key with an instruction to be careful. Per-tenant, per-user, per-task tokens with short lifetimes. If the agent acts on a user's behalf, it should carry that user's permissions, so it can never reach anything they could not reach themselves. The alternative — a service account with union-of-everyone access — turns any injection into a cross-tenant breach.

**Authorise every call server-side.** The tool handler checks the authenticated principal against the resource, on every invocation. The model requesting something is not authorisation, and neither is a check the model performed.

**Sandbox execution.** Code and shell tools run in an isolated environment: no ambient credentials, restricted egress, resource and time limits, and a filesystem containment check on every path.

**Keep secrets out of the context.** A key in the system prompt is in every request, every log, every trace, and every compaction summary, and the model can echo it. Inject credentials at the boundary — a proxy that adds the header after the request leaves the agent's environment — so the agent can act without ever holding the secret.

**Bound the run.** Iteration caps, token budgets, wall-clock deadlines, and per-tool rate limits. A runaway agent making thousands of calls is both a cost incident and, against a third-party API, an availability incident you caused.

**Make it reversible.** Soft deletes, snapshots, branches, staged changes, and a kill switch. Recoverability is frequently cheaper to build than prevention and lets the agent move faster.

And log for forensics: every tool call with arguments, results, the acting principal, and the trace id. After an incident, the question is what it touched, and only the log answers.

## Why it matters

This is the question a security reviewer asks first about any agent, and it is a standard senior interview probe because it separates capability thinking from prompt thinking. The strong answer never says "we'd tell it not to" — it scopes credentials, authorises server-side, bounds the run, and makes actions reversible, then describes the worst case as something survivable.

## Key points

- Excessive agency is the common failure: a broad credential granted for convenience and never narrowed.
- Scope credentials per tenant, per user, and per task, with short lifetimes — never a shared admin key.
- Where the agent acts for a user, give it that user's permissions so it cannot exceed them.
- Authorise every tool call server-side against the authenticated principal; the model's request is not a grant.
- Sandbox code and shell execution with no ambient credentials, restricted egress, and path containment.
- Keep secrets out of the context entirely — inject them at the egress boundary instead.
- Bound runs with iteration caps, token budgets, deadlines, and per-tool rate limits.
- Prefer reversibility — soft deletes, snapshots, staged changes, a kill switch — over trying to prevent every mistake.
- Log every tool call with arguments, principal, and trace id, because incident response depends on it.
- Design to the worst run, not the typical one; assume the agent is fully controlled by an attacker and check what that reaches.
