---
title: The knowledge base is read back
lang: en
part: tasks
---

# The work, in order

1. `store/base.ts`: `readBase(root)` over the publishable areas, driven from `AREAS`. Bundled areas
   read their `entry` file; flat areas read the file. Returns records and `unreadable`.
2. `store/index.ts`: export it.
3. `cli/status.ts`: `Report` gains `specs` and `decisions`; `gather` calls `readBase` once.
4. `cli/status.ts`: render the base — specifications by capability, decisions after.
5. `cli/status.ts`: `dangling-capability` for a published specification, `fails: true`.
6. `cli/status.ts`: `dangling-alters` for an in-flight change naming a base document that is not
   there, `fails: false`. Archived changes are not asked.
7. `cli/status.ts`: the base's `unreadable` lines join the reported set, not failing, and the
   document stays in the listing.
8. Smoke assertions per `tests.md`.
9. `publish/specs/what-a-command-may-never-do-silently/spec.md` — the base is an area the report
   shows.
10. `publish/specs/creating-a-change/spec.md` — `alters:` is resolved, late and without failing.
