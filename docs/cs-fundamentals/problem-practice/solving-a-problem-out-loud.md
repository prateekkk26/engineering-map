---
title: Solving a problem out loud
summary: The interviewer is scoring your process, not your final code, and a stated approach beats a silent correct answer.
level: core
minutes: 20
order: 2
tags: [interview, practice, communication]

related:
  - cs-fundamentals/problem-practice/what-actually-gets-asked
  - cs-fundamentals/data-structures/choosing-a-data-structure
  - system-design/frontend-system-design/running-a-frontend-design-interview

resources:
  - title: How to Solve It
    url: https://en.wikipedia.org/wiki/How_to_Solve_It
    source: George Pólya
    type: book
  - title: The Technical Interview Cheat Sheet
    url: https://github.com/TSiege/Tech-Interview-Cheat-Sheet
    source: Tyler Siege
    type: repo
    minutes: 30
  - title: interviewing.io blog — data from real technical interviews
    url: https://interviewing.io/blog
    source: interviewing.io
    type: article
    minutes: 30
  - title: Rubber duck debugging
    url: https://en.wikipedia.org/wiki/Rubber_duck_debugging
    source: Wikipedia
    type: docs
    minutes: 5
    primary: true
---

## In one line

Say what you are about to do before you do it, so the interviewer is evaluating a plan they can correct rather than watching a silent screen and guessing.

## What it is

A repeatable sequence, and having it memorised is what stops panic from taking the first five minutes.

**Restate and clarify.** Repeat the problem in your own words, then ask about the things that change the answer: input size and range, sorted or not, duplicates, empty input, negative numbers, Unicode, whether the input can be mutated, whether the result must be stable. Two or three questions is right — this is graded, and in the practical round the questions you ask are explicitly scored. Then state one or two examples, including a degenerate one, and confirm the expected output.

**State the brute force, then improve.** Say the naive approach and its complexity out loud, immediately: "the obvious version is a nested loop, `O(n²)` — let me see if I can trade memory for a pass." That does three things: it proves you understand the problem, it banks a working answer, and it makes the optimisation legible as a deliberate step rather than a leap. Never start coding the optimal solution before naming the naive one.

**Choose and justify.** Name the pattern and the structure — "this is a seen-set problem, so a hash map, `O(n)` time and `O(n)` space" — and get agreement before writing. A wrong direction caught here costs a sentence; caught after fifteen minutes of typing it costs the round.

**Code, narrating structure not syntax.** Say "I'll handle the empty case first, then the main loop" rather than reading your own code aloud. Use real names. Write helpers you would actually write. Silence beyond ten or fifteen seconds should be filled with what you are thinking about — "I'm deciding whether to mutate or copy here."

**Verify by hand.** Walk one real example through the code, out loud, then the edge cases you named earlier. Finding your own bug is a strong positive; having the interviewer find it is not. Finish by stating final complexity and one thing you would improve with more time.

When stuck: say so, and say what you have ruled out. "A hash map doesn't help because order matters" is progress and reads as such. Take a hint immediately and gratefully — resisting one is the worst possible use of the remaining time.

## Why it matters

Interviewers are calibrating whether they want to solve problems with you for two years, and a silent candidate who arrives at a correct answer gives them almost no evidence for that. The narration also has a practical effect: interviewers steer people who are thinking out loud, and cannot steer people who aren't.

## Key points

- Restate the problem and ask two or three clarifying questions before writing anything; the questions themselves are scored.
- State the brute-force solution and its complexity immediately, so a working answer is banked and the optimisation is visible as a choice.
- Name the pattern and data structure and get agreement before coding — a wrong direction caught early costs one sentence.
- Narrate structure and intent, not syntax, and never go more than fifteen seconds silent without saying what you are weighing.
- Handle the empty, single-element, and duplicate cases deliberately rather than discovering them at the end.
- Trace one example by hand out loud; finding your own bug reads as competence, being caught reads as carelessness.
- When stuck, say what you have ruled out and why — that is visible progress rather than an admission.
- Take hints immediately; an interviewer offering one is trying to keep the signal flowing, not testing your independence.
