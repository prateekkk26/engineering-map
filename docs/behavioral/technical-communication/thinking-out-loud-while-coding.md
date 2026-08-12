---
title: Thinking Out Loud While Coding
summary: In a live round the interviewer can only score what you say, so narrate the decision you're making and the thing you'd normally leave implicit.
level: core
minutes: 15
order: 2
tags: [interviewing, pairing, communication]

related:
  - behavioral/technical-communication/the-deep-dive-round
  - behavioral/ai-behavioral/the-practical-ai-round
  - behavioral/common-questions/working-in-ambiguity

resources:
  - title: What to expect in a pair programming interview
    url: https://www.thoughtworks.com/insights/blog/pair-programming-interviews
    source: Thoughtworks
    type: article
    minutes: 12
    primary: true
  - title: Do algorithms interviews work?
    url: https://danluu.com/algorithms-interviews/
    source: Dan Luu
    type: article
    minutes: 20
  - title: Some ways to get better at debugging — skills you can practice
    url: https://jvns.ca/blog/2018/09/01/learning-skills-you-can-practice/
    source: Julia Evans
    type: article
    minutes: 10
---

## In one line

Silence is unscorable — say what you're deciding, what you're assuming, and what you're deliberately skipping.

## What it is

The technical screen at these companies is live coding in a real editor, and the practical round is often pairing. In both, the interviewer is watching a process, and any part of the process you keep in your head is invisible.

**Narrate decisions, not keystrokes.** "Now I'm writing a for loop" is noise. "I'll do this with a plain map first — if the list gets big enough to matter we'd index it, but I don't want to optimise before it works" is a scored sentence. The distinction is whether you're describing what you're typing or why.

**Front-load the plan.** Two sentences before you write anything: your understanding of the problem, and the shape of your approach. This is worth doing even when you're sure, because it lets the interviewer correct a misunderstanding at minute one rather than minute twenty — and they will if you invite it.

**Ask about the constraints.** Input size, error handling, whether this is production code or a spike, whether they'd like tests. Asking is a senior signal in itself; it's the same instinct as scoping an underspecified ticket.

**Say what you're deliberately not doing.** "I'm not validating the input here — in real code I'd zod-parse this at the boundary" gets you full credit for something you skipped for time. Silent shortcuts get read as things you didn't know about.

**Handle being stuck out loud.** "This isn't behaving how I expected. My assumption was X; let me print the intermediate value and check." That's a debugging demonstration. Going quiet for three minutes is the same thinking with none of the credit — and it makes the interviewer wonder whether to rescue you.

**Take the hint.** Interviewers nudge on purpose; treating a hint as a failure and pushing on with your own approach scores worse than incorporating it gracefully.

Rehearsal helps more than you'd expect — narrating is unnatural, and the first time you do it shouldn't be under assessment.

## Why it matters

The technical screen filters more senior candidates than it should, usually not on ability but on legibility: correct code arrived at silently, or a wrong assumption that could have been caught in the first minute. Narration is also the closest simulation of what pairing with you would be like, which is much of what a small team is buying.

## Key points

- Anything unspoken cannot be scored; the interviewer is grading the process, not just the diff.
- Narrate decisions and trade-offs, not the code you're typing.
- State your understanding and plan before writing, so a misread gets corrected immediately.
- Ask about input size, error handling, and whether tests are wanted — asking is itself a signal.
- Announce deliberate shortcuts to get credit for what you skipped.
- Debug out loud: state the assumption, then the check that tests it.
- Accept hints gracefully; ignoring them costs more than being stuck did.
- Practise narrating beforehand — it's a performance skill, and it's awkward the first time.
