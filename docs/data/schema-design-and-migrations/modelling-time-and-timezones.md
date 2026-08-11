---
title: Modelling Time & Timezones
summary: Store instants in UTC with timestamptz, store civil time as what the user meant, and never store an offset as a timezone.
level: core
minutes: 20
order: 3
tags: [data, modelling, correctness]

related:
  - data/relational-fundamentals/constraints-and-data-integrity
  - data/schema-design-and-migrations/designing-a-schema-for-a-feature
  - frontend/javascript/coercion-and-equality

resources:
  - title: Date/Time Types
    url: https://www.postgresql.org/docs/current/datatype-datetime.html
    source: PostgreSQL
    type: docs
    minutes: 25
    primary: true
  - title: Don't Use timestamp (without time zone)
    url: https://wiki.postgresql.org/wiki/Don%27t_Do_This#Don.27t_use_timestamp_.28without_time_zone.29
    source: PostgreSQL Wiki
    type: docs
    minutes: 10
  - title: The Problem with Time & Timezones
    url: https://www.youtube.com/watch?v=-5wpm-gesOY
    source: Computerphile
    type: video
    minutes: 10
---

## In one line

There are two different things called "time" — a point on the global timeline and a wall-clock reading in some place — and most date bugs come from storing one and meaning the other.

## What it is

**An instant** is "when did this happen": a log entry, a message, a payment. Store it as `timestamptz`. Despite the name, Postgres does not store a zone — it converts the input to UTC on write and renders it in the session zone on read. That is exactly what you want, and it is why `timestamp without time zone` is the wrong default: it stores a number with no meaning, and two services with different local zones will disagree about what it says.

**A civil time** is "9am on the 14th, local" — a meeting, an alarm, a business-hours rule, a birthday. Converting it to UTC at write time is a bug, because governments change offsets: a recurring 9am standup stored as 08:00Z shifts to 10am local when DST changes. Store the local date/time plus the **IANA zone name** (`Europe/Berlin`), and resolve to an instant at read time. `America/New_York`, never `EST` and never `-05:00` — an offset is a value of a zone at a moment, not the zone itself.

**Dates are not timestamps.** A birthday or an invoice date is a `date`; giving it a time and a zone creates a value that is a different day depending on where you read it.

**Ranges and periods.** Prefer half-open intervals — `[start, end)` — so adjacent periods neither overlap nor gap, and `BETWEEN` on timestamps stops silently excluding the last millisecond of a day. Postgres range types plus an exclusion constraint enforce non-overlap directly.

Operationally: keep the database session zone at UTC and format only at the edge, in the UI, using the user's zone; store a user's zone preference explicitly rather than inferring it per request; and remember that the tz database gets updated several times a year, so a system that caches offsets will drift. Postgres 17 added `timestamptz` support to `AT LOCAL`, but the modelling rule is unchanged.

## Why it matters

Scheduling, billing periods, retention windows, "today's usage", and rate limit resets all hinge on this, and the bugs surface at DST boundaries, at month ends, and for the one user in a half-hour-offset zone — always in production and never in tests. In interviews it shows up as a follow-up on any feature with recurrence.

## Key points

- `timestamptz` stores an instant in UTC and renders in the session zone; `timestamp` stores an ambiguous number — default to the former.
- Future civil times must be stored as local time plus an IANA zone name, not pre-converted to UTC.
- A zone is `Europe/Berlin`; `CET` and `+01:00` are offsets that are only correct at a moment in time.
- Use `date` for dates; adding a time and zone makes the day depend on the reader's location.
- Half-open ranges `[start, end)` avoid the double-counting and boundary-gap bugs `BETWEEN` produces.
- Set application and database sessions to UTC and convert only at the presentation edge.
- Store the user's timezone as an explicit preference; inferring it per request produces inconsistent history.
