---
title: A Project That Failed
summary: Pick a real failure with your fingerprints on it, and spend most of the answer on the diagnosis rather than the disaster.
level: core
minutes: 18
order: 2
tags: [failure, learning, ownership]

related:
  - behavioral/what-senior-means/ownership-end-to-end
  - practices/incident-response/blameless-postmortems
  - behavioral/story-bank/star-and-how-it-fails

resources:
  - title: Blameless postmortems — running them without blame
    url: https://www.atlassian.com/incident-management/postmortem/blameless
    source: Atlassian
    type: article
    minutes: 12
    primary: true
  - title: How complex systems fail
    url: https://how.complexsystems.fail/
    source: Richard Cook
    type: article
    minutes: 15
  - title: The infinite hows
    url: https://www.kitchensoap.com/2014/11/14/the-infinite-hows-or-the-dangers-of-the-five-whys/
    source: John Allspaw
    type: article
    minutes: 20
---

## In one line

Choose a failure you caused or could have prevented, describe the mechanism honestly, and land on the specific thing you changed afterwards.

## What it is

The question comes as "tell me about a project that failed", "your biggest mistake", or "a time you broke production". All three are the same question, and it is not a trap: the interviewer wants to know whether you can look at your own work accurately.

**The disqualifying answers** are well known and still common. The humblebrag — "I cared too much about quality and we shipped late". The blame-shift — the failure was real but caused entirely by product, the vendor, or a departed colleague. And the trivial one — a typo, a bad deploy that was reverted in four minutes. All three read as unwillingness to look at yourself, which is worse than the failure would have been.

**Pick something with consequences.** A launch that missed, a system you designed that didn't survive contact with real load, a migration that had to be rolled back, a decision that cost the team a quarter. Something where you had authorship — if you had no influence over it, it doesn't answer the question.

**Weight the answer towards diagnosis.** One or two sentences on what happened, then the real content: *why* it happened. The strong version names a mechanism rather than a person — we optimised for a launch date nobody had validated; I designed for a scale that never arrived and paid for it in complexity; I assumed the data was clean because the sample was; nobody owned the rollout so it happened in three uncoordinated pieces.

**Then the change, and be specific.** Not "I learned to communicate better" — "I now write a one-page plan with the rollout and the rollback before any migration, and I've done it on every one since." A learning you can point to being applied is the difference between reflection and a phrase.

If the failure had a human cost — a team burnt out, someone left — say that plainly. It's the detail that makes the story credible.

## Why it matters

At a small company you will break things, because the safety nets aren't all built yet. What they're buying is the response: someone who notices early, says it out loud, fixes it, and changes the system so it doesn't recur. This question is also where interviewers most often detect rehearsed evasiveness, which costs more than the failure itself.

## Key points

- Pick a failure with real consequences and your fingerprints on it; small or blameless examples fail the question.
- Never use a disguised strength — interviewers hear it constantly and score it as evasion.
- Spend most of the answer on why it happened, not on what happened.
- Name mechanisms and decisions, not people; blaming absent colleagues is fatal.
- Include your own contribution even when others contributed more.
- End with a concrete practice you changed and have since applied.
- Mention the human cost if there was one — it's what makes the account believable.
- "I noticed it and escalated it early" is a genuinely strong sub-plot; say when you knew.
