---
title: A roadmap is a slice of planned work
lang: en
part: tasks
---

# The work, in order

Each step leaves the tool building and the smoke suite passing.

## Core

1. `templates.ts`: replace the roadmap body with the slice shape — the four headings from
   `plan.md`, each with a line saying what belongs under it.
2. `scaffold.ts`: add the `molly-roadmap` skill to `SKILLS`, with a description that fires on
   *plan*, *what is next* and *draft the next change*, not only on *roadmap*. Body per `plan.md`.
3. `scaffold.ts`: `molly-new` gains one line pointing at the slice. A pointer, never a copy — no
   corpus content enters a skill.
4. `roadmap.ts` in core: drop `capability` from `RoadmapRecord`.

## Store

5. `readRoadmap` stops reading `capability:` and reports a slice that carries one.
6. `writeRoadmapEntry` stops accepting it.

## CLI

7. `molly roadmap new` drops `--capability`; `bin.ts` `FLAGS` drops it so it is refused by name.
8. `status.ts` stops rendering a capability for a slice.
9. `status.ts`: reword the realised finding — name the changes that have published against the
   slice and ask whether the plan is still current, instead of saying retire it.

## The corpus this repository keeps

10. Reshape the seven entries in `docs/roadmap/` into slices, by hand, in one diff.
11. Write `publish/specs/planning-what-is-not-a-change-yet/spec.md` — the area now holds slices, the
    command takes no capability, and the finding is reworded.
12. Write `publish/specs/agent-instructions/spec.md` — there is a fifth skill and what it teaches.
    Start from what is in `specs/agent-instructions/` today, which `0012`, `0013` and `0014` all
    wrote on top of.
13. `molly agents` to reinstall, and `molly agents --check` to prove it clean.
14. `docs/conventions.md`: name the slice as where planning lives.
