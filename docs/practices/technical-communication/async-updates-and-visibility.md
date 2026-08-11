---
title: Async updates & visibility
summary: Write updates that let someone decide something without asking you a follow-up question — status, risk, and what you need, in that order.
level: core
minutes: 18
order: 4
tags: [communication, remote, collaboration]

related:
  - practices/team-workflow/remote-and-async-collaboration
  - practices/technical-communication/communicating-with-non-engineers
  - practices/code-review/giving-review-feedback

resources:
  - title: GitLab — Asynchronous communication
    url: https://handbook.gitlab.com/handbook/company/culture/all-remote/asynchronous/
    source: GitLab
    type: docs
    minutes: 25
    primary: true
  - title: How We Communicate
    url: https://basecamp.com/guides/how-we-communicate
    source: Basecamp
    type: docs
    minutes: 15
  - title: Technical Writing One
    url: https://developers.google.com/tech-writing/one/short-sentences
    source: Google
    type: course
    minutes: 20
---

## In one line

An async update is good when the reader can act on it without replying to you, which means stating the conclusion first and the reasoning after.

## What it is

The default failure is the **stream-of-consciousness update**: a paragraph of what you did, ending with something ambiguous. The reader has to extract the state, guess whether to worry, and ask a question — which costs a full timezone round trip. Invert it: **conclusion, then evidence, then the ask.**

A weekly or daily update that works has four lines: **status** (on track / at risk / blocked, chosen honestly), **what changed** since last time, **what's next**, and **what I need from you**, with names attached. "At risk" written early is a gift to a manager; "at risk" written the day of the deadline is a problem handed over. Raising a risk before it's certain is a senior behaviour, not an admission — and the way to raise it is with the mitigation attached: "the vendor API is slower than documented; I'm timeboxing a workaround until Thursday, and if it doesn't land we cut the export feature from v1."

**Escalation** follows the same shape. Say what's blocked, what you've already tried, what you're asking for specifically, and by when. A blocked engineer who waits quietly for two days has made a decision on the team's behalf.

For **questions**, batch them and give context: what you're trying to do, what you've tried, what you think the answer is. "Is it A or B?" with your own recommendation gets an answer in one message; "how does auth work?" gets a meeting.

Write in the **open** — a channel or a doc rather than DMs — because the same answer then serves everyone else who'd have asked, and it leaves a searchable record. Add the decision back to the ticket or doc when it's made in a call; a decision that lives only in someone's memory of a Zoom call effectively doesn't exist.

And know when async is the wrong tool. Anything with emotional weight, a real disagreement, or more than two rounds of confusion is faster and kinder on a call. The rule: **decide synchronously when it's contentious, record asynchronously always.**

## Why it matters

At remote-first companies — which is most of the target list — written communication is the job as much as the code is, and interviewers read your take-home README and your PR descriptions as samples of it. Managers explicitly cite "I always know where their work stands" as a senior differentiator.

## Key points

- Lead with the conclusion; supporting detail goes after, for whoever wants it.
- A status update states status, change, next, and the specific ask with a name attached.
- Flag risk early with a proposed mitigation — early bad news is useful, late bad news is a problem.
- When blocked, say what you tried and what you need by when; silent blockage is a decision.
- Ask questions with context and your own proposed answer to collapse the round trips.
- Communicate in public channels and docs so answers are reusable and searchable.
- Write decisions back into the ticket or doc after any synchronous conversation.
- Switch to a call for disagreement, emotion, or the third round of confusion.
