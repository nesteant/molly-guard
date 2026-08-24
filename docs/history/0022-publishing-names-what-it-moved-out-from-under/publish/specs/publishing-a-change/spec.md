---
title: Publishing a change
lang: en
capability: the-change-flow
---

# One command, and no prose written by it

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
`docs/specs/feeding/spec.md`, because the path is the id — so there is no target flag, no naming
rule and nothing to get wrong. One document or forty, the mechanism is the same, which is what
makes a sweeping edit — a component renamed across the whole base — an ordinary publication
rather than a special mode.

# Three parties, and what each one cannot do

| | does | cannot |
| --- | --- | --- |
| whoever drafts — a person, or an agent | compares the change against the base and writes the new documents | be trusted: it produces a proposal, not a fact |
| `molly publish` | verifies something real was written, files, archives, records | judge whether the text is right |
| whoever reviews the diff | accepts or rejects | be replaced by either of the above |

The tool sits in the middle and **never approves anything**. It writes files into the working
tree and stops. Whether that lands is decided by a pull request, or by a pipeline with the right
to merge, or by a person on a branch — which is why the command behaves identically at a
terminal, in CI, and inside a server.

# What it verifies, which is everything except whether the text is good

None of these require reading a body:

- **`publish/` exists and holds at least one document.** Publishing nothing is a refusal, not a
  no-op.
- **Every document lands in an area the knowledge base is made of** — `specs/` and `decisions/`.
  A capability or a roadmap entry is written directly and is not a change's to write; `changes/`
  and `history/` are not knowledge.
- **Every name is a usable slug**, the same rule creation enforces everywhere else.
- **A new document carries the name this corpus mints.** Where `naming:` gives the area a pattern,
  a new document whose folder name that pattern would not have produced is refused and told the
  name to use. It is never renamed: filing a document somewhere other than where it was addressed
  is the one thing a publication may not do, and a corpus that renamed quietly would mint a
  *second* document the moment somebody wrote `retries` meaning to replace `0003-retries`. Only
  new documents are asked — and a bundled document is new when its folder is, so a change adding
  an `architecture.md` to a specification a year old is not naming anything. That is also what
  lets a corpus adopt a pattern without renumbering what it already has.
- **A new specification brings its `spec.md`.** The area is bundled and that file carries the
  record; a folder without it is a specification nothing can read. Checked across the
  publication rather than per document, because the entry may be its sibling in the same one.
- **A new document in a grouped area is filed under a capability**, its own or the change's, and
  that capability exists. A specification is read as part of a capability; one naming none is
  truth that is present and unreachable, which is worse than its being absent, because absence
  is visible. Publication is the last moment the answer is still recoverable — afterwards the
  bundle is in the archive, and nothing scans the archive for dangling references.
- **Something actually changed.** Each replacement is compared byte for byte with the document
  already at its path, and a publication where *every* document is identical is refused. This is
  the check that catches a drafter — human or agent — that reported work it did not do.
- **Everything in the folder could be read.** Refused rather than reported, unlike every other
  scan in the tool: a listing that skips what it cannot read is merely incomplete, but a
  publication that skips it writes part of a change into the base and calls the change finished.
- **The document and the ledger agree about the state.** The same refusal `move` makes, for a
  stronger reason: publishing out of a disputed state would write the knowledge base from a
  disagreement nobody has resolved.

`alters:` is deliberately not consulted. It names documents that exist, so it can say where an
edit lands but never where a new document belongs.

# What it then does, in this order

1. writes each document to its mirrored path, creating or replacing whole
2. appends the transition to the ledger
3. projects the new state into `change.md`
4. moves the bundle to `history/<slug>/`, **whole** — including `publish/`, so the archive
   answers "what did this change actually write" without consulting git

Recorded before projected, and projected before archived, for the same reason a move records
before it writes: if a later step fails, the earlier facts are still true and saying so beats
pretending they are not.

# What the move broke is named, and nothing is repaired

Step 4 moves a directory, and every relative link that resolved into it stops resolving — in
documents belonging to changes nobody touched. **Publishing is a corpus-wide event, and this is
the only actor holding both halves at the moment they diverge:** it performs the move, so it
knows exactly which path went where, and the corpus is markdown it can read. Afterwards the two
facts are in different places and nobody has both.

```
* changes/0003-run-in-a-deployed-environment published — deployed → published, ana

  ! 1 reference(s) now resolve to nothing — nothing was rewritten
    docs/changes/0004-sign-in-with-entra-id/change.md:28
      ../0003-run-in-a-deployed-environment/change.md → docs/history/0003-run-in-a-deployed-environment/
```

