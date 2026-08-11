---
title: Publishing a change into the knowledge base
lang: en
kind: feature
capability: the-change-flow
state: published
alters: []
---

# What this change makes true

A change carries the documents it intends to put into the knowledge base, and one command puts
them there. **The tool writes no prose and composes no text.** It verifies that documents were
really written, files them at the paths they name, archives the bundle, and records what
happened.

```
docs/changes/rename-cat-to-dog/
  change.md  plan.md  tasks.md  tests.md
  publish/                                    ← a partial mirror of the corpus
    specs/feeding/spec.md                     → docs/specs/feeding/spec.md
    specs/feeding/architecture.md             → docs/specs/feeding/architecture.md
    specs/grooming/spec.md                    → docs/specs/grooming/spec.md

molly publish <change> [--dry-run]
```

**The mirrored path is the instruction.** `publish/specs/feeding/spec.md` becomes
`docs/specs/feeding/spec.md`, because the path is the id — so there is no target flag, no
naming rule and nothing to get wrong. One document or forty, the mechanism is the same, which
is what makes a sweeping edit (a component renamed across the whole base) an ordinary
publication rather than a special mode.

## Three parties, and what each one cannot do

| | does | cannot |
| --- | --- | --- |
| whoever drafts — a person, or an agent | compares the change against the base and writes the new documents | be trusted: it produces a proposal, not a fact |
| `molly publish` | verifies something real was written, files, archives, records | judge whether the text is right |
| whoever reviews the diff | accepts or rejects | be replaced by either of the above |

The tool sits in the middle and **never approves anything**. It writes files into the working
tree and stops. Whether that lands is decided by a pull request, or by a pipeline with the
right to merge, or by a person on a branch — which is why the command behaves identically at a
terminal, in CI, and inside a server.

## What it verifies, which is everything except whether the text is good

None of these require reading a body:

- **`publish/` exists and holds at least one document.** Publishing nothing is a refusal, not a
  no-op.
- **Every document lands in an area the knowledge base is made of** — `specs/` and
  `decisions/`. A capability or a roadmap entry is written directly and is not a change's to
  write; `changes/` and `history/` are not knowledge.
- **Every name is a usable slug**, the same rule creation enforces everywhere else.
- **A new specification brings its `spec.md`.** The area is bundled and that file carries the
  record; a folder without it is a specification nothing can read.
- **Every `capability:` resolves.**
- **Something actually changed.** Each replacement is compared byte for byte with the document
  already at its path, and a publication where *every* document is identical is refused. This
  is the check that catches a drafter — human or agent — that reported work it did not do.
- **Everything in the folder could be read.** Refused rather than reported, unlike every other
  scan in the tool: a listing that skips what it cannot read is merely incomplete, but a
  publication that skips it writes part of a change into the base and calls the change
  finished.

## What it then does, in this order

1. writes each document to its mirrored path, creating or replacing whole
2. appends the transition to the ledger
3. projects the new state into `change.md`
4. moves the bundle to `history/<slug>/`, **whole** — including `publish/`, so the archive
   answers "what did this change actually write" without consulting git

Recorded before projected, and projected before archived, for the same reason a move records
before it writes: if a later step fails, the earlier facts are still true and saying so beats
pretending they are not.

`--dry-run` performs every check and every refusal, prints what would be written, and touches
nothing.

## The terminal state is reached here and nowhere else

`molly move <change> published` is **refused**, and points at this command. That is not a rule
about the order — the sequence stays an order, and a move may still skip or go back as far as it
likes. It is narrower and harder to argue with: reaching the terminal state *is* the write, so a
line saying a change was published, appended by a command that published nothing, is the ledger
stating something that did not happen. A command declining to assert what it did not do has no
opinion about what ought to happen next.

The state is not offered by the picker either, because a list holding something that will be
refused teaches the wrong thing. It is still offered as somewhere to move *from*: a change
sitting there through an old ledger or a hand-edited record can be walked back.

## The terminal state is named after the command that reaches it

The last state of the sequence is `published`, not `merged`. One event should not have two
names, and the word the corpus uses is the word the command uses — `merge` belongs to git, and
this tool performs no git operation.

A ledger written before the rename still holds the old word, and those lines are **read as the
state they recorded** rather than refused. Written strictly, read leniently: refusing them would
mean an upgrade silently emptied part of an audit trail, which is the one thing a ledger may
never do. Nothing is rewritten — a correction to the record is another line, and this is not a
correction.

# Why

**Because a knowledge base that is assembled by a machine is one nobody wrote.** The failure
this whole tool exists to avoid is a merge that combines text automatically: nobody is the
author of the result, nothing reviews the combination, and the base rots into an appended log
that reads like nothing anybody meant. Publishing whole documents that somebody drafted keeps
every page attributable to a mind that wrote it.

**Because combination is the one operation that cannot be language-independent.** Everything
else the tool does works on paths, frontmatter and a ledger, none of which care what language
the prose is in. A tool that unified text would understand it — and would understand English
better than anything else, making a corpus quietly worth less in the language it was written
in. Copying whole documents keeps that property intact.

**Because the diff is the review surface.** Replacing a document in place lets the reviewer see
what changed, for free, in the tool they already use. Publishing a second versioned file beside
the first takes that away, and a sweeping rename becomes forty pairs of documents to compare by
eye instead of forty one-line hunks.

**Because `specs/` must never hold anything unapproved.** The proposal lives inside the change
until it is published, so the knowledge base contains only what is in force, and rejecting a
proposal is a branch thrown away rather than a delete inside the base.

**Because "did anything actually happen" is checkable and "is it right" is not.** Those two
questions have different answers and different owners, and a tool that blurred them would
either refuse good work or wave through empty work. The byte comparison is the exact form of
the first question.

## What is deliberately left undone

**Nothing refuses a publication on its merits.** A change may be published from any state,
including `draft`; what a publication *requires* is policy, like every other transition, and
policy belongs to a slice or to whatever orchestrates the work. The tool records what it is
told.

**An interrupted run cannot be resumed.** If the documents are written and the process dies
before the bundle is archived, re-running is refused for having nothing to write. The remedy is
to restore the working tree and run again — acceptable because every effect is a file, so
nothing outside the corpus has to be undone.
