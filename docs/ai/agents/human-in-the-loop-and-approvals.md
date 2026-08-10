---
title: Human in the Loop & Approvals
summary: Deciding which actions an agent may take alone, which need a human, and how to ask without making the product unusable.
level: core
minutes: 20
order: 5
tags: [agents, security, ux, product]

related:
  - ai/ai-security/agent-permissions-and-blast-radius
  - ai/agents/designing-an-agents-tool-surface
  - ai/ai-product-thinking/designing-for-nondeterminism

resources:
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: Claude Code best practices
    url: https://www.anthropic.com/engineering/claude-code-best-practices
    source: Anthropic
    type: article
    minutes: 25
  - title: OWASP Top 10 for LLM Applications
    url: https://owasp.org/www-project-top-10-for-large-language-model-applications/
    source: OWASP
    type: docs
    minutes: 30
---

## In one line

Sort actions by reversibility and blast radius, let the agent run freely on the reversible ones, and require an explicit human decision on the rest — enforced in the harness, not requested in the prompt.

## What it is

The useful axis is not "risky/safe" but **how expensive it is to undo**. Reading a file, running a query, drafting text — all trivially reversible, so gating them just makes the product slow and trains people to click approve without reading. Sending an email, merging a PR, deleting records, moving money, posting publicly — irreversible or externally visible, so those need a decision from a person who can actually evaluate it.

Mechanically, approval is a property of the tool. A per-tool policy of allow-always versus always-ask means the harness pauses the loop when a gated tool is called, surfaces the pending call, and waits for allow or deny. Two details make this work in practice: a denial should carry a **reason** back to the model so it can adapt rather than retry the same thing, and the pause must survive a dropped connection — an agent parked on a pending approval with no client listening is a deadlock.

The UX is where these usually fail. An approval prompt has to show the **actual arguments**, in a form a human can evaluate — the recipient and body, the diff, the rows about to change — not "the agent wants to call `send_email`". It should offer edit and not only yes/no. And it needs a batching story, because approving forty file writes one at a time is how a team ends up rubber-stamping. Scoped trust — "allow this tool for this session", "auto-approve within this directory" — is what keeps approval meaningful, since an approval everyone clicks through is worse than none: it adds friction and provides no safety.

Approval is not the only intervention point. **Preview and confirm** shows the plan before execution. **Draft, don't send** produces the artifact and leaves the final action to the human, which is often the entire product design. **Interrupt** lets a user stop a running agent mid-task. **Undo** — snapshots, branches, soft deletes — is frequently better than a gate, because it lets the agent move fast and makes mistakes cheap.

And autonomy should be earned. Start gated, watch real traces, and open up the actions that have proven reliable. Going the other direction, after an incident, is much more expensive.

## Why it matters

"How do you stop it doing something catastrophic?" is asked of every agent design, and the credible answer is a tiered policy enforced in code, with irreversibility as the sorting criterion. It is also a product decision, not just a safety one: too many gates and the agent is a slower way to do the work yourself; too few and one bad run costs the customer's trust permanently.

## Key points

- Sort by reversibility and blast radius, not by a vague sense of risk — irreversible and externally visible actions are the ones that need a human.
- Enforce approval in the harness as a per-tool policy; an instruction in the system prompt is a suggestion, not a control.
- Denials should carry a reason back to the model so it adapts instead of retrying identically.
- Show the real arguments — recipient, body, diff, affected rows — and allow editing, not just yes/no.
- Batch related approvals and offer scoped trust, or fatigue turns every prompt into a reflexive yes.
- Rubber-stamped approval is worse than none: it adds friction and provides no protection.
- Prefer undo where you can build it — snapshots, branches, soft deletes make speed safe without a gate.
- Draft-don't-send is often the whole product design for high-stakes actions.
- Support interrupt on a running agent, and make a pending approval durable so a dropped connection doesn't deadlock the session.
- Start restrictive and widen based on observed traces; earning autonomy is far cheaper than revoking it after an incident.
