---
title: The AI Experience Question
summary: The question exists to find out whether you've hit real production problems or only demo ones — and side projects count if you're honest about the scale.
level: core
minutes: 18
order: 1
tags: [ai, interviewing, experience]

related:
  - practices/working-with-ai-tools/talking-about-your-ai-workflow
  - ai/evals-and-quality/why-evals-are-the-real-work
  - behavioral/ai-behavioral/having-a-view-on-the-hype

resources:
  - title: What we learned from a year of building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Husain et al.
    type: article
    minutes: 45
    primary: true
  - title: Your AI product needs evals
    url: https://hamel.dev/blog/posts/evals/
    source: Hamel Husain
    type: article
    minutes: 30
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
---

## In one line

Answer with the production problems you hit — latency, cost, evaluation, failure handling — because those are what separate people who shipped from people who prototyped.

## What it is

At AI-forward companies this replaces part of the usual experience conversation, and the honest situation for most candidates is a mix of real work and side projects. That's fine. What isn't fine is describing a weekend demo in the register of a production system, because the follow-up questions land immediately.

**What signals real experience** is not the architecture, it's the boring second-order problems: how you knew a prompt change made things better rather than differently bad; what you did about the 3% of responses that were confidently wrong; where the latency actually went and what you streamed to hide it; what it cost per thousand requests and what you did when that number scaled badly; what happened when the model returned malformed JSON at 2am. Anyone who has shipped one of these features has scar tissue in at least two of those areas. Talk about those.

**Say the scale plainly.** "This is a side project with about forty users, but the eval harness is real and here's what it caught" is a strong answer. Inflating a demo is the standard failure, and it's discovered fast because production numbers are the first follow-up.

**Frame prior non-AI work as transferable where it genuinely is.** Streaming UIs, cancellation, retries with backoff, cost-per-request thinking, working against an unreliable third-party API, designing for a component that sometimes fails — these are the actual skills, and a candidate who names the mapping explicitly reads better than one claiming years of "AI experience".

**Have an opinion on evals.** If there's one thing that distinguishes people who've built these systems, it's that they treat evaluation as the main work rather than an afterthought. Being able to describe a small eval set you built — even twenty cases in a spreadsheet — outperforms a much bigger project with no measurement story.

## Why it matters

Every company in this search is filtering for it, and the filter is coarse because there are many candidates with a demo and few with production scars. Being precise about which you have builds trust for the rest of the loop; overclaiming here poisons everything after it.

## Key points

- The signal is production second-order problems — evaluation, cost, latency, malformed output, failure handling — not the architecture diagram.
- Name the scale honestly; a small real project described accurately beats an inflated one.
- Be able to say how you knew a change was an improvement; the eval answer is the differentiator.
- Have concrete numbers: cost per thousand requests, p95, the error rate you tolerated.
- Map transferable skills explicitly — streaming, cancellation, retries, unreliable upstream APIs.
- Describe one thing that went wrong in production with a model and what you changed.
- Side projects count, and often demonstrate more breadth than a narrow work assignment.
- Overclaiming is unrecoverable here because the follow-ups are specific and everyone asks them.
