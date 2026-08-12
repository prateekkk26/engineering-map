---
title: Prompt Injection
summary: Any text the model reads can act as instructions, and there is no reliable way to separate data from commands — which makes this a design constraint, not a bug to patch.
level: core
minutes: 25
order: 1
tags: [security, llm, agents, threat-model]

related:
  - ai/ai-security/the-lethal-trifecta
  - ai/ai-security/handling-model-output-safely
  - frontend/security/xss-and-output-encoding
  - ai/ai-security/guardrails-and-refusals

resources:
  - title: Prompt injection
    url: https://simonwillison.net/tags/prompt-injection/
    source: Simon Willison
    type: article
    minutes: 40
    primary: true
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
  - title: Mitigating prompt injection
    url: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks
    source: Anthropic
    type: docs
    minutes: 15
---

## In one line

The model sees one undifferentiated stream of tokens, so instructions embedded in a document, a web page, an email, or a tool result are read with the same authority as your system prompt.

## What it is

The comparison to SQL injection is instructive mainly for where it breaks down. SQL injection has a fix — parameterised queries separate code from data at the parser. There is no equivalent here. The model has no parser and no privilege boundary inside the context; "ignore previous instructions" in a retrieved chunk is just more text, and it is text the model was trained to follow.

**Direct injection** is a user trying to override your system prompt — extract it, bypass a restriction, change the persona. Annoying, usually low stakes.

**Indirect injection** is the serious one, because the attacker is not the user. Malicious instructions live in content the model reads on the user's behalf: a web page it fetches, a PDF it summarises, a code comment it reads, a support ticket it triages, a calendar invite, an email, the description of an MCP tool. The user asks something innocuous, the agent reads poisoned content, and acts on the attacker's instructions with the *user's* permissions. Text in an image counts too — a screenshot is an injection vector.

The mitigations, and this is the part that matters: **none of them are reliable, and you must design as if injection will succeed.**

Delimiting untrusted content and instructing the model to treat it as data helps and is trivially bypassed. Input filtering catches known patterns and misses encoding, translation, and novel phrasing. A separate classifier model raises the bar and is itself injectable. Spotlighting — marking provenance so the model knows which spans are untrusted — measurably helps. Instruction hierarchy in newer models makes the system prompt harder to override, and a system-role message mid-conversation is a channel a user cannot spoof, unlike text in a user turn.

All of these reduce probability. None reach zero. So the real defence is architectural and lives outside the model: assume the model can be turned against you, and make sure that is survivable. Least privilege on tools, human approval on irreversible actions, server-side authorisation on every call, egress restrictions, and treating output as untrusted. If a successful injection can only cause an unhelpful answer, you have designed correctly; if it can exfiltrate data or send mail, you have not.

## Why it matters

This is the defining security property of LLM systems and the top entry in the OWASP LLM list. In interviews it is the sharpest test of whether someone understands what they are building: candidates who answer "we'd sanitise the input" have modelled it as an ordinary injection bug. The right answer is that mitigation is probabilistic and containment is architectural — which is also what makes agent permission design a security conversation.

## Key points

- The model cannot distinguish instructions from data; there is no parameterised-query equivalent and no privilege boundary inside the context.
- Indirect injection is the real threat: poisoned content in pages, documents, tickets, emails, tool results, and MCP tool descriptions.
- An injected agent acts with the user's permissions, which is what turns a text attack into a data breach.
- Images are an injection vector — text inside a screenshot is read as instructions.
- Delimiting, filtering, classifiers, spotlighting, and instruction hierarchy all reduce probability and none eliminate it.
- Design for successful injection: least privilege, approval on irreversible actions, server-side authorisation, restricted egress.
- The security question is never "can it be injected" but "what can it do once it is".
- Never let the model's output authorise an action — authorisation belongs in code, checked against the real user.
- A system-role message is a channel users cannot spoof; instructions embedded in user-turn text are not.
- Include injection attempts in your eval suite so mitigations are measured rather than assumed.
