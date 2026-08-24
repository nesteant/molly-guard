# How it will be built

**The refusal narrows to what it was about.** `initCommand` refuses today when `corpusAt(cwd)` finds
a configuration here. It keeps refusing to write a second `mollyguard.yml` — that file is the one
answer to where the corpus is — and stops refusing the rest of the run. The existing message becomes
the report of what was found rather than the reason nothing happened.

**Everything else is already written.** The loop calls `mkdir` with `recursive: true` and `put()`,
which calls `place`, which writes only where there is nothing and collects what it found into
`kept`. Run against an existing corpus it adds what is absent, keeps what is there, and names it.
The behaviour this change wants is what the loop does; what changes is being allowed to reach it.

**The summary distinguishes the two runs.** A corpus made now and a corpus completed now must not
print the same thing: the first says what it created, the second says what it added and what it
kept. `kept` already carries the second half.

**`status` reports the gap** by comparing what `init` writes against what is present — the areas
from `AREAS`, plus the files that are not areas: the corpus README, the ledger, the corpus
`.gitattributes`. Findings, not failures, each naming `molly init` as the remedy.

## What this rules out

**Touching the configuration.** A completing run reads `mollyguard.yml` and writes nothing to it —
not a merged key, not a comment, not a rewritten header. A corpus that declared `naming:` has its
policy left exactly as it is.

**Touching the ledger.** `history.jsonl` is placed by `put()` like everything else, so an existing
one is kept. Already asserted, and stays asserted: it is the one file in a corpus that cannot be
written again from anything, and it is the file the current workaround puts at risk.

**Deciding what a corpus is missing beyond the skeleton.** Not documents, not capabilities, not a
roadmap entry.

## Sequencing

This change and `0020-a-command-s-help-is-about-the-command-it-was-asked-of` both alter
`specs/finding-the-corpus`. A document publishes whole, so whichever lands second carries the
other's text. Named now rather than met at publication.

# What this constrains afterwards

**Anything added to the skeleton is something an existing corpus can obtain.** The next file `init`
learns to write answers this by being written through `put()`, which is where it would have gone
anyway — instead of by shipping a migration note that a project has to find and follow.
