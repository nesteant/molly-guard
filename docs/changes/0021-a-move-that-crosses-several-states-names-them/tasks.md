# The work, in order

1. `between(from, to)` in `packages/core/src/lifecycle.ts`, beside `directionOf`. Pure, both
   directions, empty for adjacent and for equal.
2. `move.ts` renders the clause when `between` is non-empty. The adjacent-move output must not
   change.
3. The harness: a six-edge advance names five states in order, a multi-edge return names them in
   the direction travelled, an adjacent move's line is byte-identical to today's, and the ledger
   holds exactly one event in every case.
4. `specs/the-state-of-a-change` and `specs/what-a-command-may-never-do-silently` rewritten whole.
