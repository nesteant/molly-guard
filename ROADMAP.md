# Roadmap — not yet a corpus

Intent that has not become a change yet. It lives here rather than in `docs/roadmap/` because
that area has no command behind it: a document written there by hand would be a record nothing
manages, which is the half-governed state the tool exists to prevent.

**Each entry moves into `docs/roadmap/` as a real record once `molly new roadmap` exists, and
is deleted from here when it does.** Nothing below is committed to; it is thinking that has
been written down so it stops being re-derived.

---

## What publishing still owes

`alters:` now names only documents that exist, and a change that introduces new truth alters
nothing. That was the right correction — a field naming a document which does not exist is a
claim nothing can check, not now and not at publication either, which is free to produce a
different name. But it hands publishing three questions the field used to pretend it had
answered.

### Where a change lands, and the refusal when nowhere

**Built**, and narrower than this table, which turned out to be asking the wrong question.

| `alters:` | `capability:` | publishing can proceed |
| --- | --- | --- |
| names existing documents | — | yes: filing is derived from what it alters |
| empty | names a capability | yes: new truth, filed there |
| empty | — | **no**: nothing to write into and nowhere to put it |

The refusal is at publication, as this said it should be. Either half can be decided after the
bundle exists, so refusing at creation would be refusing an author for not yet knowing something
they are about to work out; `molly change new` reports it and moves on.

What changed is what it reads. `alters:` is not consulted at all, because it names documents
that *exist* — it can say where an edit lands, but never where a new document belongs, so it
cannot answer the question the third row asks. The check is per document instead: **a new
document in an area read by capability must name one**, its own or the change's. That satisfies
all three rows — a change that only alters publishes no new documents and is never asked — and
it also catches the case this table could not express, where a change alters something *and*
slips in an unrelated new specification filed nowhere.

`decisions/` is exempt, and the area table says so rather than the command. A decision is found
by whatever it constrains, not by reading a slice, so requiring a grouping on one would be
inventing a rule the corpus has not got.

### Naming a specification happens at the moment of writing, and needs no flag

**Settled.** A change carries the documents it intends to put into the knowledge base, in a
folder that mirrors the corpus, and the mirrored path *is* the name:

```
changes/<slug>/publish/specs/feeding/spec.md  →  docs/specs/feeding/spec.md
```

So there is no `--into`, no target field and no minting rule. The author names the document by
deciding where to write it, which is the same act as writing it, and the path-is-the-id rule
does the rest. It scales from one document to forty without a special mode.

It must never default to minting a name from the change: a change is a verb phrase and a
specification is a noun, so `changing-state-of-specification` would file accumulated truth under
a name that reads like a task.

The three changes in this corpus are the acceptance test: all three alter nothing, so publishing
them must produce three specifications whose names somebody chose while writing them.

### The capability conflict, which mostly dissolves

A change altering an existing specification does not need to declare a capability: the
specification already declares its own, and that one wins because it exists. What remains is a
change that alters an existing specification **and** declares a different capability — which is
a re-filing, a legitimate thing to want, and a separate question from merging. Refusing it
until somebody asks for it is the cheap answer.

---

## Nothing reads the knowledge base, now that there is one

`molly publish` fills `specs/` and `decisions/`, and no command looks at either afterwards.
Three consequences, in the order they will be noticed:

**`molly status` never says what is true.** It reports work in flight, the capabilities that
exist and what is filed where — and stops at the edge of the thing the whole tool exists to
protect. Somebody who has published ten changes cannot ask what the base holds without opening
the directory.

**A reference from accumulated truth is never resolved.** A change in flight naming a capability
that does not exist is reported; a *published specification* naming one is not, because nothing
scans `specs/`. The check exists and is pointed at only half the corpus.

**`alters:` still resolves against nothing**, and now it could: the documents it names may
finally be there.

All three are the same missing piece — a scan of the knowledge base — and it is worth building
once rather than three times.

---

## The knowledge base has to be readable as a product, and this tool does not render it

The thing being replaced is Confluence: documentation that stays in sync because the process
that changes the product is the process that changes the documents. That sets a mapping worth
writing down, because it decides how big things are — **a capability reads as a parent or an
epic, and a specification reads as a feature-sized document**, the size of a page somebody
would have written by hand.

Which means the corpus has to be *navigable*, and that raises three things it does not have.

**A table of contents is generated, never written.** A hand-written one is a projection nothing
checks, and it drifts within a month — the same argument that cut the README down to an entry
point. Navigation is derived from what documents declare, and rendered on demand.

