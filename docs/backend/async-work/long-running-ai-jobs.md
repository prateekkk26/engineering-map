---
title: Long-Running AI Jobs
summary: The backend shape of a model call that takes minutes — partial results, cancellation, cost accounting, and retries that don't pay twice.
level: core
minutes: 25
order: 6
tags: [async, ai, jobs, cost]

related:
  - backend/realtime/proxying-an-llm-stream
  - ai/working-with-the-api/batch-and-async-processing
  - system-design/ai-system-design/designing-an-agent-platform

resources:
  - title: Batch processing
    url: https://docs.claude.com/en/docs/build-with-claude/batch-processing
    source: Anthropic
    type: docs
    minutes: 15
    primary: true
  - title: Durable execution
    url: https://docs.temporal.io/evaluate/understanding-temporal
    source: Temporal
    type: docs
    minutes: 30
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
---

## In one line

A model call is a slow, expensive, non-idempotent network request, so the job around it needs checkpointing, cancellation and cost accounting that ordinary background work can skip.

## What it is

Three shapes, and picking the wrong one is the common mistake. **Inline streaming** when a human is waiting and first-token latency is the product — a chat turn. **A background job** when the work is minutes long or multi-step: document ingestion, an agent run, a batch of classifications. **The provider's batch API** when it can wait hours, because it is dramatically cheaper and the right answer for backfills, evals, and re-embedding a corpus.

What makes these jobs different from a thumbnail resize:

**Retries cost money.** Re-running a job that made forty model calls and failed on the forty-first pays for all forty again. So checkpoint: persist each step's output keyed by the job and step, and on retry resume from the last completed step. This is exactly what durable-execution engines (Temporal, Inngest, Restate) provide out of the box, and it is the main reason to consider one for agent workloads rather than a plain queue.

**Partial output has value.** A summarisation job that fails at chunk 9 of 10 should surface nine chunks, not nothing. Persist as you go and model the job with real states — `queued`, `running`, `partial`, `failed`, `cancelled` — because "processing" and "failed" alone can't express what actually happened.

**Cancellation must propagate.** A user who closes the tab or clicks stop should stop the spend. That means a cancellation flag the worker checks between steps *and* an `AbortSignal` passed into the provider SDK, so the in-flight request is actually torn down rather than merely ignored.

**Cost is per-attempt and belongs in the record.** Store input and output tokens, model, and latency per step on the job row. Without it, "why did our bill triple" is unanswerable and per-tenant quota enforcement is impossible.

Two more: provider **rate limits** are the real concurrency ceiling, so the worker pool should be sized to the token-per-minute budget and back off on `429` rather than racing itself; and **timeouts must be generous but finite** — a hung streaming connection can otherwise hold a worker slot indefinitely.

## Why it matters

This is the defining backend workload at the companies these loops hire for, and it's where generic queue knowledge stops being enough. Checkpointing, cancellation and per-job cost tracking are the three things interviewers listen for, because each one only occurs to someone who has actually run model calls in the background.

## Key points

- Match the shape to the wait: stream inline for a human, queue for minutes of work, batch API for hours.
- Checkpoint per step — a retry that replays completed model calls charges you twice for the same tokens.
- Durable execution engines exist precisely to make multi-step, resumable AI jobs ordinary code.
- Model partial success as a first-class state; discarding nine good chunks because the tenth failed is a design bug.
- Cancellation needs both a checked flag and a propagated `AbortSignal`, or the spend continues after the user leaves.
- Record tokens, model and cost per attempt on the job, or billing and quotas are guesswork.
- Size worker concurrency to the provider's token-per-minute limit, not to your CPU count.
