# The work, in order

1. Merge `HELP` and `FLAGS` in `bin.ts` into one table keyed by command, carrying usage, summary,
   flags and refusals. Nothing about the output changes yet — this is the shape the rest needs.
2. Point `checkFlags` and the global `help()` listing at the merged table, so both surfaces read
   one structure. The listing's output must be byte-identical afterwards; that is the check.
3. `molly <command> --help` renders one entry, dispatched before `checkFlags` and before `locate`,
   with an unknown command still falling through to the typo message.
4. Fill in the refusal lines, one command at a time, from each command's own `fail()` calls.
5. The harness: an entry for every command in the listing, `--help` answering outside a corpus,
   `molly frobnicate --help` getting the unknown-command message, and each named refusal asserted
   to still fire.
6. `specs/finding-the-corpus` rewritten whole — the dispatch order gains what `--help` resolves to.