**Reading order lives in frontmatter, not in nested directories.** `specs/<name>/` stays flat
and one level deep, because the path is the id: deep nesting makes ids long, renames
destructive and cross-references fragile. Filing structure is an *address*; reading structure
is a *view*. Keeping them separate is what allows the book to be reorganised without breaking
every reference in it.

**The renderer is a separate package, or a separate repository.** A corpus that reads well in
exactly one viewer is locked to it. The corpus is plain markdown with a small frontmatter
record, which is already close to what several documentation sites expect — Astro Starlight
(first-class i18n, which matters here rather than being a nicety), VitePress (lighter, weaker
i18n), Material for MkDocs (best navigation and search, but Python, so outside this toolchain).

And the adoption path is worth keeping in view: **the corpus becomes the source of truth before
the viewer changes.** Tools like `mark` push rendered markdown into existing Confluence spaces,
so authoring and governance can move first while readers stay where they are. Replacing the
governance is a much easier thing to ask for than replacing the reader's habits on day one.

---

## What the generated skills still owe

The skills are generated now, and the question this section used to hold — record or output —
answered itself: an **output**, derived, regenerated by `molly agents`, wrong only in the way
its source is wrong. Three things are left.

### The long tail of tools, one verified row at a time

The table is sixteen rows over four directories, and the tools named here are what a reading on
2026-08-11 left over. A row is a claim about where somebody else's software looks, and the only
acceptable source is that vendor's own documentation — not a scruple, but the finding: the
most-cited comparison table had Cline on the shared root and Windsurf off it, both the wrong way
round, and believing it would have written two files where nothing reads them, which looks
exactly like working.

**Refused with a reason, so the next reader starts from the finding.**

| tool | what its documentation says | why there is no row |
| --- | --- | --- |
| Kilo Code | reads `.agents/skills/` and `.claude/skills/` | an open report that it loads neither, so the claim is contradicted at the source |
| Qwen Code | reads `.qwen/skills/` only | a fifth directory for one tool; the request for the shared root is open |

**Not read yet.** Continue, Augment, Warp and Trae. Each is a row, a vendor page and an
assertion, and each arrives when somebody wants that tool.

The two refusals are worth re-reading rather than re-deciding: Kilo's is a bug report that may
close, and Qwen's is a feature request that may land, and either would turn a paragraph here
into a row.

### Nothing removes what a previous version wrote

`molly agents` installs and compares. It does not notice a `molly-*` directory that this version
no longer produces, so renaming or dropping a skill leaves an orphan that `--check` cheerfully
calls current — the exact failure the check exists to prevent, one level up.

The fix is contained: the tool owns `molly-*` directories under the skill roots it writes, so a
directory matching that shape and not in the current set is an orphan, and can be reported by
`--check` and removed by an install. The reason it is not done yet is that removal is the first
thing here that deletes rather than writes, and the blast radius wants stating before the code:
only directly under a root this run wrote, only `molly-` prefixed, only containing a `SKILL.md`.

### Translating them

The skills are English while instructing the agent to write the corpus in `lang:`. That is the
half that matters and it works — an English instruction produces Ukrainian documents. Translating
the instructions themselves means either shipping a translation per language, which goes stale
silently, or generating one, which puts model output into a file the tool claims to own. Neither
is obviously right, and nothing is broken while it is undecided.

---

## A capability is deprecated, not moved

Capability boundaries are the least stable thing in a corpus, so eventually one stops being
where new work should go. The requirement: **no new work may be filed under a deprecated
capability, and everything already filed under it keeps resolving.** The second half is what
makes deprecating safe enough to do — a deprecation that broke every existing reference is one
nobody would ever perform.

**A status, not a lifecycle.** This is the line that must not blur. A lifecycle is folded from
the ledger, moved with `molly move`, and projected into `state:`. A status is a fact declared in
the document and nothing else — the same shape the corpus already uses everywhere: a
specification is current or superseded, a decision is in force or superseded, a roadmap entry is
open or realised. So a capability may carry a status field and must never carry `state:`, and
`molly move` must never touch one.

**`superseded_by:` rather than `deprecated: true`.** A bare deprecation is a dead end: the
author is told no and not told what instead. Naming the successor gives the refusal something to
say, and it is the same shape supersession will take on a specification.

