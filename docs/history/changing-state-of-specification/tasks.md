# The work, in order

Core before store before CLI, because each layer is the vocabulary the next one speaks. The
invariants come with the table rather than after it — a table nobody checked is a table that
was already wrong when the first command read it.

1. **The sequence.** `packages/core/src/lifecycle.ts` — the `State` union, the eight states in
   order, `INITIAL` and `TERMINAL` derived from the ends of that list rather than declared
   beside it.

2. **Direction without a table.** `positionOf` and `directionOf` — which way a move went,
   derived by comparing positions, so it holds for moves nobody enumerated.

3. **Folding.** `stateOf(events, node)` — no events is `draft`; otherwise the `to` of the last
   event for that node, by position. Events for other nodes are skipped, not refused.

4. **The ledger.** `packages/store/src/history.ts` — append one JSON line with a fixed field
   order and a `kind`, read them all back, and read a line written before kinds existed as a
   transition rather than refusing it. A malformed line is reported and skipped rather than dropped, and
   an absent ledger is reported too.

5. **Reporting what cannot be read.** A stray file, a bundle with no entry, frontmatter that
   will not parse — each named rather than skipped, and `status` distinguishing "nothing here"
   from "nothing here could be read".

6. **Reading a change.** `packages/store` gains frontmatter parsing (the `yaml` package, in
   store only — core stays dependency-free) and a scan of `changes/` returning each bundle's
   record, its slug, and the `state:` it declares.

7. **`molly move [<change>] [<state>]`.** Bare or qualified name. Same-state is a no-op exiting
   0. Two refusals remain and both are about the argument rather than the order: a state that
   does not exist and a change that does not exist.

8. **`molly status`.** The name first, then state, kind and title. An empty corpus says so
   rather than printing an empty table.

9. **The projection.** `withField` in core; `state:` written at creation and updated on every
   move; the fold compared with what the document declares, by `status` and again before any
   move. **The comparison ships in the same step as the field** — a projection nothing checks
   is a second source of truth, and adding the check afterwards means shipping one first.

10. **Creation as an event.** `molly change new` appends a `created` line; `isRecorded` in core;
    `status` reports a bundle the ledger has never heard of. **This ships with the projection,
    not after it** — without it, "just created" and "nobody recorded this" are the same
    observation and the orphan cannot be seen.

11. **Who did it.** `identity.ts` reads git config, falls back to the literal `unknown`, and is
    passed into the event rather than read inside core.

12. **Picking.** `selectableStates` and `selectableChanges` in core with their filter rule, and
    the prompt as a shell over them. Nothing is read from a terminal that the pure functions
    could not answer.

13. **Assert all of it**, including that the sequence is well formed, both directions of the
    filter rule, and the drift check. Assert too that a move which skips states *succeeds* —
    the absence of enforcement is a decision, and a decision nothing checks is one that gets
    quietly reversed.
