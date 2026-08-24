---
title: A new corpus can merge its own ledger
lang: en
part: tasks
---

# The work, in order

1. `store/layout.ts`: `ATTRIBUTES`, and the pattern line beside `HISTORY_FILE`.
2. `store/scaffold.ts`: write it as part of the corpus skeleton, reporting created / present /
   present-without-the-line.
3. `cli/init.ts`: name it in the summary; add it to the already-here block; print the line to paste
   when the file is there without the pattern.
4. Smoke assertions per `tests.md`, including the merge itself.
5. `publish/specs/the-state-of-a-change/spec.md` — the ledger is born mergeable, and why union is
   correct for it and for nothing else.
