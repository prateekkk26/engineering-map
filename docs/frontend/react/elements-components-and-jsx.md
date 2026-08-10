---
title: Elements, Components & JSX
summary: What JSX compiles to, why an element is a plain object, and where the boundary between a component and its output actually sits.
level: core
minutes: 20
order: 2
tags: [react, jsx, fundamentals]

related:
  - frontend/react/react-mental-model
  - frontend/react/reconciliation-and-keys
  - frontend/typescript/typing-react

resources:
  - title: Writing markup with JSX
    url: https://react.dev/learn/writing-markup-with-jsx
    source: react.dev
    type: docs
    minutes: 15
    primary: true
  - title: Why do React elements have a $$typeof property?
    url: https://overreacted.io/why-do-react-elements-have-typeof-property/
    source: Dan Abramov
    type: article
    minutes: 10
  - title: createElement
    url: https://react.dev/reference/react/createElement
    source: react.dev
    type: docs
    minutes: 10
  - title: Passing props to a component
    url: https://react.dev/learn/passing-props-to-a-component
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

JSX is syntax sugar for a function call that returns a plain object describing what to render, and a component is the function that produces those objects.

## What it is

`<Button color="red">Save</Button>` compiles to a call — historically `React.createElement(Button, {color: "red"}, "Save")`, and with the modern JSX transform `_jsx(Button, {color: "red", children: "Save"})`. Either way the result is an object roughly of the shape `{type, props, key, ref}`. Nothing has been rendered, no DOM has been touched, and the function `Button` has not been called yet.

The distinction that matters is **element versus component**. A component is a function. An element is one invocation of it, described but not executed. `<Button />` is a value you can pass around, store in a variable, or put in an array; `Button()` is a function call that skips React entirely and inlines the output into the caller's render, which breaks hooks and state identity.

`type` is either a string for a host element (`"div"`, mapped to a DOM node by the renderer) or a function for a composite one. That single field is how the same element tree can drive react-dom, react-native, or a test renderer: the tree is a description, and the renderer decides what a `"div"` means.

Elements are immutable and frozen after creation. They also carry `$$typeof: Symbol.for('react.element')`, which exists as a security measure: a symbol cannot survive `JSON.parse`, so JSON injected from a server cannot masquerade as an element and inject markup.

Two props are not props. `key` is a hint for reconciliation, and `ref` is a channel for imperative access — both are read by React and stripped before your component sees them. Everything else, including `children`, is an ordinary prop, which is why `children` can be a function, an array, or anything else you can put in an object.

## Why it matters

Confusing a component with its element is behind the two most common structural bugs in React: calling a component as a function, and defining a component inside another component's body — where a new function identity each render means the whole subtree unmounts and remounts, losing its state.

It also unlocks composition. Once you see that `<Icon />` is just a value, passing an element as a prop, rendering `props.children` in a slot, or building a compound component stops being a pattern to memorise and becomes an obvious consequence of the model.

## Key points

- JSX is not HTML and not a template language — it compiles to a function call, so anything expressible as a value is expressible in JSX.
- An element is a plain immutable object `{type, props, key, ref}`; a component is the function that returns one. Rendering `<Button />` is not the same as calling `Button()`.
- `type` is a string for host elements and a function for composite ones, which is what makes the same tree renderable to DOM, native, or a test target.
- `$$typeof` is a real symbol so that server-supplied JSON cannot pretend to be an element — an XSS defence, not an implementation detail.
- `key` and `ref` are consumed by React and never appear in `props`; everything else, `children` included, is an ordinary prop.
- Defining a component inside another component gives it a new identity every render, which remounts the subtree and drops its state.
