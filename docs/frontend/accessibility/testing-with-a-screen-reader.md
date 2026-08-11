---
title: Testing with a Screen Reader
summary: A practical routine for using NVDA and VoiceOver well enough to find the issues automation cannot.
level: deep
minutes: 20
order: 8
tags: [accessibility, testing, screen-readers]

related:
  - frontend/testing/accessibility-in-tests
  - frontend/accessibility/semantic-html-and-the-accessibility-tree
  - frontend/accessibility/building-accessible-components

resources:
  - title: Screen reader testing
    url: https://webaim.org/articles/screenreader_testing/
    source: WebAIM
    type: article
    minutes: 25
    primary: true
  - title: NVDA
    url: https://www.nvaccess.org/about-nvda/
    source: NV Access
    type: docs
    minutes: 20
  - title: VoiceOver Getting Started
    url: https://support.apple.com/en-gb/guide/voiceover/welcome/mac
    source: Apple
    type: docs
    minutes: 30
---

## In one line

You do not need to be proficient — twenty minutes of basic screen reader use finds the issues no automated tool reports, because the failures are about comprehension, not attributes.

## What it is

**Which ones.** NVDA with Firefox or Chrome on Windows is free and represents the largest share of real usage; VoiceOver with Safari on macOS is built in and covers Apple's ecosystem; JAWS is heavily used in enterprise but commercial. Testing on one is dramatically better than none; two is a reasonable target. They differ enough that "works in VoiceOver" is not a guarantee.

**The minimum commands** are few. VoiceOver: Cmd+F5 to toggle, Control+Option as the modifier, Control+Option+arrows to navigate, Control+Option+U for the rotor listing headings, links and landmarks. NVDA: Ctrl+Alt+N to start, Insert as the modifier, H to jump between headings, D for landmarks, F for form fields, Insert+F7 for the elements list. Learn those and you can evaluate a page.

**A useful routine**, in order. Turn off the monitor or close your eyes for the first pass — it removes the temptation to compensate visually. Navigate by heading and check the outline makes sense on its own. Tab through and confirm every stop announces what it is and what it does. Complete the primary task end to end. Trigger an error and confirm it is announced and findable. Open a dialog and check focus enters, is trapped, and returns.

**What you will find** that automation does not: alternative text that is present but useless ("image", "icon"), a link that says "click here" with no context, an announcement order that makes the page incomprehensible, a status change nobody hears, a modal that leaves focus behind it, and a custom control announcing a role that does not match what it does.

Two things worth knowing so results are interpretable. **Browse mode and focus mode** in NVDA behave differently — browse mode reads the document, focus mode passes keys to the application — and a widget that works in one can be unusable in the other. And a **screen reader magnifies existing defects**: a page that is confusing visually is far worse aurally, so some findings are information architecture problems rather than markup problems.

Finally, this does not substitute for **testing with actual users**. An expert user navigates differently and faster than you will, and their judgement about what is usable is the one that counts.

## Why it matters

Automated tooling covers roughly a third of issues; the remaining two-thirds are judgement calls about comprehension that only a human using the product can assess.

It also changes how you build: hearing your own interface read aloud is a fast, permanent lesson in why semantic structure matters.

## Key points

- NVDA with Firefox or Chrome, and VoiceOver with Safari, cover most real usage — one is far better than none.
- A handful of commands (rotor, heading jump, elements list) is enough to evaluate a page.
- Test blind: navigate headings, tab through, complete the task, trigger an error, open a dialog.
- The findings are comprehension failures — useless alt text, contextless links, unannounced changes.
- NVDA's browse and focus modes behave differently; check widgets in both.
- Screen readers amplify existing structural confusion, so some findings are IA problems.
- This complements but does not replace testing with actual screen reader users.