Where it bites, once it exists: `molly change new --capability <deprecated>` refuses;
`molly publish` refuses to file new truth there; `molly status` reports what is still filed under
one without failing, because existing work is not wrong for having been filed before the
boundary moved.

**Not urgent.** With three changes and no specifications there is nothing to redirect. What is
worth settling now is the field's *shape*, so the refusal can be added without reopening the
question.

---

## One capability per document, and `tags:` for everything that crosses

Kept singular deliberately, and the reasons differ by document:

**On a specification**, a capability is a *reading* boundary. A specification filed in two
places is found twice and read twice, and "read the billing slice" stops being a bounded read.
The moment one wants two capabilities, either the edge is drawn wrong or it is two
specifications — and both are worth being told about rather than absorbed by a list.

**On a change**, the field only ever describes what the change *creates*: for anything it
alters, the existing document already declares its own. A change creating two specifications in
two capabilities is a change making two claims, which `change.md`'s own template already calls
two changes.

It could not be expressed anyway without giving up something load-bearing: pairing each altered
document with a capability needs nesting, and frontmatter deliberately admits scalars and arrays
of scalars so that documents cannot carry structure the prose below them contradicts.

**`tags:`** is the field for genuinely cross-cutting concerns — compliance, performance,
anything a reader wants to gather across capabilities. A tag is not a grouping and does not
scope a read, which is exactly why it may be plural.

---

## Reading *by* capability, which is the whole point of having one

A capability is currently visible in `molly status` and cannot be used: nothing scopes a read to
one. That is the payoff the grouping exists for, and it needs `specs/` to be non-empty — so it
follows publishing having filled `specs/` rather than competing with it.

```bash
molly context <capability>
```

The narrow read: the decisions in force, the open roadmap entries, and the specifications in
that capability, budgeted. Never the corpus whole, and never handed to a model whole — a read
that does not fit in one sitting is one nobody performs, and a context that includes everything
is one that includes nothing usefully.

---

## Two checks deliberately not written yet

**A capability nothing is filed under is not reported.** On the day it is made that is every
capability, so reporting it would be reporting the normal case. It becomes a reasonable finding
once a corpus is old enough that an empty grouping means a boundary nobody uses — which is a
judgement about size, and the tool does not know the size yet.

**`alters:` is not resolved.** It names documents in `specs/` and `decisions/`, both of which
are empty until something is published into them. The check arrives with what it can check against;
written now it would be a check that passes because there is nothing to fail it, which is
indistinguishable from one that does not work.

---

## The product describes itself in its own corpus, and the README points at it

A tool for governing specifications cannot keep its own specification in an ungoverned file.
A README describing what the product does is a second answer to every question it covers: no
change produced it, no check reads it, and nothing makes it wrong out loud when the code moves
underneath it. That is precisely the half-governed state this tool exists to prevent, and it
was written into this repository once already before being cut back.

**The README's job is to be an entry point, not a description.** What this is in three lines,
how to run it, and where the specification actually lives. Everything else belongs in `docs/`
and is read through the tool.

### Why the pull is real, and what closes it

`docs/specs/` is empty, because accumulated truth arrives only when a change is published into
it and nothing in this corpus has been. So the changes in flight are currently the entire
description of the product, and anyone wanting an overview has nowhere to look. **The README
grows to fill that hole every time somebody needs one** — which is why publishing this corpus's
own changes matters more than it looks.

### Then: an overview that is derived rather than written

Once `specs/` holds something, the overview a newcomer wants is a *projection* of it — the
specifications in force, grouped by capability, with their statements. That is a rendering, not
a document: generated on demand, never committed as a second copy, and wrong only in the way
its source is wrong.

The rule the rest of this codebase already follows applies here too. A projection is allowed
where something can check it against its source; a hand-written overview is a projection nothing
checks, which is why it drifts and why it was cut.

---

## Nothing enforces the order, and two things depend on that changing

The sequence in core is an order, not a set of permitted edges: `molly move` records any state
after any other. What a move *requires* is policy, and policy belongs to a slice or to whatever
orchestrates the work. Neither exists yet, so **between now and then the tool records whatever
it is told.** That is deliberate, and these two are what it costs.

### A move cannot be refused on its merits

`ChoiceFilter` narrows what the *picker* offers, and that is all it does — it cannot stop
`molly move x published` typed directly. Refusing needs the hook seam: an event fired at the
transition point whose subscribers answer **pass**, **refuse** with findings, or **defer** to
something that will answer later.

