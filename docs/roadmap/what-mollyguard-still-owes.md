---
title: What MollyGuard still owes
lang: en
---

# What this slice is for

The whole of what this product intends and has not built. One slice, because the product is one
product: splitting it into seven left every ordering argument inside a different document, and the
only way to decide what to do next was to read all seven.

The through-line is one sentence. **`molly publish` fills the knowledge base and nothing reads it
back.** Most of what follows is that gap, or a consequence of it, and the order below is mostly
the order in which closing it unblocks the rest.

# The features, in order

## 1. The ledger names a change that is gone

A ledger node with no document and no `renamed_to` is reported by `status` and by `move`, and
folding a node with no events — where a same-titled orphan exists — says so rather than quietly
answering `draft`.

**First because it is fifteen lines and there is a live case in this corpus.** The ledger holds
fourteen nodes and thirteen changes exist: `changes/0010-a-commit-names-its-change` was the
`MollyGuard:` trailer work, removed by hand when that idea was dropped, and `molly status` exits
`0` without mentioning it. Half of this is already built — a bundle the ledger has never heard of
is reported — and the silent half is the one that produces a *wrong* answer rather than a missing
one.

## 2. A scan of the knowledge base

Eight specifications and three decisions are filed, and no command looks at any of them. One scan
closes three things at once, which is why it is worth building once rather than three times:
`molly status` can say what is true; a `capability:` on a *published* specification can be resolved
— today that check is aimed at half the corpus, and the half it cannot see is the permanent half;
and `alters:` can resolve, the reason for deferring it having been that the areas were empty.

**Second because 6, 7 and 15 all wait on it**, and because its shape should be settled with those
in view rather than fitted to `status` alone.

## 3. A new corpus can merge its own ledger

`molly init` writes the `merge=union` line for the ledger it creates. Without it a corpus conflicts
on its first concurrent branch. An hour of work, and the cost is invisible here — this repository
already has the line — and paid entirely by everybody else.

## 4. An install removes what a previous version wrote

A `molly-*` skill directory this version no longer produces is invisible to `--check`, which
cheerfully calls it current, so an agent loads instructions no version of the tool would write
today. The bound wants stating before the code, because this is the first thing that deletes
outside the corpus: **only directly under a root this run wrote, only `molly-` prefixed, only
containing a `SKILL.md`.**

## 5. Progress, from what is already recorded

`molly status` joins a slice only to changes that have *published*. A change in flight carrying
`realises:` is read and discarded — so a slice nobody has started and one halfway through render
identically. No new field: it is a filter and a rendering over two facts the corpus already holds.

Left over from `0015`, which fixed the wording of that finding and not the filter.

## 6. Reading one capability at a time

`molly context <capability>` — the decisions in force, the open slices and the specifications in
one capability, budgeted. Never the corpus whole and never handed to a model whole. A capability is
currently visible and unusable; this is the payoff the grouping exists for. **Needs 2.**

Open while writing it: what *budgeted* means, and whether the unit is documents or tokens.

## 7. An overview that is derived rather than written

The specifications in force, grouped by capability, generated on demand and never committed as a
second copy. A table of contents is generated, never written — a hand-written one drifts within a
month. Reading order lives in frontmatter, never in nested directories: `specs/<name>/` stays flat
because the path is the id, and filing structure is an *address* while reading structure is a
*view*. **Needs 2.**

## 8. Renaming a document, and everything that points at it

`molly rename <id> <new-name>` moves the file and appends `renamed_to`. **Nothing prior is
rewritten**, and that is structural: `history/` is immutable so a reference inside an archived
bundle could never be rewritten, and rewriting an `alters:` line moves that change's content hash,
which would un-approve every change in flight against a specification somebody merely tidied.
References resolve *through* the chain instead. **Needs 1**, which is the correctness half — this
is the convenience.

Open: whether a rename needs a reason; whether `show` prints the current name for an aged
reference; and renaming a *capability*, which is the rename most likely to be wanted because
capability boundaries are the least stable thing in a corpus.

## 9. Settle whether the ledger earns its keep

A decision, not a build, and the one that should be settled before anything else builds on the
ledger. It **writes** six fields and **reads two** — `stateOf` folds on `node` and `to`. The two
git records better are exactly the two nothing reads: `by` comes from `git config user.name`, and
`at` is a client clock the fold ignores.

What keeps it: squash merge eats four transitions into one commit silently; rebase rewrites what
would be read; `merge=union` resolves parallel advances that a derived state machine would conflict
on; and **events that are not edits** — `blocked`, a verdict pinned to a content hash,
`renamed_to`, an approval — several of which *must not* touch a document, because a hash over a
change excludes `state:` precisely so advancing does not revoke its own approval.

