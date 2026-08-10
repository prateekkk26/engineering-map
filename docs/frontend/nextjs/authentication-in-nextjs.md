---
title: Authentication in Next.js
summary: Where sessions live, where authorisation is actually enforced, and why the layout you thought was protecting a route is not.
level: core
minutes: 30
order: 10
tags: [nextjs, auth, security]

related:
  - frontend/nextjs/server-actions
  - frontend/security/auth-token-storage
  - frontend/security/server-action-and-rsc-authorisation

resources:
  - title: Authentication
    url: https://nextjs.org/docs/app/guides/authentication
    source: Next.js
    type: docs
    minutes: 40
    primary: true
  - title: cookies
    url: https://nextjs.org/docs/app/api-reference/functions/cookies
    source: Next.js
    type: docs
    minutes: 15
  - title: Auth.js
    url: https://authjs.dev/getting-started
    source: Auth.js
    type: docs
    minutes: 30
---

## In one line

Keep the session in an httpOnly cookie, verify it close to the data rather than at the edge of the app, and assume every server action and route handler can be called directly.

## What it is

Split the problem in two. **Authentication** establishes who the caller is; **authorisation** decides what they may do. Most Next.js auth bugs are authorisation bugs — the login works fine, and something else is reachable that should not be.

Session state belongs in an httpOnly, `Secure`, `SameSite=Lax` cookie. That keeps it out of reach of XSS, which is the argument against `localStorage` for tokens. Read it server-side with `await cookies()` — async, and mandatory in Next 16.

The structural mistake is putting the check in the wrong place. A `layout.tsx` that redirects unauthenticated users looks like a guard, and it is not: layouts do not re-render on every navigation, and they do not run at all when a server action or route handler is invoked directly. The same applies to `proxy.ts` — useful as a fast bounce for obviously-logged-out traffic, but not the boundary.

The boundary that holds is **data access**. Verify the session in the function that reads or writes the data, so every path — page render, server action, route handler, background job — passes the same check. A `getCurrentUser()` wrapped in `React.cache` makes that cheap enough to call everywhere, and the "data access layer" pattern in the Next docs is exactly this.

Two Next-specific hazards. Server components must not pass whole user records to client components — one stray prop leaks a password hash or an email into the RSC payload, which is visible in the browser. Return only the fields the UI needs, and use the `taint` API to make the mistake loud. And any per-user data must never end up in a shared cache: cache keys derived from cookies belong in `use cache: private`, not the shared store.

For the implementation itself, use a library. Auth.js, Clerk, WorkOS, or Better Auth all handle session rotation, CSRF, and OAuth callbacks — a hand-rolled session is a lot of subtle security surface for no product value.

## Why it matters

"Walk me through auth in your app" is standard in senior loops, and the follow-up is always "what stops me calling that server action directly?" The answer has to be a check inside the action, not a redirect in a layout.

It is also the highest-consequence area of a take-home: a reviewer who finds an unprotected mutation stops reading.

## Key points

- Sessions belong in httpOnly, Secure, SameSite cookies, read server-side with `await cookies()`.
- Layouts do not re-render per navigation and do not run for direct action or handler calls — they are not a guard.
- `proxy.ts` is a fast bounce, not the authorisation boundary.
- Enforce authorisation in the data access layer so every entry point goes through the same check.
- Never pass whole user objects across the server-client boundary; select fields and use `taint` to catch slips.
- Per-user data must not land in a shared cache — use the private variant or don't cache it.
- Use an auth library rather than hand-rolling sessions, rotation, and CSRF.
