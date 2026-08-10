---
title: Forms & Validation
summary: Controlled versus uncontrolled, where validation actually belongs, and the accessibility requirements that make an error message useful.
level: core
minutes: 25
order: 15
tags: [forms, validation, accessibility]

related:
  - frontend/react/react-19-actions
  - frontend/typescript/runtime-validation-and-parse-dont-validate
  - frontend/accessibility/accessible-forms-and-errors

resources:
  - title: React Hook Form
    url: https://react-hook-form.com/get-started
    source: React Hook Form
    type: docs
    minutes: 25
    primary: true
  - title: Zod
    url: https://zod.dev/
    source: Zod
    type: docs
    minutes: 25
  - title: Client-side form validation
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
    source: MDN
    type: docs
    minutes: 30
---

## In one line

Keep the form uncontrolled unless you need to react to every keystroke, define the schema once and share it between client and server, and remember that a validation message nobody can hear is not validation.

## What it is

**Controlled** inputs put every keystroke through React state: full control, cross-field reactions, and a re-render per character. **Uncontrolled** inputs let the DOM hold the value and read it on submit, which is why React Hook Form is fast — most fields never cause a render at all. Default to uncontrolled and reach for controlled only where you genuinely need per-keystroke behaviour: a live search, a formatted currency input, a dependent field.

**Validation timing** matters more than the rules. Validating on every keystroke means telling someone their email is invalid while they are typing the second character — technically true and actively hostile. The pattern users tolerate is: validate on blur for the first pass, then on change once a field has already errored, so corrections update immediately. Validate everything on submit and move focus to the first error.

**Schema-first** is the arrangement that pays off. Define the shape once with Zod or Valibot, infer the TypeScript type from it, use it for client-side validation and again on the server. One definition, no drift, and the server keeps its guarantee — because client validation is a UX feature, not a security boundary. Every rule must be enforced again server-side.

**Server errors** are the part most implementations skip. A field-level error returned by the server needs to land on that field, not in a toast. React 19's `useActionState` makes that natural by treating the error as the action's return value.

**Accessibility** is not optional here and is mostly mechanical: a real `<label>` associated with every input, `aria-describedby` pointing at the error text, `aria-invalid` on the field, errors announced via a live region, and focus moved to the first invalid field on submit. An error styled in red with no programmatic association is invisible to a screen reader.

Finally, do not lose the user's work. Preserve entered values on a failed submit, warn before navigating away from a dirty form, and consider draft persistence for anything long.

## Why it matters

Forms are most of what a product frontend does, and a take-home is usually a form with validation and a failure path. Reviewers score exactly the things above: pending state, error placement, accessibility, and whether the data is validated again on the server.

## Key points

- Prefer uncontrolled inputs for performance; use controlled only where per-keystroke behaviour is genuinely needed.
- Validate on blur first, then on change once a field has errored — never from the first character.
- Define one schema, infer the type, and reuse it on the server; client validation is UX, not security.
- Return field-level server errors to their fields rather than a generic toast.
- Labels, `aria-describedby`, `aria-invalid`, a live region, and focus management are what make errors perceivable.
- Preserve entered values on failure and warn before discarding a dirty form.
