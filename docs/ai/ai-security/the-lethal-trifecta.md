---
title: The Lethal Trifecta
summary: Private data, untrusted content, and external communication — any two are fine, all three in one agent is an exfiltration vulnerability by construction.
level: core
minutes: 15
order: 2
tags: [security, agents, threat-model, architecture]

related:
  - ai/ai-security/prompt-injection
  - ai/ai-security/agent-permissions-and-blast-radius
  - ai/agents/human-in-the-loop-and-approvals

resources:
  - title: The lethal trifecta for AI agents
    url: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
    source: Simon Willison
    type: article
    minutes: 20
    primary: true # unverified
  - title: OWASP Top 10 for LLM Applications
    url: https://owasp.org/www-project-top-10-for-large-language-model-applications/
    source: OWASP
    type: docs
    minutes: 30
  - title: Not what you've signed up for — indirect prompt injection
    url: https://arxiv.org/abs/2302.12173
    source: Greshake et al.
    type: article
    minutes: 35
---

## In one line

An agent that can read your private data, ingest attacker-controlled content, and communicate externally can be made to send the first to the third — and no prompt will prevent it.

## What it is

The framing is Simon Willison's, and its value is that it converts a vague worry about agent safety into a checklist you can apply to an architecture diagram in about a minute.

The three capabilities:

**Access to private data** — your email, your repository, your customer records, internal documents. This is usually the entire point of the agent.

**Exposure to untrusted content** — anything an attacker can influence: a fetched web page, an inbound email, a shared document, an issue comment, a support ticket, a package README, a tool result from a third-party service.

**Ability to communicate externally** — sending an email, posting to an API, opening a URL, writing to a public repository, or anything subtler: a rendered image whose URL contains the data, a link the user might click, a DNS lookup.

Any two are safe. Private data plus untrusted content, with no way out, means an attacker can confuse the agent but cannot extract anything. Untrusted content plus external communication, with no private data, means there is nothing worth stealing. Private data plus external communication, with no untrusted input, means nobody is in a position to give the instruction.

All three, and the attack is mechanical: hidden text in a document the agent reads instructs it to search the user's data and encode the results into a request the attacker receives. The user sees a normal answer.

The reason to internalise it is that the third leg is the one teams miss. "The agent can't send email" often coexists with an agent that can fetch URLs, or render markdown images, or write to a wiki. Any channel that carries bytes outward is exfiltration. This is exactly why markdown image rendering in agent output has produced real vulnerabilities in shipped products.

Breaking the triangle is the design move, and it is nearly always the third leg: no external communication without human approval, egress restricted to an allowlist, no automatic URL fetching, no auto-rendering of remote images, and outbound actions shown to the user with their actual contents. Where you cannot remove it, split the system — an agent that reads untrusted content in a session with no private data, and a separate one with data access that never touches attacker-controlled input.

## Why it matters

It is the fastest available audit of an agent design, and interviewers use exactly this shape of question: "your agent reads customer emails and can call our API — what's the risk?" Naming the three legs and identifying which to cut is a complete, credible answer. It has also produced real CVEs in shipped AI products, so it is not theoretical.

## Key points

- Three capabilities — private data, untrusted content, external communication — are safe in any pair and dangerous together.
- The attack needs no exploit: hidden instructions in ingested content tell the agent to read and transmit.
- External communication is broader than it looks: URL fetches, rendered remote images, links, and DNS all carry data out.
- Markdown image rendering in agent output is a real, repeatedly exploited exfiltration channel.
- Cutting the third leg is usually the practical fix: approval gates, egress allowlists, no auto-fetch, no auto-render.
- Where the trifecta is unavoidable, split it across sessions or agents so no single context holds all three.
- Show outbound actions with their real contents before executing, so exfiltration is visible to a human.
- Audit the diagram, not the prompt — this is a capability question and no instruction changes the answer.
- Re-audit whenever a tool is added; one new capability can complete the triangle in a design that was previously safe.
