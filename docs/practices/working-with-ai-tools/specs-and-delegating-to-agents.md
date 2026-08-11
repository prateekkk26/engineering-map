---
title: Specs & delegating to agents
summary: Delegating a whole task means writing the acceptance criteria first, bounding what the agent can touch, and giving it a way to check its own work.
level: core
minutes: 22
order: 2
tags: [ai, agents, workflow]

related:
  - practices/working-with-ai-tools/ai-assisted-coding-workflow
  - ai/agents/the-agent-loop
  - ai/agents/designing-an-agents-tool-surface

resources:
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 30
    primary: true
  - title: Claude Code — Common workflows
    url: https://docs.claude.com/en/docs/claude-code/common-workflows
    source: Anthropic
    type: docs
    minutes: 20
  - title: AI-assisted coding for teams that can't get away with vibes
    url: https://blog.nilenso.com/blog/2025/05/29/ai-assisted-coding/
    source: nilenso
    type: article
    minutes: 25
---

## In one line

An agent will do exactly what you specified, so the work moves from writing code to writing a spec precise enough that a competent stranger couldn't get it wrong.

## What it is

Delegating a full task — not a completion, but "implement this" — succeeds or fails on the brief. A usable one contains: **the goal in behavioural terms**, **acceptance criteria you can run** (this test passes, this endpoint returns this shape), **the boundary** (which files or packages are in scope, and what must not be touched), **the conventions** to follow with a pointer to an existing example, and **explicit non-goals**. Ambiguity gets resolved by the model, silently, in the direction of whatever's most common on the internet — which is rarely your codebase's way.

**Plan before code.** Asking for the approach first, reviewing it, then asking for implementation catches wrong-direction work while it costs nothing. This is where your judgement actually enters, and skipping it is why long agent runs go sideways: a bad plan executed thoroughly is the expensive failure mode.

**Close the loop.** An agent that can run the tests, the type checker, and the linter will fix most of its own mistakes before you see them. This is the difference between generation and engineering — the feedback signal, not the model. It's also why a fast, reliable test suite is suddenly worth more than it was: it's the mechanism by which delegation scales.

**Bound the blast radius.** Work on a branch or in a worktree; keep credentials, production access, and destructive commands out of reach; require review before anything merges or deploys. Autonomy should be proportional to reversibility — high for a scratch script, low for a migration or anything touching customer data. The lethal-trifecta framing from `ai/ai-security` applies directly here: private data, untrusted content, and an exfiltration path should not coexist in an agent's reach.

**Parallelism has a cost.** Running several agents at once is possible, and the bottleneck immediately becomes your review capacity. Three PRs you haven't read are worse than one you have.

Task sizing is the skill that develops with practice: big enough to be worth delegating, small enough to review in one sitting — roughly a PR you'd be comfortable reviewing from a colleague.

## Why it matters

"How do you use agents?" is now a live interview question, and the strong answer is about specification, verification, and scope control rather than which tool you use. It's also the same skill as delegating to a junior engineer, which is exactly what the senior and staff levels are assessed on.

## Key points

- Write acceptance criteria that can be executed, not described.
- State the boundary explicitly — in-scope files, and what must not change.
- Review the plan before the implementation; a thoroughly executed wrong plan is the costly failure.
- Give the agent tests, types, and linters so it can verify and correct itself.
- Delegation scales with test suite quality — the feedback loop is the real constraint.
- Grant autonomy in proportion to reversibility, and keep production credentials out of reach.
- Ambiguity is resolved silently toward internet-average conventions, not yours.
- Your review capacity is the bottleneck; parallel agents just move the queue.
