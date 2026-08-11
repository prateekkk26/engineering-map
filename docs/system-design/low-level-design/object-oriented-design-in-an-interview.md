---
title: Object-Oriented Design in an Interview
summary: Getting from a prose problem statement to classes and responsibilities in twenty minutes, without reciting design patterns.
level: core
minutes: 20
order: 1
tags: [lld, design, oop]

related:
  - system-design/low-level-design/designing-a-class-api
  - system-design/low-level-design/low-level-design-classics
  - system-design/design-fundamentals/requirements-and-scoping

resources:
  - title: SOLID Principles
    url: https://en.wikipedia.org/wiki/SOLID
    source: Wikipedia
    type: article
    minutes: 15
  - title: Refactoring — Code Smells
    url: https://refactoring.guru/refactoring/smells
    source: Refactoring Guru
    type: article
    minutes: 30
  - title: Domain-Driven Design Reference
    url: https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf
    source: Eric Evans
    type: book
    primary: true
---

## In one line

Find the nouns, decide what each one is responsible for, and put the behaviour next to the data it operates on — patterns are a vocabulary for describing what you did, not a plan for what to do.

## What it is

**The procedure.** Clarify requirements exactly as in a system design round — smaller scope, same discipline. Then extract candidate entities from the problem statement (the nouns), and the operations (the verbs). Assign each operation to the entity that owns the data it needs; that single rule prevents most bad designs, because a method that reaches into three other objects' internals is a method living in the wrong class.

**Then the interfaces.** For each class: what does it expose, what does it hide, what does it depend on? Depend on abstractions where you genuinely expect substitution — a `PaymentProvider` interface when there really will be several — and on concrete types where you don't. Inventing an interface with exactly one implementation "for flexibility" is the most common over-engineering tell in this round.

**Composition over inheritance.** Deep hierarchies are the classic failure: `Vehicle → Car → ElectricCar → …` collapses the moment something is both electric and a truck. Compose behaviours instead — a `Vehicle` *has* an `Engine`, an `EngineType`, a `Capacity` — and reserve inheritance for genuine is-a relationships where the subtype is substitutable everywhere the base type is used.

**SOLID, used lightly.** The two that earn their keep in a 45-minute round: *single responsibility* (a class changes for one reason — if you describe it with "and", split it) and *dependency inversion* (depend on an abstraction at the boundary you'll want to test or swap). Naming all five as a checklist is noise; applying two visibly is signal.

**Patterns are descriptive.** Say "this is a strategy, so pricing rules can vary per region" as an explanation for a decision you already made. Don't scan a pattern catalogue for something to apply — a design built by pattern-shopping is over-abstracted and the interviewer will see it.

**Make illegal states unrepresentable.** Encode invariants in the type system where you can: an enum instead of a string, a value object instead of a raw primitive, a constructor that cannot produce an invalid instance. In TypeScript this means discriminated unions and branded types, and it's usually a stronger answer than adding a validation method.

**Start concrete and refactor out loud.** Write the simplest thing that satisfies the requirements, then say what would make you extract an interface: "if we add a second payment provider, this becomes an interface — right now it's one class." That sentence demonstrates judgement better than either extreme.

## Why it matters

These loops rarely run a dedicated OOD round, but "design the module" appears inside the practical round and the deep-dive constantly, and code review at work is exactly this skill. The signal being read is whether you can find a coherent decomposition under time pressure and justify it — not whether you can enumerate patterns.

## Key points

- Extract entities from the nouns and operations from the verbs, then assign each operation to the class owning its data.
- A method reaching into other objects' internals is a method in the wrong class.
- Prefer composition; reserve inheritance for genuinely substitutable is-a relationships.
- Single responsibility and dependency inversion are the two SOLID principles worth applying visibly.
- An interface with exactly one implementation and no expected second is over-engineering.
- Use pattern names to describe decisions afterwards, never to shop for a design.
- Encode invariants in types so invalid states can't be constructed.
- Start concrete, and say out loud what would make you add the abstraction.
