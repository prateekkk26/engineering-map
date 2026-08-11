---
title: Talking about your AI workflow
summary: Answer with a concrete workflow, one thing it made possible, and one place you deliberately don't use it — enthusiasm and refusal both read as unexamined.
level: core
minutes: 18
order: 5
tags: [ai, interviewing, behavioral]

related:
  - practices/working-with-ai-tools/ai-assisted-coding-workflow
  - practices/working-with-ai-tools/where-ai-coding-tools-fail
  - ai/ai-product-thinking/when-not-to-use-an-llm

resources:
  - title: Claude Code best practices
    url: https://www.anthropic.com/engineering/claude-code-best-practices
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: Exploring Generative AI — team practices
    url: https://martinfowler.com/articles/exploring-gen-ai.html
    source: Birgitta Böckeler
    type: article
    minutes: 40
  - title: How AI-assisted coding will change software engineering — hard truths
    url: https://newsletter.pragmaticengineer.com/p/how-ai-will-change-software-engineering
    source: Gergely Orosz
    type: article
    minutes: 25
---

## In one line

They're asking whether you have judgement about the tools, so give a specific workflow with specific boundaries rather than a position on AI.

## What it is

This question now appears in most loops at AI-forward companies, in some form: *how do you use AI tools day to day?* Two answers fail. **The evangelist** — "it writes most of my code, it's incredible" — raises the immediate concern that you ship code you don't understand. **The refuser** — "I don't use them, I prefer to write it myself" — reads as incuriosity at companies whose product is built on models. Both are positions rather than practices.

The answer that works has four parts, and takes about ninety seconds:

1. **The concrete workflow.** What you use, for what, and how you verify. "I keep a project instructions file with our conventions; I use it heavily for tests, migrations, and one-off scripts; I always review the diff before committing; for anything non-trivial I have it propose a plan first."
2. **A specific example with an outcome.** One story: what you delegated, what went wrong or right, what you'd do differently. Specificity is the whole credibility signal here — a real example about a migration script beats any amount of general enthusiasm.
3. **Where you don't use it, and why.** Security-critical logic, performance work needing measurement, anything where the constraint lives in production rather than in the repo. Naming a boundary is what demonstrates judgement.
4. **What it changed about how you work.** The honest senior version: review capacity became the bottleneck, so tests and small PRs matter more than they used to; specification became a bigger share of the job.

Two things worth preparing separately. Companies increasingly **allow AI tools in take-homes and live sessions** — if so, use them naturally and narrate what you're doing and what you're checking; if not, don't. Ask which it is rather than guessing. And expect the follow-up **"where has it burned you?"** — have a real answer. A hallucinated API, a plausible test that asserted nothing, a refactor that broke an invariant nothing in the repo documented.

If you're interviewing at a company building AI products, this doubles as a product-sense signal: how you use these tools is evidence of how you'd design for users of them.

## Why it matters

It's an explicit JD line item at the target companies and a fast filter for judgement. It's also one of the few questions where preparing a specific story is disproportionately valuable, because most candidates answer with a general attitude.

## Key points

- The question is about judgement, not about which tool you like.
- Evangelism reads as shipping unreviewed code; refusal reads as incuriosity at an AI-forward company.
- Lead with a concrete workflow: context setup, task selection, verification, review.
- Bring one specific example with an outcome, including what you'd change.
- Name where you deliberately don't use them — that boundary is the actual signal.
- Say what changed structurally: review capacity and specification quality became the constraints.
- Ask whether AI tools are permitted in a take-home or live round rather than assuming.
- Prepare a genuine "it burned me" story; the follow-up is common and a non-answer is costly.
