---
title: AI UX Patterns
summary: The handful of interaction shapes that keep recurring — inline suggestion, command palette, chat, agent-with-approval — and why chat is usually the laziest of them.
level: core
minutes: 20
order: 2
tags: [product, ux, frontend, design]

related:
  - frontend/ai-interfaces/chat-ui-architecture
  - ai/ai-product-thinking/designing-for-nondeterminism
  - ai/agents/human-in-the-loop-and-approvals

resources:
  - title: People + AI Guidebook
    url: https://pair.withgoogle.com/guidebook/
    source: Google PAIR
    type: docs
    minutes: 60
    primary: true
  - title: Shape of AI — UX patterns for AI products
    url: https://www.shapeof.ai/
    source: Emily Campbell
    type: docs
    minutes: 30
  - title: Guidelines for Human-AI Interaction
    url: https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/
    source: Microsoft Research
    type: article
    minutes: 30
---

## In one line

Pick the interaction shape from the task — ambient suggestion, invoked transform, open-ended conversation, or delegated work — rather than defaulting to a chat box because it is the easiest thing to build.

## What it is

**Inline suggestion** — completions that appear in place and are accepted with a keystroke. Highest-value pattern when it fits, because there is no context switch, the cost of a wrong suggestion is one ignored ghost text, and acceptance is a clean quality signal. Autocomplete in editors is the canonical example.

**Selection and transform** — highlight something, invoke an action, get a replacement you can accept or reject. Scoped, predictable, and easy to make reversible. This is where most "AI in an existing product" features should start.

**Command palette or prompt bar** — a single input that routes to capabilities. Discoverable, keyboard-driven, and it avoids the false promise of a chat window by keeping the surface obviously bounded.

**Chat** — open-ended conversation. It is the right shape when the task genuinely requires back-and-forth clarification and the user's intent cannot be expressed in one action. It is the wrong shape far more often than it is used, because a text box implies unlimited capability, hides what the product can actually do, and puts the burden of knowing what to ask on the user. "We added a chatbot" is frequently a decision not to design the feature.

**Agent with approval** — delegate a multi-step task, watch progress, approve consequential steps, review the result. The shape for genuinely long work, and it needs real design attention: visible progress, an interruptible run, legible intermediate steps, and an artifact at the end.

Across all of them, a recurring set of details does most of the work. Stream, so nothing sits blank. Show what the system is doing when it takes several seconds, and name the step rather than showing a spinner. Make the affordances obvious — suggested prompts and example inputs are how users learn the boundaries of a chat surface. Keep output editable rather than final. Provide feedback capture that costs one click. And design the empty, loading, partial, error, and refusal states as first-class, because in this domain they are common, not edge cases.

The deeper point: the best AI features often do not look like AI. A better search ranking, a smarter default, an auto-filled field, a well-sorted inbox — no branding, no chat, just the product working better.

## Why it matters

At AI-forward product companies the practical round is very often a UI on top of a model, and the assessment is not whether it works but whether the interaction was designed. Proposing an inline or transform pattern where it fits — and being able to argue against a chat box — is a strong product-sense signal, and it is precisely the judgement the founder round probes.

## Key points

- Choose the shape from the task: inline suggestion, selection-and-transform, command palette, chat, or delegated agent.
- Inline suggestion is the highest-value pattern where it fits — no context switch, trivial cost of a bad suggestion, clean acceptance signal.
- Selection-and-transform is the right starting point for adding AI to an existing product: scoped, reversible, predictable.
- Chat is over-used; an open text box promises unlimited capability and hides what the product can actually do.
- Reserve chat for tasks that genuinely need iterative clarification.
- Agent-with-approval needs visible progress, interruption, legible steps, and a concrete artifact at the end.
- Stream everything, and name the current step instead of showing an anonymous spinner.
- Suggested prompts and examples are how users discover the boundaries of an open-ended surface.
- Keep output editable, and make feedback a single click.
- Design empty, loading, partial, error, and refusal states first — they are the common path, not the edge.
- The best AI features often look like the product simply working better, with no AI branding at all.
