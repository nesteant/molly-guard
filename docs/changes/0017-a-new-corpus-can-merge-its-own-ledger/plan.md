---
title: A new corpus can merge its own ledger
lang: en
part: plan
---

# How it will be built

The skeleton already knows every file a corpus is born with, and this is one more — which is the
whole of why it is small.

**`store/layout.ts`** gains `ATTRIBUTES = '.gitattributes'` beside `HISTORY_FILE`, so the two
paths that have to agree are declared next to each other. The pattern written is
`.mollyguard/history.jsonl merge=union`, relative to the corpus root, with the comment that says
why union is safe here and nowhere else.

**`store/scaffold.ts`** (the corpus skeleton, not the agent one) writes it with the same
three-outcome shape everything else in `molly init` uses — created, already there, differs — so
the reporting falls out rather than being written twice.

**`cli/init.ts`** reports it in the summary line that already lists what was written, and adds the
line to the *already here, left as they are* block when the file exists. When it exists and does
not carry the pattern, it prints the one line to paste. That is the same posture `molly agents
--check` takes: report, name the remedy, repair nothing.

## What is deliberately not done

**No delimited block, no rewriting.** An earlier sketch of this had markers and a rewrite-between
them. That is machinery for editing somebody's file, and the decision this change leans on is
precisely that the tool does not edit somebody's file. A corpus-root `.gitattributes` is ours when
we create it and theirs the moment it exists, and the second case is a report.

**Nothing at the repository root.** See `change.md`.

**No retrofit for existing corpora.** A corpus made before this has no line and `molly init` will
not run again in it. That is left for the migration path to pick up, and until there is one, the
line is two seconds of paste for anybody who reads the release note.

# What this constrains afterwards

**Every file `molly init` creates lives under the corpus root**, and this change is the one that
could most easily have broken it. The rule now has a worked example on the record: when something
genuinely has to sit outside, it goes on the named list in
`decisions/the-tool-writes-only-what-it-owns` or it does not get written.

**Union merge stays scoped to the ledger.** The pattern names one file. A future append-only file
gets its own line and its own argument; a wildcard over the corpus would silently apply
keep-both-sides to specifications, which is the wrong answer for every document a person edits.
