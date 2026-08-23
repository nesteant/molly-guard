---
title: Planning what is not a change yet
lang: en
capability: the-corpus
---

# The stage before a change

A specification-driven project has something it knows it wants and has not specified yet.
`roadmap/` is where that lives: one file per entry, saying what is meant to be true later and
why it is not a change yet.

```
molly roadmap new "<title>" [--name <name>] [--capability <name>] [--lang <tag>]

docs/roadmap/<name>.md
```

It is read while planning, so that a new change does not quietly contradict something already
intended. That is the entry's whole job, which is why `molly status` lists this area beside the
capabilities — an entry nothing lists is worse than no entry at all, because somebody plans
against a corpus that appears to intend nothing.

**An entry has no state.** It is open, or it is answered by a change that landed, and neither is
recorded. Nothing here reaches the transition ledger, for the same reason nothing does when a
capability is written: what has a lifecycle is the change, and an entry that became one is
answered by the change. A document carrying `state:` would invite something to try moving it.

# Writing one, and what the command buys

Both ways are correct. No change alters an entry, so writing the file by hand stays entirely
fine and the command guards nothing that hand-writing would break.

What it buys is the name. An entry is scanned like everything else in the corpus, and a name
nobody could type is reported as unusable for as long as it sits there — `Seven Years.md` is a
document the report can only complain about. `molly roadmap new` mints through the one seam every
other name goes through: the reduction, both refusals, and then the corpus's own pattern, so
`roadmap: '{ordinal:4}-{slug}'` produces `0001-a-thought` exactly as it does for a change. The
result is an entry every other command can already address.

It refuses what its neighbour refuses and nothing more: no corpus, a missing title, a title that
reduces to no usable name or only partly, a name already taken. Each names the remedy.

**The capability is checked when it is given, and stays optional at every later point.** An entry
is a note. Refusing one for naming a capability nobody has written yet would refuse the ordinary
order of planning, where the intent is older than the grouping it will end up in. So a
`--capability` that is not there is refused at the terminal, and an entry that names none is not
remarked on — then or ever.

What a scan of this area reports, and why none of it fails, is
[what a command may never do silently](../what-a-command-may-never-do-silently/spec.md).

# The link a change declares

`molly change new "<title>" --realises <entry>` records that this change is the specific form of
something already intended. The entry is checked against what is on disk at creation, because the
moment to catch a typo in a reference is while the author is still at the terminal.

It is checked for existing and for nothing else. Whether the entry is ready, and whether anything
it mentions has to land first, are not asked — see what is not modelled, below.

# The disagreement, said out loud and resolved by nobody

A change publishes. Its entry survives. The plan goes on planning something that already exists,
and nothing says so, because these are two models of the same work and only one of them knows
when something shipped. A project that meets this writes a script to reconcile them, and that
script is code the tool should have made unnecessary.

So `molly status` reports two things, both about a reference between the two models:

- **A realised entry that is still here** — an entry named by a change that has *published*. The
  report says which change realised it and that it should be retired, on every run, until
  somebody does.
- **A reference to an entry that is not there** — an *in-flight* change naming an entry that has
  been retired or renamed under it.

**Nothing is retired by the tool.** The entry is somebody's planning note; the tool writes no
prose and deletes none. It says the two models disagree and leaves the decision where it belongs
— which is the same rule that stops a reference being rewritten to keep it resolving, because
editing documents nobody asked to change is how a tidying operation silently revokes a review.

**Neither finding fails a run.** An entry is a note rather than a governed unit, and failing a
build over a planning document nobody retired would be refusing somebody's notes for existing.
It is the same line every other roadmap finding sits on.

**And the dangling reference is asked only while the change is in flight.** An archived change
pointing at a retired entry is the *finished* shape of this link: the intent was planned, it was
realised, the note was cleared away, and what remains is a published change citing something that
correctly no longer exists. Reporting that would turn every correct publication into a finding,
which is how a report becomes one people learn to scroll past.

# What is deliberately not modelled

**A backlog.** No `needs:`, no ordering between entries, no cycle detection, nothing computing
what may be started. That is a planning tool, and the priority grammar a project wants — *a
`Must` never depends on a `Should`* — is the project's own. The engine owns the vocabulary and the
record and does not own the process, and *which planned thing may be started* is process.

The directory stays open to it. A corpus wanting more can put anything it likes in an entry;
what the tool holds is that the entry has a name every command can take, and that the plan and
the knowledge base cannot silently disagree about whether something has shipped.

**A long plan.** An entry keeps to the shape of a record — a title, a statement of intent, the
capability it belongs to. How something gets built is the change's business, and a plan written
here is a document the corpus cannot check and nobody re-reads.
