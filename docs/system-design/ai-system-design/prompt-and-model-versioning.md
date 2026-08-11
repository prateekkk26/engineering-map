---
title: Prompt & Model Versioning
summary: Treating prompts and model choices as deployed artifacts — versioned, gradually rolled out, attributable per request, and rollback-able in seconds.
level: core
minutes: 20
order: 8
tags: [ai, deployment, operations]

related:
  - ai/evals-and-quality/regression-testing-prompts
  - system-design/reliability-and-operations/rollouts-and-safe-deploys
  - system-design/ai-system-design/eval-and-experiment-infrastructure

resources:
  - title: Feature Toggles
    url: https://martinfowler.com/articles/feature-toggles.html
    source: Martin Fowler
    type: article
    minutes: 30
  - title: Prompt Caching
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
    source: Anthropic
    type: docs
    minutes: 25
    primary: true
  - title: Models Overview
    url: https://platform.claude.com/docs/en/about-claude/models/overview
    source: Anthropic
    type: docs
    minutes: 15
---

## In one line

A prompt is production code and a model ID is a dependency version — both need version control, staged rollout, per-request attribution and instant rollback.

## What it is

**The versioned unit is bigger than the prompt string.** It's the template, the model ID, the parameters, the tool definitions, and the output schema — because changing any of them changes behaviour. Version that whole bundle together and give it an identifier.

**Where it lives.** In git alongside the code is the default: reviewable, diffable, tied to a deploy, and it can't drift from the code that depends on it. A database-backed store lets non-engineers edit prompts and lets you change one without a deploy — real benefits, at the cost of an untested prompt being one click from production. If you build the store, put the eval gate in front of the publish action, keep an audit log, and keep the rollback one click too.

**Roll out gradually.** A prompt change is a behaviour change for every user at once. Ship it dark, enable for internal users, then 1%, 5%, 50%, comparing the same metrics as a canary — quality proxies, latency, cost, error rate. Automated rollback on a metric breach is what makes this a control rather than a ritual.

**Record the version on every request.** Log the prompt version, model ID, parameters and token usage with each call. Without it you cannot answer "did quality change last Tuesday because of the prompt or the model?", and you cannot compare variants meaningfully. This one field makes most AI debugging tractable and its absence makes it guesswork.

**Pin the model ID.** Use an explicit model identifier rather than anything that silently moves under you, and treat a model upgrade as its own change: run the eval suite against the new model, expect prompt re-tuning (behaviour genuinely differs between versions — verbosity, tool-use eagerness, instruction literalism), roll out gradually, and keep the old model configured so rollback is a flag flip rather than a deploy. Provider deprecation timelines make this a recurring scheduled task, not a one-off.

**Caching interacts with versioning.** Prompt caching is a prefix match, so changing a single byte early in the system prompt invalidates the cache for everything after it, and switching models invalidates it entirely. Expect a cold, more expensive period after any prompt or model change, and don't mistake it for a regression.

**Keep the eval set versioned too.** A score is only comparable against the same dataset, so pin dataset versions alongside prompt versions or your history becomes meaningless.

## Why it matters

Teams that skip this end up unable to explain their own quality changes, and unable to roll back a bad prompt without a deploy. In an interview it's the operational-maturity signal for AI systems specifically — and "we log the prompt version and model ID on every request" is a one-sentence answer that immediately reads as experience.

## Key points

- Version the whole bundle — template, model ID, parameters, tools, output schema — as one artifact.
- Git is the sane default; a prompt store needs an eval gate, an audit log and one-click rollback.
- Roll out prompt changes like canaries, with automated rollback on a metric breach.
- Log prompt version and model ID on every request, or quality changes become unattributable.
- Pin explicit model IDs and treat a model upgrade as a full change: evals, re-tuning, gradual rollout.
- Keep the previous model configured so rollback is a flag flip, not a deploy.
- Any prompt or model change invalidates the prompt cache — expect a temporarily colder, costlier period.
- Version eval datasets alongside prompts, or historical scores aren't comparable.
