---
title: The ledger names a change that is gone
lang: en
part: tasks
---

# The work, in order

1. `core/lifecycle.ts`: `nodesIn(events)` — distinct nodes, first-seen order, pure.
2. `cli/status.ts`: the `orphaned` finding — a ledger node with no bundle in flight or archived.
   `fails: false`.
3. `cli/status.ts`: render it, and say when an unrecorded bundle sits in the same run, so one `mv`
   reads as one problem.
4. `cli/move.ts`: report it before acting.
5. Smoke assertions per `tests.md`.
6. `publish/specs/the-state-of-a-change/spec.md` — what a fold does with a node it has no events
   for, and what the record says when a bundle is gone.
7. `publish/specs/what-a-command-may-never-do-silently/spec.md` — a record that names something
   absent is not silently skipped.