So it stops being called the audit trail — that is the claim git falsifies — and becomes the
**event stream**. Then either drop `by` and `at`, or make the ledger a checked projection of git
that a later `molly verify` compares. The second is preferred. **The link is derived, never
declared:** whatever `verify` becomes, it reads commits and never their messages.

## 10. Publication seals what it archives

A published change's events move to `history/<slug>/history.jsonl` beside its bundle, so the live
ledger stays proportional to work in progress rather than to the age of the corpus. It is `molly
publish`'s job — it already archives the bundle. **Needs 9**, because dropping `by` and `at`
changes the shape of what gets sealed.

Not urgent on its own: ten thousand changes over three years is 14 MB and about 40 ms to parse.

## 11. A move can be refused on its merits

An event at the transition point whose subscribers answer **pass**, **refuse** with findings, or
**defer**. All three already have homes: a refusal is a finding, a deferral is the `blocked` event,
and an external answer is a verdict pinned to the content hash it judged. The first slice worth
writing against it restores what was deliberately removed — **strict sequencing** — which doubles
as the worked example of the extension model. **Wants 2 first**, so a subscriber can read the base.

## 12. A capability can retire, and a concern can cross one

`superseded_by:` on a capability — **a status, never a lifecycle**, so it may never carry `state:`
and `molly move` must never touch one. A bare deprecation is a dead end; naming the successor gives
the refusal something to say. And `tags:` for what genuinely crosses capabilities, plural precisely
because a tag does not scope a read, with `tracker: [JIRA-1234]` the same shape.

**Not urgent**: two capabilities and eight specifications is nothing to redirect, and a refusal
nobody can trigger is one nobody has tested. The field shapes are settled so this can be added
without reopening them.

## 13. The tools nobody has read yet

Continue, Augment, Warp, Trae. Each is a row, a vendor page and an assertion, and each arrives when
somebody wants that tool — writing rows nobody reads is how the wrong ones got into circulation.
Kilo Code and Qwen Code are refused with reasons worth re-reading rather than re-deciding: Kilo's
is a bug report that may close, Qwen's a feature request that may land.

## 14. The corpus reads outside this tool

A renderer, as a separate package or repository. The thing being replaced is Confluence, which sets
the sizing — a capability reads as an epic, a specification as a feature-sized document. The corpus
is plain markdown with a small frontmatter record, close to what Starlight, VitePress or MkDocs
expect. **The adoption path matters more than the choice**: the corpus becomes the source of truth
before the viewer changes, so governance moves first while readers stay where they are.

Largest and least urgent. **Needs 7**, which is the same projection rendered for a terminal.

## Still undecided, and not features until they are

**Undoing a publication.** Entering the terminal state is closed; leaving it is not. Today the
remedy is `git checkout`, which works because every effect is a file. The candidates are a refusal
naming the correction as a new change, or a recorded reversal. **Neither should be built before
somebody wants to undo one** — a reversal designed against an imagined case is a second write path
through the archive.

**Translating the generated skills.** The half that matters works: an English instruction produces
Ukrainian documents. Translating the instructions means shipping a translation per language, which
goes stale silently, or generating one, which puts model output into a file the tool claims to own.
Reopened by somebody running a corpus in a language they cannot instruct an agent in.

# What has been decided

**No `order:`, no `priority:`, no `needs:`, no ordering between slices.** Settled by `0015`: an
ordering is an argument and reducing it to a number throws away the sentence that justified it.
The reader that acts on the order is a model, taught by the `molly-roadmap` skill, which keeps
`core-never-parses-a-body` exactly as written. Nothing here will grow estimates, assignees, dates
or percent-complete — each is defensible alone and their sum is a backlog manager.

**A reference is resolved, never rewritten.** Nothing renames on somebody else's behalf and nothing
edits a document to keep a reference valid, because a tidying operation must not revoke a review.

**No explicit `id:` in frontmatter**, which would let identity disagree with the path, and **no
tracker number as identity** — a change with no ticket would have no name. A ticket is a reference.

**Rejected for the ledger.** Parquet or SQLite: the ledger's value is being readable in a diff and
mergeable by git. Per-change files as the live store: deleting a directory would erase the evidence
the change existed. Sharding by time: bounds file size but not read cost, trading a size problem
for an index problem.

**A capability nothing is filed under is not reported.** On the day it is made that is every
capability. It becomes a finding once a corpus is old enough that an empty grouping means a
boundary nobody uses — a judgement about size the tool does not have.

# What is done

**`0015-a-roadmap-is-a-slice-of-planned-work`** — the roadmap holds slices rather than one note per
idea, `molly roadmap new` writes the shape, and the `molly-roadmap` skill teaches an agent to read
one and draft from it. Its progress half is feature 5 above, still open.

**`0016-a-command-that-needs-a-choice-offers-it`** — a command needing a value the corpus can
enumerate offers it to a person and refuses with the list to a pipeline, held by
`decisions/a-command-that-needs-a-choice-offers-it`.