**Two conditions, and both are required.** A link is named when it resolves to nothing *and* the
path it names is inside what just moved. The first alone would report every link anybody has
broken since the corpus was made, on the day somebody inherits an untidy one; the second alone
would report links that still resolve because a file of that name exists elsewhere.

**It repairs nothing, and that is structural rather than cautious.** Rewriting a link inside a
change in flight edits a document under review; where the reference is an `alters:` line, it
moves that change's content hash and un-approves every change pointing at a document somebody
merely tidied. `capabilities/the-corpus` puts repair outside this tool for exactly that reason —
a tidying operation that silently revokes a review is the failure this product exists to prevent.

**It is not a refusal, and the exit code stays `0`.** The write has already happened by the time
these can be checked, and refusing would make *edit a document belonging to an unrelated change*
a precondition for publishing — worse than the break it is reporting. What this converts is a red
build days later, in somebody else's change, into a line printed by the command that caused it.

**`history/` is not walked.** An archived bundle is sealed and never re-checked, so a link inside
one that points at a sibling is wrong from the moment it is archived and is deliberately not this
tool's finding. Nor is anything else reported: this names what *this publication* invalidated, and
a corpus full of links broken before the command ran is not its business.

The author is not at fault and the report says so by naming where the target went rather than
what they should have written. The link was correct when it was written; publishing moved the
file underneath it, and there was no path they could have chosen that would have survived.

`--dry-run` performs every check and every refusal, prints what would be written, and touches
nothing. It is not a second code path — the same function decides, and only the writing is
skipped, because a dry run that could disagree with the real one would be worse than none.

# The terminal state is reached here and nowhere else

`molly move <change> published` is **refused**, and points at this command. That is not a rule
about the order — the sequence stays an order, and a move may still skip or go back as far as it
likes. It is narrower and harder to argue with: reaching the terminal state *is* the write, so a
line saying a change was published, appended by a command that published nothing, is the ledger
stating something that did not happen.

The state is not offered by the picker either, because a list holding something that will be
refused teaches the wrong thing. It is still offered as somewhere to move *from*: a change
sitting there through an old ledger or a hand-edited record can be walked back.

# The terminal state is named after the command that reaches it

The last state of the sequence is `published`, not `merged`. One event should not have two
names, and the word the corpus uses is the word the command uses — `merge` belongs to git, and
this tool performs no git operation.

A ledger written before the rename still holds the old word, and those lines are **read as the
state they recorded** rather than refused. Written strictly, read leniently: refusing them would
mean an upgrade silently emptied part of an audit trail, which is the one thing a ledger may
never do. Nothing is rewritten — a correction to the record is another line, and this is not a
correction.

# Why it is arranged this way

**Because a knowledge base that is assembled by a machine is one nobody wrote.** The failure
this whole tool exists to avoid is a merge that combines text automatically: nobody is the
author of the result, nothing reviews the combination, and the base rots into an appended log
that reads like nothing anybody meant. Publishing whole documents that somebody drafted keeps
every page attributable to a mind that wrote it.

**Because combination is the one operation that cannot be language-independent.** Everything
else the tool does works on paths, frontmatter and a ledger, none of which care what language
the prose is in. A tool that unified text would understand it — and would understand English
better than anything else, making a corpus quietly worth less in the language it was written in.
Copying whole documents keeps that property intact.

**Because the diff is the review surface.** Replacing a document in place lets the reviewer see
what changed, for free, in the tool they already use. Publishing a second versioned file beside
the first takes that away, and a sweeping rename becomes forty pairs of documents to compare by
eye instead of forty one-line hunks.

**Because `specs/` must never hold anything unapproved.** The proposal lives inside the change
until it is published, so the knowledge base contains only what is in force, and rejecting a
proposal is a branch thrown away rather than a delete inside the base.

**Because "did anything actually happen" is checkable and "is it right" is not.** Those two
questions have different answers and different owners, and a tool that blurred them would either
refuse good work or wave through empty work. The byte comparison is the exact form of the first
question.

# What is deliberately left undone

**Nothing refuses a publication on its merits.** A change may be published from any state,
including `draft`; what a publication *requires* is policy, like every other transition, and
policy belongs to a slice or to whatever orchestrates the work. The tool records what it is
told.

**Nothing rewrites a reference, now or later.** The report is the whole remedy, and a flag that
repaired would be the same write wearing a different hat. What makes a broken link cheap to avoid
is a convention rather than a command: a change that needs to reference another one links to the
roadmap entry or to the published specification, both of which stay put — and a project's
conventions have somewhere to live.

**An interrupted run cannot be resumed.** If the documents are written and the process dies
before the bundle is archived, re-running is refused for having nothing to write. The remedy is
to restore the working tree and run again — acceptable because every effect is a file, so
nothing outside the corpus has to be undone.
