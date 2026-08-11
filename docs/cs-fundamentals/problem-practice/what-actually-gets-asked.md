---
title: What actually gets asked
summary: The evidence on what senior frontend loops at AI-forward companies test, so practice time goes where the questions actually are.
level: core
minutes: 20
order: 1
tags: [interview, practice, strategy]

related:
  - cs-fundamentals/problem-practice/a-practice-protocol
  - cs-fundamentals/problem-practice/solving-a-problem-out-loud
  - frontend/javascript/utilities-from-scratch

resources:
  - title: Front End Interview Handbook
    url: https://www.frontendinterviewhandbook.com/
    source: Yangshun Tay
    type: docs
    minutes: 60
    primary: true
  - title: GreatFrontEnd — coding question formats
    url: https://www.greatfrontend.com/questions
    source: GreatFrontEnd
    type: docs
    minutes: 30
  - title: JavaScript algorithms and data structures
    url: https://github.com/trekhleb/javascript-algorithms
    source: Oleksii Trekhleb
    type: repo
    minutes: 60
  - title: Blind 75
    url: https://neetcode.io/practice
    source: NeetCode
    type: docs
    minutes: 30
---

## In one line

The senior frontend loop at product and AI-forward companies is dominated by live coding in a real editor, a practical build, and a design round — not by algorithm puzzles.

## What it is

Take the rounds one at a time.

The **technical screen** is roughly 45 minutes in a shared editor — CoderPad, CodeSandbox, or the company's own — and the tasks are data transformation, event handling, and small components built from scratch. Implement `debounce`, `throttle`, `groupBy`, a deep `get`, a promise pool with concurrency limits, an event emitter, a retry with backoff, a simple `Promise.all`. Or a UI primitive with no library: an autocomplete, a modal with focus trapping, a tabs component, an infinite list. The tools being tested are closures, `this`, promises, and DOM events — plus whether you handle the empty state, the error case, and cleanup without being asked.

The **practical round** is a take-home or a pairing session in a real repo, deliberately underspecified. At AI companies the brief is frequently a streaming chat surface. Reviewers score architecture decisions, loading/error/empty states, and the questions you asked — not just whether it works.

The **design round** is frontend system design against the RADIO framework: autocomplete, an infinite feed, a collaborative editor, a dashboard, checkout. The senior signal is raising optimisation, accessibility, and internationalisation unprompted.

So where does this section fit? Complexity vocabulary, so you can answer "what's the cost of that" precisely. Hash maps, sets, arrays, and heaps, which are what the screen problems actually use. Recursion and traversal, because nested structures are everywhere in frontend work. Networking and concurrency, because they come up in design rounds and in the deep dive on your prior work. That is genuinely the whole of the DSA requirement for these loops.

What to *not* over-invest in: hard dynamic programming, advanced graph algorithms, and bit manipulation tricks. They are not zero-probability — a company with an infrastructure-heavy culture may still ask — but grinding 300 problems for them is time taken from React internals, system design, and having sharp stories about your own work, all of which have far higher expected value here.

## Why it matters

Preparation time is finite, and the default advice on the internet is calibrated for FAANG-style loops that these companies mostly do not run. Aiming at the actual distribution — closures, async, DOM, components, and one clean pass over the fundamentals — is the difference between being prepared and being busy.

## Key points

- The technical screen is live coding on data transformation and UI primitives, not whiteboard algorithms.
- Utility implementations — debounce, throttle, event emitter, promise pool, deep clone — are the single most common screen format.
- Component-from-scratch questions test DOM events, state, and whether you handle keyboard, focus, and cleanup unprompted.
- The practical round scores architecture, loading and error states, and clarifying questions as much as working code.
- Hash maps, arrays, sets, recursion, and traversal cover the large majority of what these loops require structurally.
- Heavy dynamic programming and advanced graph algorithms are low-yield for this target and are not worth grinding.
- Complexity vocabulary still matters, because "what's the complexity" is the most reliable follow-up after any solution.
- Networking, concurrency, and OS fundamentals earn their place through the design round and the deep dive, not through DSA.
