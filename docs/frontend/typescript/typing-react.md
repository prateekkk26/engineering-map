---
title: Typing React
summary: Props, children, refs, events and generic components — the patterns that come up daily and the ones that are now legacy.
level: core
minutes: 25
order: 10
tags: [typescript, react]

related:
  - frontend/typescript/generics-and-constraints
  - frontend/architecture/component-api-design
  - frontend/react/refs-and-imperative-escape-hatches

resources:
  - title: TypeScript with React
    url: https://react.dev/learn/typescript
    source: react.dev
    type: docs
    minutes: 30
    primary: true
  - title: React TypeScript Cheatsheet
    url: https://react-typescript-cheatsheet.netlify.app/
    source: React TypeScript Cheatsheet
    type: docs
    minutes: 40
  - title: useRef
    url: https://react.dev/reference/react/useRef
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

Type the props object directly, let return types be inferred, and reach for `ComponentProps` rather than re-declaring what the DOM already describes.

## What it is

**Props.** Declare a plain type or interface and annotate the parameter. `React.FC` is legacy — it used to add an implicit `children`, no longer does, and complicates generic components; the current guidance is not to use it. Return type inference is fine; annotating `JSX.Element` buys nothing and breaks components that return `null`.

**Children** are `React.ReactNode` — the widest correct type, covering strings, numbers, elements, arrays, and `null`. `ReactElement` is narrower and appropriate only when you genuinely require a single element.

**Extending DOM props** is the pattern that saves the most work: `ComponentProps<'button'>` gives every native attribute, and `ComponentPropsWithoutRef<'button'>` excludes the ref. Wrapping a component becomes `Omit<ComponentProps<'button'>, 'onChange'> & { onChange: (v: Value) => void }` — extend, override the one prop, done.

**Events** are typed by element and handler: `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, `React.FormEvent<HTMLFormElement>`. If you write the handler inline in JSX, the parameter is inferred and you need none of them — which is the argument for inline handlers in simple cases.

**Refs.** `useRef<HTMLDivElement>(null)` gives `RefObject<HTMLDivElement | null>` for DOM nodes; `useRef<number>(0)` gives a mutable `MutableRefObject`. The distinction is initial value and whether `null` is included. React 19 makes `ref` a normal prop, so `forwardRef` and its awkward generic signature are legacy in new code.

**Hooks.** `useState` infers from the initial value, and you only need an explicit parameter when the initial value is narrower than the eventual type — `useState<User | null>(null)` being the ubiquitous case. `useReducer` types well from a discriminated union of actions, which is where exhaustiveness checking pays off.

**Generic components** are how you type a `<List items={...} renderItem={...} />` so the render callback receives the right element type. The syntax needs a trailing comma in `.tsx` — `<T,>(props: Props<T>)` — because the parser would otherwise read a JSX tag.

Finally, **discriminated unions for props** encode mutually exclusive APIs: a button that is either a link with `href` or a button with `onClick`, never both.

## Why it matters

This is the daily surface of TypeScript for a frontend engineer, and the difference between a component that is pleasant to consume and one that fights its users is largely here.

Take-homes are read for it directly: `React.FC`, `any` props, and hand-declared DOM attributes all read as dated.

## Key points

- Type the props parameter; skip `React.FC` and let the return type infer.
- `ReactNode` for children; `ReactElement` only when a single element is genuinely required.
- `ComponentProps` and `ComponentPropsWithoutRef` extend native elements instead of re-declaring attributes.
- Inline handlers infer their event type — explicit `React.ChangeEvent<...>` is for extracted handlers.
- `useRef<T>(null)` for DOM nodes versus `useRef<T>(initial)` for mutable values; React 19 retires `forwardRef`.
- Annotate `useState` only when the initial value is narrower than the eventual type.
- Generic components need the `<T,>` trailing comma in `.tsx`; discriminated union props express exclusive APIs.
