---
title: Accessible Forms & Errors
summary: Labels, grouping, validation messaging and focus — the mechanics that decide whether a form is usable without sight.
level: core
minutes: 20
order: 4
tags: [accessibility, forms, validation]

related:
  - frontend/state-and-data/forms-and-validation
  - frontend/accessibility/live-regions-and-dynamic-content
  - frontend/accessibility/keyboard-navigation-and-focus-management

resources:
  - title: Forms tutorial
    url: https://www.w3.org/WAI/tutorials/forms/
    source: W3C WAI
    type: docs
    minutes: 35
    primary: true
  - title: Creating accessible forms
    url: https://webaim.org/techniques/forms/
    source: WebAIM
    type: article
    minutes: 25
  - title: aria-describedby
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby
    source: MDN
    type: docs
    minutes: 15
---

## In one line

Every input needs a programmatically associated label, every error needs to be announced and tied to its field, and a failed submit needs to put focus where the user must act.

## What it is

**Labels first.** A `<label for="email">` associated with an `id`, or the input wrapped inside the label. Placeholder text is not a label — it disappears on focus, fails contrast requirements in most implementations, and is not reliably announced. `aria-label` works when a visible label genuinely cannot exist (a search field with only a magnifier icon), but a visible label is better for everyone, including people with cognitive differences who lose the context once the placeholder vanishes.

**Grouping** carries meaning that individual labels cannot. Radio buttons and related checkboxes belong in a `<fieldset>` with a `<legend>`, so a screen reader announces the question along with each option — otherwise the user hears "Yes" and "No" with no idea what is being asked.

**Errors** need three connections. `aria-invalid="true"` on the field marks its state. `aria-describedby` pointing at the error element ties the message to the input, so it is read when the field receives focus. And the error text itself must be perceivable when it appears — usually via a live region, or by moving focus.

**On submit failure, move focus to the first invalid field.** Without that, a screen reader user gets no indication anything happened, and a sighted keyboard user has to hunt. A summary at the top listing the errors as links to each field is the pattern for long forms, and it also helps everyone else.

**Do not rely on colour alone** to indicate an error — an icon, a border change, and the message text carry it for people who cannot distinguish the red.

**Required fields** should use the `required` attribute (which conveys state natively) rather than only an asterisk, and the asterisk's meaning should be explained.

**Timing** matters for cognition as much as for accessibility: validating on every keystroke announces errors while the user is still typing, which for a screen reader is a stream of interruptions. Validate on blur, then on change once a field has already errored.

Finally, **autocomplete attributes** — `autocomplete="email"`, `"given-name"`, `"street-address"` — are a WCAG 2.1 requirement and a genuine usability win, letting browsers and assistive tools fill fields correctly.

## Why it matters

Forms are where users commit — sign up, pay, submit an application — so an inaccessible form is not a degraded experience, it is a blocked one.

They are also the densest source of WCAG level A failures, which makes them the first thing an audit examines.

## Key points

- Associate a real `<label>` with every input; a placeholder is not a label.
- Group related controls in a `<fieldset>` with a `<legend>` so the question is announced with the options.
- Mark invalid fields with `aria-invalid` and connect the message with `aria-describedby`.
- Move focus to the first invalid field on submit failure, with an error summary for long forms.
- Never signal an error with colour alone.
- Use the `required` attribute rather than relying on an asterisk.
- Validate on blur then on change, not on every keystroke, and set correct `autocomplete` values.