The three answers already have homes. A refusal is a finding. A deferral is the `blocked`
event, which stops advancement without stopping recovery. And an external answer arrives by
posting a verdict back, pinned to the content hash it judged, so a late reply cannot approve
text nobody looked at.

The first slice worth writing against that seam is the one that restores what was just removed:
**strict sequencing**, refusing any move that is not to the adjacent state. Teams that want the
old behaviour install it, and it doubles as the worked example of the extension model.

### Undoing a publication, which is the half still open

**Entering the terminal state is closed.** `molly move x published` is refused and points at
`molly publish`, and the picker does not offer it — recording a publication that never happened
would leave the ledger claiming a fold with an empty `specs/`.

Leaving it is the harder half and is not closed. It does not arise by accident today, because a
published change is archived into `history/` and no command in flight can find it — so the way
to undo a publication is currently `git checkout`, which works precisely because every effect
is a file.

What is missing is the deliberate case: a published specification that turns out to be wrong,
where the correction is meant to be a new change rather than a retreat. Nothing enforces that,
and nothing offers the alternative either. The two candidate answers are a refusal, or a
recorded reversal that unwinds the write and says so in the ledger. The second is more honest
and more work, and neither should be built before somebody actually wants to undo one.

---

## Does the ledger earn its keep, when the corpus already lives in git?

Open, and worth settling before anything else builds on it. The doubt is legitimate: git already
records who changed what and when, immutably and attestably, and `state: draft → state: review`
is right there in a diff. A second record of the same facts is the thing this codebase argues
against everywhere else.

### Where git is better, and the ledger is a weaker copy

The ledger **writes** six fields and **reads two**. `stateOf` folds on `node` and `to`; that is
the whole of it. The two fields git records better are exactly the two nothing reads:

- **`by` is self-asserted.** It comes from `git config user.name`, which anybody can set to
  anything. A commit author can at least be signed. The ledger's attribution is a weaker copy
  of a fact sitting one directory up.
- **`at` is a client clock**, and the fold deliberately ignores it — the file's order is the
  order things happened, so a wrong clock cannot reorder history. It is decoration.
- **Tamper-evidence is borrowed.** The ledger says *never edit this by hand* and nothing
  verifies that it wasn't. Its integrity comes entirely from being committed. It is not an
  alternative to git history; it lives inside it.

And the sharpest form, by this codebase's own rule — *a projection is only allowed where
something compares it against its source*. If git is the record of what happened, the ledger is
an unchecked projection of git: precisely what `state:` is not permitted to be.

**The falsification test**, stated plainly rather than argued around. Delete `history.jsonl`
today and make `state:` authoritative. What breaks: the direction of a move, the
created-versus-transition distinction, and the "the ledger has never heard of this bundle"
signal. That is a thin list, and pretending otherwise would be the kind of half-answer this
tool exists to catch.

### Where git cannot do the job

- **Squash merge eats the lifecycle silently.** Four commits walking `draft → in_progress`
  become one commit, authored by whoever pressed the button, timestamped when they pressed it.
  It is the default on many teams and the loss is invisible. An appended line survives, because
  it is content rather than history.
- **Rebase and cherry-pick rewrite what would be read.** Deriving a state machine from
  `git log -p --follow` across renamed directories is a heuristic; folding lines is arithmetic.
- **Concurrent branches.** Two branches each advancing a change append two lines, and
  `merge=union` resolves it with no conflict. Derived from git, the same situation is two
  histories that both edited one `state:` line — a conflict on every parallel advance.
- **Events that are not edits**, which is the one that matters for what is coming. `blocked`, a
  verdict pinned to a content hash, `renamed_to`, an approval: none of these change a document,
  and several *must not*, because a hash taken over a change excludes `state:` exactly so that
  advancing does not revoke its own approval. Git cannot record "this happened and no bytes
  changed".
- **A corpus with no `.git`** — a tarball, a service handed a directory, a fixture.

### The re-justification, and the two ways forward

**Stop calling it the audit trail.** That is the claim git falsifies. It is the **event
stream**: the ordered record of what happened to a node, *including what did not change a
file*. Git cannot make that claim, and every feature on this roadmap makes it stronger.

Then one of two, and the second is preferred:

1. **Drop `by` and `at`.** Let git own who and when. Zero duplication, and nothing breaks
   because nothing reads them — at the cost of a line that no longer reads as a fact in a diff,
   and a corpus without git losing both.
