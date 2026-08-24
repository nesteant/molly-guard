---
title: A command that needs a choice offers it
lang: en
part: tasks
---

# The work, in order

1. `pick.ts`: add `chooseFrom(items, { usage, empty })` — interactive select, non-interactive
   refusal with the list, refusal with the remedy when the set is empty, Ctrl+C as abandonment.
2. `pick.ts`: rewrite `chooseChange` in terms of it, so one implementation serves every caller.
   `move` and `publish` must behave identically afterwards — this step changes no output.
3. `change.ts`: `requireCapability` becomes `resolveCapability` — check when given, offer when not.
4. `change.ts`: `requireEntry` becomes `resolveEntry`, the same way.
5. `change.ts`: move both calls ahead of the write, so abandoning leaves nothing on disk.
6. `change.ts`: the capability prompt carries an explicit *none of these* option; choosing it
   prints the note printed today and exits `0`.
7. Write `publish/decisions/a-command-that-needs-a-choice-offers-it.md`.
8. Write `publish/specs/what-a-command-may-never-do-silently/spec.md` — a command that could have
   asked and refused instead is now one of the things it may not do.
9. Write `publish/specs/creating-a-change/spec.md` — `--capability` and `--realises` are offered,
   and the unfiled case is a question rather than a note.
10. Smoke assertions per `tests.md`.
11. `docs/conventions.md`: name the rule where it describes adding a command.

## Then, separately

Nothing in `0015-a-roadmap-is-a-slice-of-planned-work` conflicts, and one thing in it inherits:
`--realises <slice>` is offered by step 4 whichever of the two lands first. If 0015 lands first,
this change picks up slices with no extra work; if this lands first, 0015 has one less thing to
decide. Neither blocks the other.
