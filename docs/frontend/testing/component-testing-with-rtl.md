---
title: Component Testing with Testing Library
summary: Rendering components and asserting what a user would see, with the query priority that keeps tests accessible and durable.
level: core
minutes: 25
order: 3
tags: [testing, react, rtl]

related:
  - frontend/testing/frontend-testing-strategy
  - frontend/testing/mocking-the-network-with-msw
  - frontend/accessibility/semantic-html-and-the-accessibility-tree

resources:
  - title: React Testing Library
    url: https://testing-library.com/docs/react-testing-library/intro/
    source: Testing Library
    type: docs
    minutes: 25
    primary: true
  - title: About Queries
    url: https://testing-library.com/docs/queries/about/
    source: Testing Library
    type: docs
    minutes: 20
  - title: Common mistakes with React Testing Library
    url: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
    source: Kent C. Dodds
    type: article
    minutes: 20
---

## In one line

Testing Library renders a component and gives you queries that find elements the way a user or a screen reader would, which is what makes the tests both durable and an accessibility check.

## What it is

The **query priority** is the design of the library, not a style guide. `getByRole` first — with the accessible name — because that is how assistive technology finds things, and a component that cannot be queried by role is usually one that is inaccessible. Then `getByLabelText` for form fields, `getByPlaceholderText`, `getByText`, and only as a last resort `getByTestId`. A suite that is all test ids has opted out of the main benefit.

The **three prefixes** matter and are constantly confused. `getBy` throws if absent and is for things that must be there now. `queryBy` returns `null` and is the only correct choice for asserting absence. `findBy` returns a promise and retries, which is what you use for anything that appears after an async update.

**`userEvent` over `fireEvent`.** `fireEvent.click` dispatches one event; `userEvent.click` reproduces the full sequence a real click produces — pointer events, focus changes, and the rest — which catches bugs the single synthetic event does not. It is async in current versions, so it needs awaiting.

**What to assert**: what the user perceives. Rendered text, an element's presence or absence, a disabled state, a value in a field, a call to a prop callback that represents an outward effect. What not to assert: internal state, that a hook ran, class names, or the shape of props passed to a child.

The recurring mistakes are worth naming because they appear in almost every codebase. Wrapping everything in `act()` — RTL already does it, and manual `act` usually means the wrong query. Using `waitFor` with an empty callback to "wait a bit" instead of `findBy`. Asserting on `container.querySelector`, which bypasses the accessible tree entirely. And snapshotting a whole component, which produces a test that fails on every change and is approved without being read.

**Render with the providers the component needs** — router, query client, theme — via a custom render helper, so tests do not each reassemble the tree.

Two boundaries. Testing Library runs in jsdom, which is not a browser: layout, real CSS, and scroll behaviour are not there, so anything visual belongs in a browser-based or visual regression test. And a test that needs extensive mocking of internals is telling you the component has too many responsibilities.

## Why it matters

This is the level where most frontend confidence is bought, and query discipline is what determines whether the suite survives a refactor.

Take-homes are read for it: `getByTestId` everywhere, `fireEvent`, and snapshot tests all read as unfamiliarity with the tool.

## Key points

- Query by role and accessible name first; a component you cannot query that way is usually inaccessible.
- `getBy` for present, `queryBy` for absent, `findBy` for eventually — mixing them up causes most flakiness.
- `userEvent` reproduces the real interaction sequence; `fireEvent` fires one synthetic event.
- Assert what the user perceives, never internal state or props passed to children.
- Manual `act()`, empty `waitFor`, and `container.querySelector` are all signals of a wrong approach.
- Use a custom render that includes the app's providers.
- jsdom has no layout — visual behaviour needs a real browser or visual regression.