2. **Make the ledger a checked projection of git**, held to the standard `state:` is held to. A
   later `molly verify` reports an event with no commit behind it, and a `by` that disagrees
   with the commit author. That turns the duplication from a liability into a second
   independent signal — two records of one fact, compared, which is the pattern already trusted
   here.

   **The link is derived, never declared.** The commit behind an event is the one that appended
   that line to `history.jsonl`, found by path and content — arithmetic, the same as folding.
   It is emphatically not a `MollyGuard:` trailer the author wrote. That check existed, was
   taken back out, and reaching for it here would rebuild it through the ledger door: a rule
   about what a commit *says* is the repository's to write and its linter's to enforce, and a
   reference the author supplies is unverifiable in exactly the way this entry is trying to fix
   — it names an id, not the work. Whatever `verify` becomes, it reads commits and never their
   messages. The smoke suite greps for the three shapes it took.

**This blocks nothing except the entry below**, which assumes the ledger keeps its role.

---

## The ledger is partitioned by the archive, not by size

Assumes the answer above is "keep it". Merge is the ledger's first heavy user, so if its role
shrinks, this partitioning changes shape.

### The numbers

At the scale this is meant for — ten thousand changes in three years, eight transitions each
counting the ones that go back — the single ledger is 80,000 events and **14 MB**. At ten
years, 47 MB and a quarter of a million lines. Parsing all of it costs about 40 ms, which is
irritating on every `status` rather than fatal.

**Git conflicts are what actually break first.** Two branches that each advanced a change have
both appended at the end of the same file, and git cannot know that both additions are wanted.
`.gitattributes` now sets `merge=union` on the ledger, which is the correct resolution for a
file whose lines are independent facts — and it is why nothing else in the corpus gets that
treatment. That fix is done; the rest of this entry is the growth.

### The partition is already in the model

Every command only needs what is **in flight**. Two hundred changes in flight is 288 KB and
1,600 lines, and that number does not grow with the age of the corpus. The other 78,400 events
belong to changes that were published — and a published change's events are finished. They never change
again, for the same reason its bundle is never edited again.

So when a change is published, its events move with it:

```
docs/.mollyguard/history.jsonl      only what is in flight — bounded for ever
docs/history/<slug>/history.jsonl   sealed beside the bundle it belongs to
```

The live ledger stays proportional to work in progress rather than to history. The archive is
already immutable, so its events become immutable in the same place under the same rule. And
a rename or an archival moves the history with the bundle at no extra cost.

**This is `molly publish`'s job.** It already fills `history/`; moving a published change's
events there beside its bundle is the part not built. Listed here so it is added to the command
that already owns the archive rather than retrofitted as a separate sweep.

### Rejected

**Parquet, or SQLite.** The ledger's value is that it is readable in a pull-request diff and
mergeable by git. A binary columnar format is neither, needs a dependency, and optimises
analytical queries this tool does not run. It is the right format for reporting *over* a corpus
and the wrong one for the corpus.

**Per-change files as the live store.** Tempting — it removes conflicts entirely and moves with
a rename — but deleting a directory would then erase the evidence that the change ever existed.
A central live ledger means removing a change leaves a trail.

**Sharding by time** (`history/2026-08.jsonl`). Bounds file size but not read cost: folding one
change still means reading every shard, so it trades a size problem for an index problem.

### Also

`molly init` should write the `.gitattributes` line itself. It creates the ledger, and a ledger
without union merge is one that conflicts on the first concurrent branch — leaving that to a
README is leaving it undone. The delimited-block approach would apply: rewrite between markers,
leave everything else in the file alone.

---

## Renaming a document, and everything that points at it

### What is already fixed, and what is not

Renaming a change's directory used to silently discard its history: the fold answered `draft`,
and the next refusal stated that wrong state with full confidence. Recording creation fixed the
*silence* — a bundle with no events is now reported, and its `state:` disagrees with the fold,
so one mistake trips two independent signals:

```
$ mv docs/changes/before docs/changes/after && molly status

  1 change(s) the ledger has no record of: after
  ! 1 change(s) disagree with the ledger
    after says review, the ledger says draft
```

**The history is still lost.** Everything recorded under the old name is orphaned, and the only
remedy today is renaming the directory back. That is what the rest of this entry is for.

### Why a rename cannot simply rewrite what points at the old name

The obvious implementation — move the file, then rewrite every reference to it — cannot be
made complete, and the reason is structural rather than a matter of effort.

