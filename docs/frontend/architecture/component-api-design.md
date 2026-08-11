---
title: Component API Design
summary: Designing props and composition so a component is reusable without becoming a configuration language.
level: core
minutes: 25
order: 2
tags: [architecture, components, api-design]

related:
  - frontend/react/custom-hook-design
  - frontend/typescript/typing-react
  - frontend/architecture/design-systems

resources:
  - title: Passing props to a component
    url: https://react.dev/learn/passing-props-to-a-component
    source: react.dev
    type: docs
    minutes: 20
    primary: true
  - title: Compound Components
    url: https://kentcdodds.com/blog/compound-components-with-react-hooks
    source: Kent C. Dodds
    type: article
    minutes: 15
  - title: Radix Primitives
    url: https://www.radix-ui.com/primitives/docs/overview/introduction
    source: Radix UI
    type: docs
    minutes: 25
---

## In one line

A good component API makes the common case a one-liner and the unusual case possible, usually by preferring composition over another boolean prop.

## What it is

The failure mode has a shape: a component starts with three props, each new requirement adds one, and two years later it takes forty — half of them booleans that interact in ways nobody has enumerated. `showHeader`, `compact`, `variant`, `hideFooterOnMobile`. It is unreadable, untestable, and every change risks a caller you have not seen.

**Composition is the escape.** Instead of configuring a monolith, expose parts: `<Card><Card.Header/><Card.Body/></Card>`. The consumer arranges what they need, and a case you never anticipated does not require a new prop. Compound components share state through context so the parts stay coordinated without prop drilling.

**Slots** are the lighter version — accepting an element rather than a boolean. `icon={<Spinner/>}` beats `showSpinner` because it also covers the case where someone wants a different icon.

Prop design rules that hold up: **boolean props should be independent**, and when they are not, they should be a union (`variant="primary" | "danger"` rather than `isPrimary` plus `isDanger`). **Mutually exclusive APIs belong in a discriminated union type**, so the compiler rejects the invalid combination. **Name for intent, not implementation** — `isLoading` outlasts `showSpinner`. And **match platform conventions**: `onChange`, `disabled`, `value` should behave as they do on native elements, because surprising a user of your component is worse than a slightly longer name.

**Controlled and uncontrolled** both deserve support in a design system. Uncontrolled with `defaultValue` is the easy path; controlled with `value` plus `onChange` is needed for form integration. Support both, and never let a component silently switch between them.

**`...rest` and ref forwarding** matter more than they look: spreading remaining props onto the root and accepting a ref means consumers can attach `data-*` attributes, ARIA, event handlers, and measurement without you anticipating each one. In React 19 `ref` is a normal prop, so this is simply a spread.

The judgement to state out loud: **do not abstract on the second use.** Two similar components are cheaper than one component with a `mode` prop, and the right abstraction is usually visible only by the third case.

## Why it matters

Component APIs are the interface between the people who build the design system and everyone else, and a bad one costs the whole organisation daily.

It is also a direct interview topic — "design the API for a Modal" — where composition, controlled/uncontrolled, and accessibility pass-through are exactly what is being assessed.

## Key points

- Prop explosion is the failure mode; composition and slots are the escape from it.
- Compound components share state via context so parts coordinate without prop drilling.
- Replace interacting booleans with a variant union; express exclusive APIs as discriminated unions.
- Name props for intent, and match platform conventions for anything that mirrors a native element.
- Support both controlled and uncontrolled usage, and never switch modes silently.
- Spread `...rest` onto the root and accept a ref so consumers can extend without new props.
- Wait for the third case before abstracting — duplication is cheaper than a premature `mode` prop.
