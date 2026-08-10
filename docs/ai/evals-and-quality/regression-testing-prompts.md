---
title: Regression Testing Prompts
summary: Wiring the eval suite into CI so a prompt, model, or retrieval change cannot ship a silent regression.
level: core
minutes: 15
order: 4
tags: [evals, testing, ci, practices]

related:
  - ai/prompting-and-context/prompt-versioning-and-iteration
  - ai/evals-and-quality/building-an-eval-set
  - ai/llm-foundations/sampling-and-determinism

resources:
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
    primary: true
  - title: Your AI product needs evals
    url: https://hamel.dev/blog/posts/evals/
    source: Hamel Husain
    type: article
    minutes: 35
  - title: promptfoo
    url: https://github.com/promptfoo/promptfoo
    source: promptfoo
    type: repo
    minutes: 20
---

## In one line

Run the eval suite on every change that touches the prompt, the model, the tools, or retrieval, and fail the build on a drop in pass rate — with thresholds, not exact matches.

## What it is

The mechanics are ordinary CI with three adjustments for non-determinism.

**Assert properties, not strings.** Snapshot tests against model output are guaranteed to flake, and a flaky suite gets disabled. Assert what must be true: valid JSON, schema conformance, the required field present, the forbidden phrase absent, the classification correct, the answer citing a real chunk.

**Score in aggregate with a threshold.** Individual cases can legitimately vary, so the gate is "pass rate ≥ 90% and no more than one point below the previous run", not "all 80 cases pass". Track the trend, because a suite that drifts from 95% to 88% over five merges is a real regression that no single build caught.

**Pin what you can.** Model id, prompt version, effort setting, and retrieval index version all belong in the run record. When a suite degrades without a code change, the cause is usually one of those moving underneath you.

**What triggers a run**: prompt edits, model or effort changes, tool schema changes, retrieval or chunking changes, and dependency upgrades of any SDK involved. Because runs cost money and time, most teams split the suite — a fast cheap subset on every commit, the full suite nightly and before release.

Practical constraints worth planning for. Evals cost real money, so budget them like any other CI resource and use a cheap model for the judge where quality permits. They are slow, so run cases in parallel and cache results for unchanged inputs against unchanged configuration. And provider outages will fail your build for reasons unrelated to your change, which argues for retries and for distinguishing infrastructure failure from quality failure in the report.

The output matters as much as the gate. A CI comment showing pass rate by category, plus the specific cases that newly failed with their actual outputs, is what makes the suite useful during review. A red build with a number and no diff gets overridden.

The trap on the other side is over-fitting: a team that iterates hard against 80 cases eventually produces a prompt tuned to those 80 cases. A held-out slice, plus periodic refresh from live traffic, is what keeps the suite honest.

## Why it matters

This is what makes iteration on an AI feature safe, and it is a direct answer to the standard interview question about testing non-deterministic systems. It is also the difference between a product that improves and one where every fix is a coin flip — most teams that feel their AI feature "keeps regressing" simply have no gate.

## Key points

- Assert properties and invariants, never exact output strings; snapshot tests on model output will flake and then be deleted.
- Gate on aggregate pass rate with a threshold and a comparison to the previous run, not on every case passing.
- Track the trend — slow multi-merge drift is invisible in any single build.
- Record model id, prompt version, effort, and index version with each run so unexplained drops can be traced.
- Trigger on prompt, model, tool schema, retrieval, and SDK changes.
- Split into a fast subset per commit and a full suite nightly or pre-release, because runs cost money and time.
- Parallelise cases and cache results for unchanged input plus unchanged configuration.
- Distinguish provider outages from quality failures in the report, or the suite loses credibility.
- Show newly failing cases with their actual output in the CI comment; a bare number gets overridden.
- Keep a held-out slice and refresh from live traffic, or you will tune the prompt to the eval set.