**`history/` is immutable.** An archived change is kept verbatim; nothing edits it and nothing
re-checks it. So a reference living inside an archived bundle can never be rewritten, and any
rename of a document that an archived change once targeted would leave a dangling reference
by construction.

**Rewriting references edits documents that nobody asked to change.** Once approval pins a
content hash, rewriting an `alters:` line moves that change's hash and revokes its approval —
so renaming a specification would un-approve every change in flight against it. A rename is a
tidying operation; it must not be able to invalidate somebody else's review.

Both point the same way: **references are resolved through the rename chain, not rewritten.**
The ledger already is the place where "what happened to this node" is recorded, and a rename
is something that happened to a node.

### The shape

```bash
molly rename <id> <new-name>
```

Moves the directory or file, and appends one line:

```json
{"node":"changes/before","at":"…","renamed_to":"changes/after","by":"human"}
```

Nothing prior is rewritten. `stateOf` follows the chain forward, so folding
`changes/after` reads events recorded against `changes/before` and every state before the
rename is still counted. Reference resolution follows the same chain, so an `alters:` line
written months ago — including one sealed inside `history/` — still resolves.

Identity stays single-valued at every instant: at any point in time exactly one path names the
document, and the log says how it got there. That is the property an explicit mutable `id:`
field would give up, because two identities that can disagree eventually do.

### What holds a reference to a name

Only the first two exist today. The rest are listed because the resolution rule has to be
designed for all of them at once — a rename that handles the present set and not the eventual
one gets rewritten rather than extended.

| holder | reference | status |
| --- | --- | --- |
| `history.jsonl` | `node` on every event | **built** |
| the filesystem | the directory or file name itself | **built** |
| a change's frontmatter | `alters: [specs/…, decisions/…]` | built, unresolved |
| a change's frontmatter | `capability:` | **built, resolved** |
| a spec's frontmatter | `capability:` | planned |
| a decision | `from: <change>` | planned |
| an archived bundle | everything above, **frozen** | planned |
| the verdict ledger | node plus content hash | planned |
| a roadmap entry | what realised it | planned |

### Refusals it needs

- **The new name is taken.** Refuse before moving anything; a rename that half-applies leaves
  two partial documents and no way to tell which is current.
- **The new name is not a usable slug.** Same rule as creation — lowercase ASCII, so a name
  survives translation.
- **Renaming to its current name** is a no-op that exits 0, for the same reason a same-state
  move is: a re-run must not fail a build.
- **The document does not exist**, and the refusal lists what does.

### The separate half: catching a rename nobody recorded

`mv` will always be available, so the orphan case has to be visible rather than prevented:

- a ledger node with no document and no `renamed_to` is **reported** by `status` and by `move`
- folding a node with no events, where a same-titled orphan exists, says so rather than
  quietly answering `draft`

This is worth building **before** the rename command, and possibly instead of it for now. It
is roughly fifteen lines, it converts a silent wrong answer into a named finding, and it is
what stops the misleading refusal above. The rename command is the convenience; the orphan
check is the correctness.

### Deliberately not doing

**An explicit `id:` in frontmatter.** Considered and rejected: it makes identity a field that
can disagree with the path, moves uniqueness from the filesystem into a check we would own,
and stops a ledger entry from pointing at anything resolvable without scanning every document.

**A tracker number as identity.** A change with no ticket then has no identity, two changes for
one ticket collide, and a tracker migration dangles every reference in the corpus. The ticket
is a *reference*, and belongs in a field that can hold several:

```yaml
tracker: [JIRA-1234, JIRA-1241]
```

That field is cheap and can arrive whenever it is wanted, independently of any of the above.

### Open

- **Does a rename need a reason?** A change that is `approved` or later has been read by
  somebody under its old name. Recording why is nearly free and the alternative is a log that
  says a name changed and cannot say why.
- **Does `show` display the old name?** A document referencing `specs/old-name` resolves
  correctly but reads wrong to a person. Either the reader resolves and prints the current
  name, or references are left to age visibly.
- **Renaming a capability** moves every `capability:` field pointing at it at once — changes
  today, specifications once publishing writes them — and it is the rename most likely to be wanted,
  because capability boundaries are the least stable thing in a corpus. It is also the first
  rename with a *visible* cost today: `molly status` names every change left pointing at a
  capability that has gone, so a rename done with `mv` is loud rather than silent.

### Depends on

The orphan check depends on nothing. The rename command wants `molly status` to print the
name it accepts, so that a rename can be verified by reading rather than by guessing.
