# How it will be built

**One table, keyed by command.** `bin.ts` holds two today: `HELP`, a list of usage-and-summary
pairs, and `FLAGS`, a record of the flags each command takes. They are the same key in two shapes,
and the entry a per-command help has to print is both of them plus a short list of what the command
refuses. Merging them is most of the work, and it is worth doing for its own sake — the harness
already asserts that every command appears in `molly help`, and it can then assert one structure
rather than agreeing with two.

**Answered where `--help` is already answered**, first in the dispatch order, before `checkFlags`
and before the corpus is located. That order is specified and stays: `molly publish --help` outside
a corpus must answer, because a caller finding out what a command needs is exactly the caller who
has not set one up yet. The only change is that the answer is looked up by command name rather than
being the global listing.

**An unknown command asking for help gets the typo's message**, not an empty entry. That is the
existing unknown-command message, reached by falling through rather than by a second check.

**Refusals are written, not derived.** A command's `fail()` calls cannot be enumerated from the
source, so each entry carries a line or two naming what the command declines to do — `publish`
refuses a bundle whose `state:` disagrees with the ledger, `move` refuses to record `published`.
This is the one part that can drift, so it is short, it names refusals rather than describing them,
and the harness asserts that the refusal each entry names still fires.

## What this rules out

**Per-command help as a separate document set.** No `docs/`-adjacent manual, no man pages, no
generated markdown. The tables are the source and the terminal is the surface.

**Changing what `molly help` prints.** The bare listing is the index and stays as it is. This adds
a leaf, not a redesign.

**`-h`.** One spelling. A second is a second thing to test on every command for no information.

# What this constrains afterwards

**A command added answers `--help` in the same place it answers everything else.** Once the tables
are one, a new command that fails to describe itself is a type error rather than an omission
somebody notices later — which is the same argument `FLAGS` and the `OUTSIDE` set already make, and
the reason both are tables rather than conditions.
