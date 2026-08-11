---
title: Receiving feedback & disagreement
summary: Treat review comments as questions about the code rather than judgements of you, and escalate unresolved disagreement on facts rather than on seniority.
level: core
minutes: 18
order: 4
tags: [code-review, communication, behavioral]

related:
  - practices/code-review/giving-review-feedback
  - practices/technical-communication/writing-a-design-doc
  - practices/version-control/commit-and-pr-hygiene

resources:
  - title: Handling pushback in code reviews
    url: https://google.github.io/eng-practices/review/developer/handling-comments.html
    source: Google
    type: docs
    minutes: 10
    primary: true
  - title: The CL author's guide to getting through code review
    url: https://google.github.io/eng-practices/review/developer/
    source: Google
    type: docs
    minutes: 15
  - title: How to Do Code Reviews Like a Human (Part Two)
    url: https://mtlynch.io/human-code-reviews-2/
    source: Michael Lynch
    type: article
    minutes: 20
---

## In one line

If a reviewer misread the code, the code is probably unclear — so the usual response to "I was confused here" is a change, not an explanation.

## What it is

The reframe that makes review painless: **the reviewer is the first user of your code's readability**. When someone says "I don't understand why this branch exists", replying in the thread fixes one reader; adding a comment or renaming the variable fixes every reader after them. Google's guidance is blunt about this — if the reviewer didn't understand it, the next person won't either.

When you disagree, the sequence that works: first check whether you're reacting to the phrasing rather than the substance; wait if you're annoyed, because "don't respond angry" is real advice and text amplifies everything. Then respond with **evidence rather than authority** — a benchmark, a link to the constraint, the incident it came from, the docs. "It's fine" is not a position. If the reviewer's alternative is genuinely equivalent, take theirs; conceding cheap disagreements buys credibility for expensive ones.

If it doesn't converge in two rounds, move it: a call, or a decision with the tech lead or the wider team, and then the outcome written back into the PR. Deciding by whoever is more senior or more stubborn is how teams end up with architecture nobody can explain. Some things genuinely aren't worth resolving in a PR at all — if the disagreement is about a codebase-wide convention, it belongs in a doc or a lint rule, not in this diff.

Two practical habits. **Reply to every comment**, even if only with "done" or "leaving as is because X" — silent resolution makes reviewers re-read the diff to check. And **keep the fixup commits separate** during review so the reviewer can see just what changed since their last pass, squashing only at merge.

The senior version of this is being visibly comfortable being wrong. "Good catch, that breaks when the list is empty" costs nothing and is the single clearest signal that feedback is safe to give you — which is what determines whether anyone bothers to give you real feedback at all.

## Why it matters

"Tell me about a time you disagreed with a colleague" is on nearly every behavioural rubric, and code review is the most credible source of that story. The strong answer shows evidence-based disagreement, a clear escalation path, and a case where you changed your mind.

## Key points

- Reviewer confusion is a defect in the code's clarity — fix the code, not the reviewer's understanding.
- Argue with evidence: benchmarks, links, incidents. Seniority is not an argument.
- Concede equivalent alternatives quickly; save disagreement for changes that actually matter.
- Escalate to a synchronous conversation after two unresolved rounds, then write the decision back into the thread.
- Reply to every comment, even briefly, so the reviewer doesn't have to re-derive what you did.
- Push fixups as separate commits during review so the reviewer can see the delta.
- Codebase-wide conventions belong in a doc or a lint rule, not relitigated in each PR.
- Saying "you're right, I missed that" is the cheapest way to keep useful feedback coming.
