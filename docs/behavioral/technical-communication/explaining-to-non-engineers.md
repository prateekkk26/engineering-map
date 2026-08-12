---
title: Explaining to Non-Engineers
summary: Explaining a technical constraint to a founder or designer without either lying or losing them is a scored senior skill, especially in the hiring-manager round.
level: core
minutes: 15
order: 3
tags: [communication, stakeholders, influence]

related:
  - practices/technical-communication/communicating-with-non-engineers
  - behavioral/what-senior-means/influence-without-authority
  - behavioral/the-reverse-interview/questions-that-signal-seniority

resources:
  - title: Explain like I'm five — technical concepts for non-technical audiences
    url: https://www.nngroup.com/articles/plain-language-experts/
    source: Nielsen Norman Group
    type: article
    minutes: 12
    primary: true
  - title: Writing for busy readers
    url: https://hbr.org/2016/11/how-to-write-email-with-military-precision
    source: Harvard Business Review
    type: article
    minutes: 8
  - title: The curse of knowledge
    url: https://en.wikipedia.org/wiki/Curse_of_knowledge
    source: Wikipedia
    type: article
    minutes: 6
---

## In one line

Lead with the consequence for them, keep exactly one layer of mechanism, and offer a choice rather than a verdict.

## What it is

Half the people you'll talk to at a small company aren't engineers, and the interview simulates this — the founder round, and the near-universal "explain something technical to a non-technical person" prompt.

**Start with the consequence.** Not "the ORM does an N+1 on the dashboard query", but "the dashboard will get slower as customers get bigger — a customer with 10,000 orders waits eight seconds today." Non-engineers care about effect first, cause second, and if you invert that they stop listening before you reach the part that matters.

**Give one layer of mechanism, not four.** "Each row on the page triggers its own database lookup" is enough. The instinct to be complete is the main failure, and it reads as an inability to prioritise.

**Use an analogy, and mark it as one.** Analogies are effective and they leak, so name where: "it's like re-reading the whole address book to find one contact — imperfect analogy, but the shape is right." That protects you from a decision being made on a metaphor.

**End with options and a recommendation.** "Two days for a fix that holds until roughly a thousand orders, or a week for one that doesn't need revisiting. I'd take the week because customers are trending bigger — but if the demo is Thursday, take the two days." That's what a non-engineer actually needs: a decision they can make.

**Avoid two register failures.** Condescension — explaining what a database is to a technical founder — and jargon shielding, where complexity is used to end the conversation. Both are noticed.

Calibrate first, cheaply: "how deep do you want me to go?" costs three seconds and saves the whole explanation.

## Why it matters

At a company with no engineering-manager layer, the roadmap is negotiated directly between engineers and founders. If you can't make a technical constraint legible, it gets overruled by someone acting on incomplete information — and then you own the consequences anyway. Interviewers know this, which is why the prompt is so common.

## Key points

- Consequence first, mechanism second; non-engineers disengage during long setups.
- One layer of mechanism is almost always the right amount.
- Flag analogies as imperfect and say where they break, so nobody plans on the metaphor.
- Close with two or three options, costs, and a recommendation — leave the decision with them.
- Quantify the pain in their units: seconds waited, customers affected, revenue at risk, euros per month.
- Don't hide behind jargon to win an argument; it's transparent and it's remembered.
- Ask how much depth they want before launching in.
- The prompt "explain something technical to a non-technical person" is near-universal — have one prepared and rehearsed.
