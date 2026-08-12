---
title: Prompt Versioning & Iteration
summary: Prompts are production logic with no type system and no stack traces, so they need the discipline you already apply to code — versioning, review, and a test suite.
level: core
minutes: 15
order: 7
tags: [prompting, llm, testing, practices]

related:
  - ai/evals-and-quality/regression-testing-prompts
  - ai/evals-and-quality/building-an-eval-set
  - ai/prompting-and-context/system-prompts-and-instruction-design

resources:
  - title: Your AI product needs evals
    url: https://hamel.dev/blog/posts/evals/
    source: Hamel Husain
    type: article
    minutes: 35
    primary: true
  - title: Create strong empirical evaluations
    url: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    source: Anthropic
    type: docs
    minutes: 20
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
---

## In one line

A prompt is a deploy that changes behaviour everywhere at once with no compiler to catch it, so it belongs in git, behind review, with a set of cases that must still pass.

## What it is

The default workflow is: someone edits the prompt in a dashboard, it looks better on the one example they tried, it ships. Two weeks later a different behaviour has regressed and nobody can say which change did it, because there is no history and no test.

The fix is mostly unexciting engineering. **Prompts live in the repo**, versioned with the code that uses them, reviewed in a pull request like any other logic. That gives you blame, rollback, and a place to write down *why* a rule exists — a comment on a strange line is what stops the next person deleting it and reintroducing the bug it fixed.

**Every change is evaluated against a fixed set of cases** before it merges. Twenty to fifty real inputs with a check — an assertion, a rubric, a comparison — is enough to catch the majority of regressions. Without it you are trading a fix for an unknown number of new failures, which is exactly the pattern that makes AI features feel like they get worse over time.

**Prompt version is recorded on every request**, alongside the model id and the effort setting, in the same log line as the token usage. When quality drops, the first question is what changed, and this is what answers it.

For anything with meaningful traffic, treat prompt changes like feature flags: roll out to a slice, compare quality and cost signals against the previous version, then widen. A/B on real traffic will regularly disagree with your offline evals, and when it does the traffic is right.

A note on tooling. Hosted prompt-management platforms offer editing, versioning, and a playground, and they are genuinely useful when non-engineers author prompts. The trade is that prompt and code versions can drift apart, and a change can ship without review. If you use one, keep deployment gated on the eval run.

The habit underneath all of this is refusing to trust the demo. A prompt change that looks better on the example you were staring at is the single most common way LLM products regress, because the example you were staring at is the one you were already optimising for.

## Why it matters

This is the practice question interviewers use to separate people who have shipped an AI feature from people who have built a demo: "how do you know a prompt change didn't break anything?" The honest answer involves version control, a case set, and per-request logging of the prompt version. It also matters day to day — without it, quality drifts and the team loses the ability to say whether the product is getting better.

## Key points

- Prompts are production logic. They go in the repo, under review, with rollback — not in a dashboard someone edits live.
- Comment the non-obvious rules with why they exist, or they get deleted and the bug comes back.
- Gate every change on a fixed eval set; twenty to fifty real cases catches most regressions.
- Log the prompt version, model id, and effort setting on every request so a quality drop can be traced to a change.
- Roll out significant changes progressively and compare against the previous version on live traffic.
- When offline evals and live traffic disagree, the traffic is right.
- Hosted prompt platforms are useful when non-engineers author prompts, but keep deploys gated on evals or you have reintroduced unreviewed production changes.
- Judging a change on the example that motivated it is the most reliable way to regress everything else.
