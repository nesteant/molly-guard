---
title: Planning what is not a change yet
lang: en
capability: the-corpus
---

# The stage before a change

A specification-driven project has something it knows it wants and has not specified yet.
`roadmap/` is where that lives: one file per **slice** — a body of planned work, holding what it
is for, the features in it in the order they are wanted, what has already been decided, and what
is done.

```
molly roadmap new "<title>" [--name <name>] [--lang <tag>]

docs/roadmap/<name>.md
```

It is read while planning, so that a new change does not quietly contradict something already
intended. That is the slice's whole job, which is why `molly status` lists this area beside the
capabilities — a slice nothing lists is worse than none at all, because somebody plans against a
corpus that appears to intend nothing.

**A slice is not filed under a capability.** A capability answers *what is the product responsible
for*; a slice answers *what body of work are we planning*. The axes are independent, and a slice is
expected to cross several capabilities — which is the shape a business need arrives in. So the
command takes no `--capability`, the field is not read, and a document carrying one is reported by
the scan. The features in a slice are each filed under a capability, and that is decided when a
feature becomes a change.

**Two slices may describe overlapping work**, and nothing refuses it. Treating a slice as an
isolated flow is a decision about how work is managed, not a constraint the corpus enforces.

**A slice has no state.** It is open, or answered by the changes that landed, and neither is
recorded. Nothing here reaches the transition ledger, for the same reason nothing does when a
capability is written: what has a lifecycle is the change, and a feature that became one is
answered by the change. A document carrying `state:` would invite something to try moving it, and
planning that can be advanced is planning somebody advances instead of writing the change.

# The shape, which is written and taught and never read

**The tool writes the shape and teaches the shape, and parses none of it.** Two halves that must
both be true and must stay separate.

`molly roadmap new` writes a slice with the headings a plan needs — *what this slice is for*, *the
features, in order*, *what has been decided*, *what is done* — so a slice is born readable instead
of each author inventing a layout. They are a starting point and not a schema: a slice that deletes
a heading is still a slice, and nothing reports it. A template that became a checked structure
would break the body rule through the writing door instead of the reading one.

The `molly-roadmap` skill teaches an agent to read one and draft the next change from it. That is
where *what is next* is answered, because the order is an argument — *this comes first because it
unblocks the other three* — and the reader that can act on an argument is a model rather than the
engine.

**There is no `order:` field and no `priority:` field.** Reducing an ordering to a number throws
away the sentence that justified it, and reading the order out of a numbered list would break
[core never parses a document body](../../decisions/core-never-parses-a-body.md) through the door
it is held against.

**The template and the skill are an agreement nothing checks.** That is the cost of leaving the
body unparsed, and it is stated rather than discovered: whoever changes one changes both.

# Writing one, and what the command buys

Both ways are correct. No change alters a slice, so writing the file by hand stays entirely
fine and the command guards nothing that hand-writing would break.

What it buys is the name. An entry is scanned like everything else in the corpus, and a name
nobody could type is reported as unusable for as long as it sits there — `Seven Years.md` is a
document the report can only complain about. `molly roadmap new` mints through the one seam every
other name goes through: the reduction, both refusals, and then the corpus's own pattern, so
`roadmap: '{ordinal:4}-{slug}'` produces `0001-a-thought` exactly as it does for a change. The
result is an entry every other command can already address.

It refuses what its neighbour refuses and nothing more: no corpus, a missing title, a title that
reduces to no usable name or only partly, a name already taken. Each names the remedy.

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

- **A slice with published work against it** — a slice named by one or more changes that have
  *published*. The report names them all and asks whether the plan is still current. It does not
  say to retire it: a slice holds several features and outlives the first change that lands, so
  "retire this" would tell somebody to delete a plan with four features left in it. Whether the
  work is finished is prose, and prose is not read here.
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

**A backlog.** No `needs:`, no `order:`, no `priority:`, no ordering *between* slices, no cycle
detection, nothing computing what may be started. That is a planning tool, and the priority grammar a project wants — *a
`Must` never depends on a `Should`* — is the project's own. The engine owns the vocabulary and the
record and does not own the process, and *which planned thing may be started* is process.

The directory stays open to it. A corpus wanting more can put anything it likes in an entry;
what the tool holds is that the entry has a name every command can take, and that the plan and
the knowledge base cannot silently disagree about whether something has shipped.

**Ordering between slices.** Two slices are two plans that may run in parallel, may overlap, and
are deliberately not ranked against each other. Ranking them is portfolio management, and the tool
has no basis for an answer.

**How a feature gets built.** A slice says what is wanted and in what order. How something gets
built is the change's business, and a design written here is a document the corpus cannot check
and nobody re-reads.
