---
title: The ledger's role is settled, and it stays bounded
lang: en
capability: the-change-flow
---

# What is meant to be true later

**The ledger has a justification nothing else in the repository already provides, written down —
and it stops growing with the age of the corpus.**

## 1. Settle what it is for

The doubt is legitimate. Git already records who changed what and when, and `state: draft → state:
review` is right there in a diff. The ledger **writes** six fields and **reads two** — `stateOf`
folds on `node` and `to`, and that is the whole of it. The two fields git records better are
exactly the two nothing reads: `by` comes from `git config user.name`, which anybody can set to
anything, and `at` is a client clock the fold deliberately ignores. Tamper-evidence is borrowed:
the ledger says *never edit this by hand* and nothing verifies that it wasn't.

**Where git cannot do the job**, which is what keeps it. Squash merge eats four transitions into
one commit authored by whoever pressed the button — the default on many teams, and the loss is
invisible. Rebase and cherry-pick rewrite what would be read. Two branches each advancing a change
append two lines that `merge=union` resolves, where a derived state machine conflicts on every
parallel advance. **Events that are not edits** — `blocked`, a verdict pinned to a content hash,
`renamed_to`, an approval — several of which *must not* change a document, because a hash taken
over a change excludes `state:` exactly so that advancing does not revoke its own approval. And a
corpus with no `.git` at all.

**So it stops being called the audit trail.** That is the claim git falsifies. It is the **event
stream**: the ordered record of what happened to a node, including what did not change a file.

Then one of two, and the second is preferred:

1. **Drop `by` and `at`.** Zero duplication, nothing breaks because nothing reads them — at the
   cost of a line that no longer reads as a fact in a diff, and a corpus without git losing both.
2. **Make the ledger a checked projection of git**, held to the standard `state:` is held to. A
   later `molly verify` reports an event with no commit behind it, and a `by` that disagrees with
   the commit author. Two records of one fact, compared — the pattern already trusted here.

**The link is derived, never declared.** The commit behind an event is the one that appended that
line, found by path and content — arithmetic, the same as folding. It is emphatically not a
`MollyGuard:` trailer the author wrote: that check existed, was taken back out, and reaching for it
here would rebuild it through the ledger door. A rule about what a commit *says* is the
repository's to write and its linter's to enforce. Whatever `verify` becomes, it reads commits and
never their messages.

## 2. Then: publication seals what it archives

```
docs/.mollyguard/history.jsonl      only what is in flight — bounded for ever
docs/history/<slug>/history.jsonl   sealed beside the bundle it belongs to
```

Every command only needs what is in flight, and a published change's events are finished for the
same reason its bundle is never edited again. The live ledger then stays proportional to work in
progress rather than to the age of the corpus, and a rename or an archival moves the history with
the bundle at no cost. **This is `molly publish`'s job** — it already fills `history/` and archives
the bundle; moving the events is the part not built, and adding it to the command that owns the
archive is cheaper than retrofitting a sweep.

# Why it is not a change yet

Step 2 assumes step 1 answers *keep it*. If `by` and `at` go, the partitioning changes shape, and
building it first means designing the archive around fields about to be removed.

The pressure is not yet real: at ten thousand changes over three years the single ledger is 80,000
events and 14 MB, and parsing costs about 40 ms — irritating on every `status` rather than fatal.
Git conflicts were what actually broke first, and `merge=union` already fixed those.

The falsification test for step 1, stated plainly: delete `history.jsonl` today and make `state:`
authoritative. What breaks is the direction of a move, the created-versus-transition distinction,
and the "the ledger has never heard of this bundle" signal. That is a thin list, and pretending
otherwise would be the half-answer this tool exists to catch.

# Rejected, so it is not re-proposed

**Parquet, or SQLite.** The ledger's value is that it is readable in a pull-request diff and
mergeable by git. A binary columnar format is neither, needs a dependency, and optimises analytical
queries this tool does not run.

**Per-change files as the live store.** Removes conflicts entirely and moves with a rename — but
deleting a directory would then erase the evidence that the change ever existed. A central live
ledger means removing a change leaves a trail.

**Sharding by time.** Bounds file size but not read cost: folding one change still means reading
every shard, so it trades a size problem for an index problem.
