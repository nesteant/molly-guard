# How it will be built

**Derived in core, rendered in the CLI.** `lifecycle.ts` holds `STATES`, `positionOf` and
`directionOf`; the states between two positions is one more pure function beside them — `between(from,
to)`, returning the states strictly between in the direction of travel, empty for an adjacent move.
It belongs with `directionOf` because it is the same arithmetic over the same sequence, and putting
it in the CLI would be the second place that knows the order.

`move.ts` prints it. The line it already emits gains a clause when `between` is non-empty and is
untouched when it is not, so the common case is byte-identical to today.

**The terminal state needs no special case.** `move` already refuses `published`, so the widest jump
this can describe ends at `deployed`.

## What this rules out

**Recording the skipped states.** Stated in `change.md` and repeated here because it is the change
somebody will propose next: the ledger gets one event because one move happened.

**Making the direction cleverer.** `advances` and `returns` stay as they are. The clause is
additional information in the same line, not a new vocabulary for describing a move.

## Sequencing

This change and `0022-publishing-names-what-it-moved-out-from-under` both alter
`specs/what-a-command-may-never-do-silently`, each adding one instance to a document whose whole
shape is a catalogue of them. A document is published whole, so whichever publishes second carries
the other's section. Named here rather than discovered at publication, when the remedy is rereading
the base and rewriting a payload already written.

# What this constrains afterwards

**A refusable move reports through this line, not around it.** When a transition gains subscribers
that can refuse or defer, what they say belongs in the same place a skip is named — one line per
move, saying everything the tool knows about it. A second output surface for move policy would be
two places to read before knowing what happened.
