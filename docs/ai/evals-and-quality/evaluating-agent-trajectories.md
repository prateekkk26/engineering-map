---
title: Evaluating Agent Trajectories
summary: Agents need evaluating on the path as well as the destination, because a correct answer reached through twelve wasted tool calls is a different product than one reached in three.
level: deep
minutes: 20
order: 6
tags: [evals, agents, quality, cost]

related:
  - ai/agents/debugging-and-observing-agents
  - ai/evals-and-quality/building-an-eval-set
  - ai/agents/the-agent-loop

resources:
  - title: How we built our multi-agent research system
    url: https://www.anthropic.com/engineering/built-multi-agent-research-system
    source: Anthropic
    type: article
    minutes: 30
    primary: true
  - title: "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?"
    url: https://arxiv.org/abs/2310.06770
    source: Jimenez et al.
    type: article
    minutes: 35
  - title: "τ-bench: A Benchmark for Tool-Agent-User Interaction"
    url: https://arxiv.org/abs/2406.12045
    source: Yao et al.
    type: article
    minutes: 30
---

## In one line

Score the final state against a checkable outcome, and separately score the trajectory — tool choices, turn count, tokens, recoveries — because the two fail independently.

## What it is

Single-turn evaluation compares an output to an expectation. An agent produces a *sequence*: decisions, tool calls, observations, corrections, and a final state that may live in a database or a filesystem rather than in the response text. Both ends need measuring.

**Outcome evaluation** is the primary metric and it is best made mechanical. The strongest agent benchmarks work because the outcome is verifiable by machine — do the tests pass, does the code compile, is the database in the expected state, does the generated file contain the right values. Where you can define success as a program that returns true or false, do; it removes the judge entirely. Where the outcome is a document or an analysis, a rubric-based judge with the artifact and the requirements is the fallback. A rubric-graded iterate-and-revise loop, where a separate grader scores each attempt and feeds gaps back, is now a first-class pattern for exactly this.

**Trajectory evaluation** measures the path. Efficiency: turns per task, tokens per task, wall-clock. Tool correctness: did it choose sensible tools, and how often did calls fail? Recovery: after an error, did it adapt or repeat the same call? Termination: did it stop when done, hit the iteration cap, or stop early with a statement of intent instead of an action? Safety: did it attempt anything gated, and how often did a human have to intervene?

The reason to track both is that they move independently and hide each other. An agent that improves its success rate while doubling its token count may be worse economically. An agent whose success rate holds while its intervention rate climbs is degrading in a way the outcome metric cannot see.

Practical construction. Build tasks as *scenarios* — an initial state, a request, and a verifiable end state — with a fixture that resets between runs. Mock the external tools so runs are repeatable and cheap; keep a smaller live-integration suite for the things mocks lie about. Run each task several times, because agents are more variable than single calls and a single pass or failure tells you very little; report success rate across runs, not a binary.

Then instrument the composite metric that actually decides adoption: **cost per successfully completed task**, which folds efficiency, retry rate, and success into a single number you can compare across model and prompt changes.

## Why it matters

Once a system is agentic, single-turn evals stop describing it, and "how would you evaluate an agent?" is a strong senior-level question precisely because it has no tidy answer. Naming the outcome/trajectory split, insisting on mechanically verifiable end states, and reporting cost per successful task is the answer that shows you have run one in anger rather than demoed one.

## Key points

- Evaluate the final state and the path separately; they fail independently and each hides the other's regressions.
- Make outcomes machine-verifiable wherever possible — tests passing, state matching, files containing the right values — and skip the judge.
- Use a rubric-graded loop for artifact-shaped outcomes, with a separate grader feeding gaps back for revision.
- Trajectory metrics: turns, tokens, wall-clock, tool error rate, recovery behaviour, termination behaviour, intervention rate.
- Watch termination specifically — hitting the iteration cap and stopping with intent instead of action are distinct, common failures.
- Build scenarios with a fixture that resets state between runs, so tasks are repeatable.
- Mock external tools for the main suite; keep a smaller live suite for what mocks misrepresent.
- Run each task multiple times and report a success rate — agent variance is much higher than single-call variance.
- Cost per successfully completed task is the metric that folds quality and efficiency into one comparable number.
- A rising human-intervention rate is a regression even when the success rate is flat.
