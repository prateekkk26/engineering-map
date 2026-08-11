---
title: Where AI coding tools fail
summary: They fail where the necessary information isn't in the context — system-wide invariants, production behaviour, and taste about what shouldn't be built.
level: core
minutes: 20
order: 4
tags: [ai, workflow, judgement]

related:
  - practices/working-with-ai-tools/ai-assisted-coding-workflow
  - practices/working-with-ai-tools/reviewing-ai-generated-code
  - ai/llm-foundations/hallucination-and-grounding

resources:
  - title: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity
    url: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
    source: METR
    type: article
    minutes: 25
    primary: true
  - title: Not all AI-assisted programming is vibe coding
    url: https://simonwillison.net/2025/Mar/19/vibe-coding/
    source: Simon Willison
    type: article
    minutes: 10
  - title: AI-Assisted Engineering
    url: https://addyosmani.com/blog/ai-assisted-engineering/
    source: Addy Osmani
    type: article
    minutes: 20
---

## In one line

The limits are structural, not temporary quality problems: a model can only reason about what's in its context, and the hardest parts of senior engineering are not.

## What it is

Start with the empirical humility. METR's randomised trial on experienced open-source developers working in codebases they knew well found they were **19% slower** with AI tools, while believing they had been about 20% faster. Whatever the effect size in your setting, the durable finding is the **perception gap** — self-reported speedup is not evidence. That's a reason to instrument your own use, not a reason to avoid the tools.

Where the failures concentrate:

- **System-wide invariants.** "Every write to this table also enqueues an audit event." "This component must never suspend during a transition." Nothing in the local context says so, and the model produces locally-correct code that violates it.
- **Production reality.** Real data distributions, actual latency, which index exists, what the cache hit rate is, how the vendor API behaves under load. Performance work in particular requires measurement, and a plausible optimisation is worth nothing.
- **Large unfamiliar codebases.** Where a senior's advantage is knowing where things are and why, context windows and retrieval are a weak substitute. This is precisely the METR condition.
- **Deciding what not to build.** Models are agreeable. Ask for a caching layer and you get one; a colleague would ask whether you need it. Scope discipline and problem selection remain entirely yours.
- **Novelty.** Genuinely new problems, unusual constraints, and recently-changed APIs are underrepresented in training data, and the output regresses to the common pattern that doesn't apply.
- **Debugging deep bugs.** Good at reading a stack trace, poor at the hypothesis-and-evidence loop across a distributed system — mostly because it can't observe the system.

There's also a second-order cost worth naming: **skill and context atrophy**. Accepting completions for hours produces code you didn't build a mental model of, and that model is what you need during an incident. Böckeler's "Copilot pause" — the small hesitation while you evaluate a suggestion — is a real tax on flow when the suggestion is wrong more often than not.

The practical stance: use them heavily where verification is cheap and the failure is loud, and deliberately less where correctness is subtle, the context is large, or you're going to own the consequences alone at 3am.

## Why it matters

The interview question underneath "how do you use AI tools?" is really "do you know where your own judgement is still required?" A candidate with a specific, evidence-aware account of the limits is far more convincing than one on either extreme.

## Key points

- Failures cluster where the needed information isn't in the context, not where the code is hard.
- The METR trial found experienced developers slower on familiar codebases while believing they were faster.
- Self-reported productivity gains are unreliable — measure your own outcomes if you want to know.
- System-wide invariants are invisible locally, so generated code violates them convincingly.
- Performance and production behaviour require measurement the model cannot perform.
- Models are agreeable; deciding what not to build stays a human judgement.
- Novel problems and recently-changed APIs regress toward outdated common patterns.
- Reviewing suggestions has its own cost, and accepting them uncritically erodes the mental model you need during incidents.
