---
title: An existing corpus receives what a later version writes
lang: en
kind: feature
capability: the-corpus
state: draft
alters:
  - specs/finding-the-corpus
---

# What this change makes true

**`molly init` in a repository that already has a corpus completes it rather than refusing.** It
writes what this version writes and is not there, keeps every file it finds, names what it kept,
and still refuses to write a second `mollyguard.yml`.

**`molly status` names what the skeleton is missing**, so the gap is visible from the command a
planner already runs rather than only from the command that closes it.

# Why

**The skeleton is written by exactly one command, and that command refuses an existing corpus.**
`allDirectories()` and `readmeFor()` are called from `init.ts` alone; `initCommand` refuses outright
when `corpusAt(cwd)` finds a configuration here. So **everything this tool adds to the shape of a
corpus reaches new corpora only**, permanently, and no version of the tool has a way to say so.

**That is not cosmetic, and `0017` is the proof.** `<root>/.gitattributes` with `merge=union` was
written to fix a real defect: two branches each advancing a change conflict in
`.mollyguard/history.jsonl`, the one file every skill says never to hand-edit, and — in that
change's own words — *the remedy was undiscoverable*. It ships in `init`. **Every corpus created
before it still has the defect, and still has no remedy**, because the command that carries the fix
declines to run. A bug fix that only new users receive is not a bug fix.

Two more of the same shape, smaller: the area explainers changed with this version and an existing
corpus keeps the earlier text for ever, with nothing comparing the two; and the configuration moved
out of the corpus in `0012` with no command to move it.

**The recipe that works today is to defeat the refusal.** The first repository to adopt 0.2.0 holds
a complete current skeleton — `.gitattributes`, `.mollyguard/README.md` and five of seven area
explainers byte-identical to what this version writes, every one of them stamped within a minute of
the others, in a corpus that already held its documents. That is `init` run after the configuration
was removed so `corpusAt` would find nothing. It worked, and the corpus is in good order.

It is still the wrong instruction. The refusal exists to stop a second answer to *where is the
corpus*; the upgrade path is to delete that answer, run the command, and put it back. Nothing
documents it, so the next project invents its own version — and a project that guesses wrong at
that particular manoeuvre loses the one file that cannot be written again from anything.

**The refusal is right about the thing it was written about.** [Finding the
corpus](../../specs/finding-the-corpus/spec.md) says a second `init` is refused because *one
configuration names one corpus*. That is an argument about a file, and it has been doing duty as an
argument about the whole command.

**No area has been added since 0.1.0**, so the widest version of this has not bitten yet. It is
named because the areas are a table, and a table exists so the next entry does not need a migration
note somebody has to find.

# What this must not become

**A rewrite.** An explainer the tool finds is kept, always, whoever wrote it and however far it has
drifted. `place` already behaves this way for every file `init` writes, and this adds no exception:
a project that made an area's README its own does not lose it to an upgrade. Whether the drift is
ever *reported* is a separate claim, left open below.

**A second command.** `molly upgrade` was the obvious shape and is refused: it would have to answer
*what is an upgrade* for ever, and each version would add one more thing to it. What this needs is
the command that already writes the skeleton, no longer refusing for a reason that belongs to a
different file.

**A finding that fails.** `molly status` reports the gap and the exit code stays `0`. A corpus that
works and predates a file a later version writes is not broken, and failing the build over it would
make upgrading the tool a build break.

**A migration of anything.** Nothing here moves a document, renames a directory, or reconciles a
ledger. It creates what is absent and reports what it kept.

# What this leaves open

**Whether what is on disk is ever compared with what this version writes.** The corpus above
hand-edited two explainers after initialising, and one of them now contradicts the tool — its
`roadmap/README.md` no longer mentions `molly roadmap new` or `--realises`. `molly agents --check`
does exactly this comparison for the instructions installed *outside* the corpus, and nothing does
it inside. It is a different claim from this one, because it has to answer what happens when a
project has deliberately made a file its own. Named so the gap is on the record. Related:
[`0023`](../0023-a-corpus-arrives-with-a-place-for-the-project-s-own-rules/change.md), which gives
a project's rules somewhere to live that is not a file the tool generates.
