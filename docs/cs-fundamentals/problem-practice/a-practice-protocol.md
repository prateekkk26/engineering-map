---
title: A practice protocol
summary: A small, timed, spaced routine aimed at the patterns these loops actually use — not a three-hundred-problem grind.
level: core
minutes: 20
order: 3
tags: [interview, practice, strategy]

related:
  - cs-fundamentals/problem-practice/what-actually-gets-asked
  - cs-fundamentals/problem-practice/solving-a-problem-out-loud
  - cs-fundamentals/data-structures/choosing-a-data-structure

resources:
  - title: NeetCode Practice
    url: https://neetcode.io/practice
    source: NeetCode
    type: course
    minutes: 30
    primary: true
  - title: GreatFrontEnd JavaScript coding questions
    url: https://www.greatfrontend.com/questions/js
    source: GreatFrontEnd
    type: course
    minutes: 30
  - title: BFE.dev — frontend coding challenges
    url: https://bigfrontend.dev/
    source: BFE.dev
    type: course
    minutes: 30
  - title: Spaced repetition
    url: https://en.wikipedia.org/wiki/Spaced_repetition
    source: Wikipedia
    type: docs
    minutes: 10
---

## In one line

Practise in the format you will be tested in — timed, out loud, in a plain editor — on a small set of pattern-representative problems revisited on a schedule, rather than on volume.

## What it is

**Weight the mix to the loop.** For this target, roughly half of practice time should go to JavaScript utility implementations and vanilla-DOM components — the BFE.dev and GreatFrontEnd style — because that is what the screen is. A quarter goes to pattern problems: hashing, two pointers, sliding window, binary search, BFS/DFS, and simple recursion. The last quarter is design-round and take-home rehearsal, which is where the highest marginal value sits for a senior role.

**One problem, done properly, beats five skimmed.** The protocol per problem: 25 minutes on a timer, in a plain editor with no autocomplete and no AI assistance, speaking out loud as if someone is watching. If you are stuck at 25 minutes, look at the approach only — not the code — and then implement it yourself. Afterwards write two lines: what the recognition cue was ("sorted input plus find-a-pair → two pointers") and what you got wrong. Those two lines are the actual artefact. Re-solve the problem cold three days later, then two weeks later.

**Practise the format, not just the content.** Type the solution rather than reading it. Run it, with your own test cases including the empty and single-element ones. Record yourself occasionally, or use a mock-interview partner — hearing your own filler and dead air is uncomfortable and effective. If the company uses a shared editor, practise in a browser-based one, because losing your keybindings and formatter for the first time during the real thing costs real minutes.

**Know when to stop.** This section is deliberately small, and the practice should be too. Coverage of the patterns matters much more than volume, and hitting diminishing returns here means time is better spent on React internals, a system design rehearsal, or sharpening the deep-dive story about your own work — all of which are weighted more heavily in these loops. Two or three focused sessions a week, sustained, beats a fortnight of grinding.

**Keep a mistake log.** One file, one line per error: comparator returned a boolean, forgot to un-choose in backtracking, off-by-one on the window's right edge, mutated the input when it wasn't allowed. Reread it before an interview. Mistakes repeat, and the log is the cheapest possible intervention.

## Why it matters

Most preparation failures are format failures, not knowledge failures — knowing the pattern but freezing when the timer, the unfamiliar editor, and another person's attention are added. Practising under those exact conditions removes the surprise, and the spaced re-solve is what converts "I recognise this" into "I can produce this cold".

## Key points

- Weight practice to the actual loop: about half utility and component implementations, a quarter pattern problems, a quarter design and take-home rehearsal.
- Time-box to 25 minutes, in a plain editor, out loud — practise the conditions, not just the content.
- After 25 minutes look at the approach only, never the code, and then write it yourself.
- Write down the recognition cue for each problem; pattern recognition is the transferable skill, the solution is not.
- Re-solve cold at three days and two weeks — spaced retrieval is what makes recall survive interview pressure.
- Keep a one-line-per-mistake log and reread it before interviews, because the same mistakes recur.
- Always run your solution against empty, single-element, and duplicate inputs before declaring it done.
- Stop at pattern coverage rather than problem count; further volume here is worth less than React depth or design practice.
