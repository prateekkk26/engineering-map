---
title: State Machines & Lifecycle Modelling
summary: Replacing a scatter of booleans with an explicit set of states and legal transitions — the cheapest correctness win in most codebases.
level: core
minutes: 20
order: 3
tags: [lld, modelling, correctness]

related:
  - system-design/low-level-design/designing-a-class-api
  - system-design/classic-problems/design-a-payment-ledger
  - frontend/state-and-data/ui-state-machines

resources:
  - title: Statecharts — A Visual Formalism for Complex Systems
    url: https://www.sciencedirect.com/science/article/pii/0167642387900359
    source: David Harel
    type: article
    minutes: 45
  - title: XState Documentation — State Machines
    url: https://stately.ai/docs/state-machines-and-statecharts
    source: Stately
    type: docs
    minutes: 25
    primary: true
  - title: Making Impossible States Impossible
    url: https://www.youtube.com/watch?v=IcgmSRJHu_8
    source: Richard Feldman / elm-conf
    type: video
    minutes: 30
---

## In one line

Four booleans describe sixteen combinations of which maybe five are legal — naming the five states and the transitions between them eliminates the other eleven by construction.

## What it is

**The smell.** `isLoading`, `isError`, `hasData`, `isRetrying` living side by side. Nothing prevents `isLoading && isError`, so the code accumulates defensive conditionals for combinations that shouldn't exist, and the bugs are always in the combination nobody thought about. The fix is to name what's actually true: `idle | loading | success | error | retrying`, one value at a time.

**Model the state, the transitions, and the data that belongs to each.** A discriminated union does this in TypeScript — `{ status: 'success', data: T } | { status: 'error', error: E }` — so `data` simply doesn't exist to be read while loading. The compiler stops a whole class of bug, which is a much better guarantee than a code review comment.

**Transitions are where the rules live.** `pending → authorized → captured → settled`, with `failed` and `refunded` branches. Define the legal moves explicitly and reject the rest, ideally in one place. Then "can this go from `refunded` back to `captured`?" has an answer you can point at rather than an answer distributed across six call sites.

**Persist the state, and enforce it in the database too.** A status column with a check constraint, or a transition table — because the application isn't the only thing that writes, and a state machine only enforced in one service isn't enforced. For anything auditable, record transitions as rows: what changed, when, triggered by whom. That log answers "how did this order get here?" instantly.

**Side effects hang off transitions, not off states.** "On entering `shipped`, send the notification" is precise and testable; "if status is shipped, send a notification" fires again on every read. Entry and exit actions are the standard vocabulary.

**Where it pays off most.** Order and payment lifecycles, document workflows (draft → review → published), job and task status, connection state, multi-step forms and wizards, and any UI with loading and error states. In each, the alternative is booleans and the bug reports are about impossible combinations.

**Don't over-formalise.** Two states and one transition is an `if`. Reach for the explicit machine when there are four-plus states, when transitions have rules, or when the same lifecycle is checked in more than one place. And keep hierarchy shallow — nested statecharts are powerful and, past one level, harder to read than the code they replace.

## Why it matters

It's the highest-leverage modelling idea for everyday product code, and it's an unusually concrete thing to bring to a design discussion: turning a tangle of flags into a named set of states visibly simplifies the problem. Interviewers notice when a candidate reaches for it in a payment, order or upload flow, because it's what the correct implementations do.

## Key points

- N booleans imply 2^N combinations; naming the legal states removes the impossible ones by construction.
- Attach each state's data to that state — a discriminated union makes reading absent data a compile error.
- Define legal transitions in one place and reject everything else.
- Enforce the state in the database too — a constraint or transition table, not just application code.
- Record transitions as rows when the history matters; it answers "how did this get here?" directly.
- Hang side effects on transitions (entry/exit actions), never on being in a state.
- Reach for an explicit machine at four-plus states, rules on transitions, or checks in several places.
- Keep hierarchy shallow — deep nested statecharts cost more readability than they buy.
