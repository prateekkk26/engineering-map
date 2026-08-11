---
title: Systematic Frontend Debugging
summary: A repeatable method for finding a bug, and the browser tooling that answers each kind of question.
level: core
minutes: 25
order: 12
tags: [tooling, debugging, process]

related:
  - frontend/performance/diagnosing-a-slow-page
  - frontend/tooling/source-maps-and-production-debugging
  - frontend/testing/flaky-tests-and-determinism

resources:
  - title: Chrome DevTools
    url: https://developer.chrome.com/docs/devtools
    source: Chrome DevTools
    type: docs
    minutes: 40
    primary: true
  - title: Debug JavaScript
    url: https://developer.chrome.com/docs/devtools/javascript
    source: Chrome DevTools
    type: docs
    minutes: 25
  - title: React Developer Tools
    url: https://react.dev/learn/react-developer-tools
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

Reproduce, narrow, hypothesise, test one change — the method matters more than the tool, and the most common failure is fixing symptoms without understanding the cause.

## What it is

**Reproduce first, reliably.** A bug you cannot trigger on demand cannot be verified as fixed. Get the exact steps, the browser and device, the data, and the state. If it only happens in production, the gap between environments — data shape, feature flags, a third-party script, a slower device — is often the bug itself.

**Narrow before investigating.** Bisect: does it happen with a smaller input, on a simpler page, with extensions disabled, in another browser, on the previous release? `git bisect` against a reliable reproduction finds the introducing commit mechanically. Each narrowing halves the search space, which beats reading code.

**Form a hypothesis and test one thing.** Changing three things at once means learning nothing from the result. State what you believe, predict what you would observe, and check.

**Match the tool to the question.** *What is the value here?* Breakpoints — conditional and logpoints beat scattered `console.log`, and DOM breakpoints catch the code mutating an element. *Why did this request fail?* The network panel, with the request's full headers and payload. *Why did this re-render?* React DevTools' profiler with "why did this render" recording. *Why is it slow?* The performance panel with CPU throttling. *Why does it look wrong?* Elements, computed styles, and the layers panel. *Why is it leaking?* Heap snapshot comparison and detached nodes.

**Read the error properly.** The message, the stack, the first frame in *your* code rather than in a library, and whether the error is the cause or a downstream consequence. A stack that begins in `node_modules` is usually a bad value passed in three frames earlier.

**The recurring frontend causes** are worth having as a checklist: a stale closure capturing an old value, an effect with wrong dependencies, a race between two requests, an unhandled promise rejection, a `this` binding lost, a CSS specificity or stacking-context conflict, and a browser difference in a platform API.

Finally, **when you find it, fix the cause and add a test**. A fix without a test is one refactor away from returning, and the test is also the artefact that proves you understood the bug rather than perturbed it.

## Why it matters

Debugging is where most engineering time actually goes, and method is the difference between twenty minutes and a day — which makes it one of the highest-leverage skills to be deliberate about.

Live rounds often present a broken app and watch how you approach it; the process is what is being scored, not the answer.

## Key points

- Reproduce reliably first; the environment gap is often the bug.
- Narrow by bisecting inputs, pages, browsers, and commits before reading code.
- Change one thing per hypothesis, or the result teaches you nothing.
- Match tool to question: breakpoints for values, network for requests, profiler for renders, heap for leaks.
- Prefer conditional breakpoints and logpoints to scattered logging; use DOM breakpoints for mutations.
- Find the first frame in your own code — a stack starting in a library usually means a bad value passed in.
- Keep a mental checklist: stale closures, wrong deps, races, unhandled rejections, `this`, specificity, browser differences.
- Fix the cause and add a regression test that would have caught it.
