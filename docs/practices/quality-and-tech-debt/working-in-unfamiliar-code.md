---
title: Working in unfamiliar code
summary: Get a change into production early, use the tooling to answer questions the code won't, and create seams instead of trying to understand everything first.
level: core
minutes: 20
order: 4
tags: [legacy, onboarding, refactoring]

related:
  - practices/quality-and-tech-debt/refactoring-safely
  - practices/incident-response/debugging-production-systems
  - practices/team-workflow/local-environments-and-onboarding

resources:
  - title: Understand Legacy Code
    url: https://understandlegacycode.com/blog/key-points-of-working-effectively-with-legacy-code/
    source: Nicolas Carlo
    type: article
    minutes: 25
    primary: true
  - title: The Mikado Method
    url: https://www.mikadomethod.info/
    source: Ellnestam & Brolund
    type: book
  - title: Your Code as a Crime Scene
    url: https://pragprog.com/titles/atcrime2/your-code-as-a-crime-scene-second-edition/
    source: Adam Tornhill
    type: book
---

## In one line

Feathers' definition — legacy code is code without tests — is useful because it points at the fix: get a test around the part you need to change, then change it.

## What it is

The instinct on joining an unfamiliar codebase is to read it until it makes sense. That doesn't converge on anything large. What works is **making a small real change and shipping it**, ideally in the first days: you learn the build, the tests, the review process, the deploy path, and which parts of the map are actually wrong — knowledge you cannot get by reading.

**Let the tools answer structural questions.** `git log` on a file shows who to ask and how volatile it is. Change frequency crossed with complexity identifies the few files where the pain concentrates (Tornhill's hotspot analysis) — usually a small handful, and usually exactly the ones people warn you about. A stack trace or a debugger breakpoint on a real request tells you the actual call path, which is far more reliable than following imports by hand. Adding temporary logging and hitting the feature once beats an hour of reading.

**Create seams.** Feathers' term for a place where you can change behaviour without editing the code in place — a parameter, an interface, an injection point. The recurring problem in old code is that the thing you want to test is welded to a database, a clock, or a network call. Introducing a seam is the enabling move, and it is done with the smallest, most mechanical edit possible, ideally one an IDE can do automatically. Then characterisation tests, then the real change.

Two disciplines. **Change as little as possible per PR**, because your intuition about blast radius is unreliable here and reviewers are your safety net. And **write down what you learn as you learn it** — a diagram, a README paragraph, a comment on the confusing bit — because the window in which you notice what's confusing closes within weeks.

Finally, extend charity to the code. Strange decisions usually had a reason: a constraint, a deadline, an outage, a customer. Ask before deleting, and if nobody remembers, note the risk rather than assuming it's safe.

## Why it matters

Practical rounds are frequently "here's a repo, add this feature", and how you orient is the thing being scored. In real jobs this is the first ninety days at every new company, and being fast at it is one of the most transferable senior skills there is.

## Key points

- Legacy code is code without tests; the path to changing it safely runs through getting one in place.
- Ship a small real change early — it teaches you the pipeline and the culture faster than reading does.
- Use `git log`, hotspot analysis, and debuggers to answer questions the code doesn't answer.
- Introduce seams with minimal mechanical edits so behaviour can be pinned before you change it.
- Characterise existing behaviour with tests before modifying it, bugs included.
- Keep PRs small, because your sense of blast radius in unfamiliar code is unreliable.
- Document confusion while you still feel it — that window closes in weeks.
- Assume odd code had a reason; find the reason before deleting it.
