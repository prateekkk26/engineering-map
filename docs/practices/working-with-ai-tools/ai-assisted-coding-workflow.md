---
title: An AI-assisted coding workflow
summary: Treat the model as a fast junior with perfect recall and no accountability — give it context and a verifiable goal, and keep the review burden on you.
level: core
minutes: 25
order: 1
tags: [ai, workflow, productivity]

related:
  - practices/working-with-ai-tools/reviewing-ai-generated-code
  - practices/working-with-ai-tools/specs-and-delegating-to-agents
  - ai/prompting-and-context/context-engineering

resources:
  - title: Here's how I use LLMs to help me write code
    url: https://simonwillison.net/2025/Mar/11/using-llms-for-code/
    source: Simon Willison
    type: article
    minutes: 25
    primary: true
  - title: Claude Code best practices
    url: https://www.anthropic.com/engineering/claude-code-best-practices
    source: Anthropic
    type: article
    minutes: 25
  - title: Exploring Generative AI
    url: https://martinfowler.com/articles/exploring-gen-ai.html
    source: Birgitta Böckeler
    type: article
    minutes: 40
---

## In one line

The leverage comes from context and verification, not from prompting cleverness — the model does the typing, you own the correctness.

## What it is

The workflow that holds up across real codebases has four parts.

**Context first.** Models are strong at code and ignorant of your system. The single biggest quality lever is what you put in the window: the relevant files, the types, the conventions, the failing test, the error output. A persistent project file (`CLAUDE.md`, `.cursorrules`, or equivalent) carrying build commands, architectural rules, and house style removes the same corrections from every session. Vague prompt plus rich context beats clever prompt plus no context, every time.

**A verifiable target.** Ask for something whose correctness you can check without reading every line: a function with tests, a change that makes a failing test pass, a refactor the type checker validates. Test-first works especially well — you write or specify the test, the model writes the implementation, and the loop closes automatically. Where correctness is unverifiable, your review cost rises to the point where the assistance may not pay.

**Small loops.** One coherent change at a time, reviewed, committed, then the next. Long unsupervised runs produce large diffs that are expensive to review and hard to bisect, and errors compound quietly. Commit frequently so you can throw away a bad attempt with `git reset` rather than untangling it — cheap rollback is what makes aggressive delegation safe.

**Match the task to the tool.** Models are genuinely excellent at: boilerplate, tests from a described behaviour, one-off scripts, migrations of known shape, unfamiliar syntax and APIs, explaining code you didn't write, and first drafts of anything. They are weak where the constraints live in your head or in production — subtle concurrency, performance work needing measurement, security-critical logic, and anything depending on a system-wide invariant not present in the context.

The habit that separates people who get value from those who don't: **stay the reviewer**. Read the diff you're about to commit. If you find yourself accepting code you don't understand, you've converted a coding problem into a debugging problem that lands on you later.

## Why it matters

This is now an explicit JD line item and an interview question at the target companies — "how do you use AI tools in your work?" A concrete workflow with named limits reads as judgement; enthusiasm without limits, or blanket refusal, both read badly.

## Key points

- Context quality dominates prompt cleverness — give it the files, types, errors, and conventions.
- A project-level instruction file removes repeated corrections from every session.
- Prefer tasks with a cheap correctness check: tests, types, a reproducible failure.
- Work in small reviewed commits so a bad attempt can be discarded rather than debugged.
- Models excel at boilerplate, tests, scripts, unfamiliar APIs, and explaining existing code.
- They're weakest where constraints live outside the context — concurrency, measured performance, security-critical logic.
- Never commit code you don't understand; unreviewed generation defers cost, it doesn't remove it.
- Time saved on typing is only real if it isn't spent debugging later.
