# What will prove it

**`molly move <change> deployed` from `draft` names the five states it passed**, in sequence order,
and the ledger afterwards holds exactly one transition event, `draft → deployed`. Both halves in
one assertion: the naming is worthless if it arrives with invented events, and the events are the
thing this change is careful about.

**A multi-edge return names them in the direction travelled.** `deployed → review` names
`implemented`, `in_progress`, `approved` — walked backwards, so the order reads the way the move
went rather than the way the sequence is written.

**An adjacent move prints exactly what it prints today.** Byte-identical, asserted, because the
common case is the one that must not get noisier — and a clause that fires when nothing was skipped
would train people to read past it.

**`from === to` is unchanged.** The already-in-that-state line, exit `0`, no event, no clause.

**`between` is pure and total.** Every ordered pair of the eight states, including equal pairs and
pairs spanning the terminal state, returns without throwing and returns the states strictly between
them. Asserted directly against core, because this is arithmetic and a table is cheaper than
provoking each case through the CLI.

**The exit code stays `0`.** A skip is reported, never refused — asserted so that a later change
adding move policy has to break this test deliberately rather than by accident.
