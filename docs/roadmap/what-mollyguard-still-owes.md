---
title: What MollyGuard still owes
lang: en
---

# What this slice is for

The whole of what this product intends and has not built. One slice, because the product is one
product: splitting it into seven left every ordering argument inside a different document, and the
only way to decide what to do next was to read all seven.

The through-line used to be one sentence — *`molly publish` fills the knowledge base and nothing
reads it back* — and 0.2.0 closed it. What is left divides in two: what makes the base **readable**
(1, 3, 4, 11), and what makes the **record** trustworthy under renaming, refusal and age (2, 5, 6,
7). Neither half blocks the other.

# The features, in order

## 1. An install removes what a previous version wrote

A `molly-*` skill directory this version no longer produces is invisible to `--check`, which
cheerfully calls it current, so an agent loads instructions no version of the tool would write
today. The bound wants stating before the code, because this is the first thing that deletes
outside the corpus: **only directly under a root this run wrote, only `molly-` prefixed, only
containing a `SKILL.md`.**

## 2. Progress, from what is already recorded

`molly status` joins a slice only to changes that have *published*. A change in flight carrying
`realises:` is read and discarded — so a slice nobody has started and one halfway through render
identically. No new field: it is a filter and a rendering over two facts the corpus already holds.

Left over from `0015`, which fixed the wording of that finding and not the filter.

## 3. Reading one capability at a time

`molly context <capability>` — the decisions in force, the open slices and the specifications in
one capability, budgeted. Never the corpus whole and never handed to a model whole. A capability is
currently visible and unusable; this is the payoff the grouping exists for. **Needs the knowledge-base scan, which shipped in 0.2.0.**

Open while writing it: what *budgeted* means, and whether the unit is documents or tokens.

## 4. An overview that is derived rather than written

The specifications in force, grouped by capability, generated on demand and never committed as a
second copy. A table of contents is generated, never written — a hand-written one drifts within a
month. Reading order lives in frontmatter, never in nested directories: `specs/<name>/` stays flat
because the path is the id, and filing structure is an *address* while reading structure is a
*view*. **Needs the knowledge-base scan, which shipped in 0.2.0.**

## 5. Renaming a document, and everything that points at it

`molly rename <id> <new-name>` moves the file and appends `renamed_to`. **Nothing prior is
rewritten**, and that is structural: `history/` is immutable so a reference inside an archived
bundle could never be rewritten, and rewriting an `alters:` line moves that change's content hash,
which would un-approve every change in flight against a specification somebody merely tidied.
References resolve *through* the chain instead. **Needed the orphan check, which shipped in 0.2.0** — that was the correctness half — this
is the convenience.

Open: whether a rename needs a reason; whether `show` prints the current name for an aged
reference; and renaming a *capability*, which is the rename most likely to be wanted because
capability boundaries are the least stable thing in a corpus.

## 6. Settle whether the ledger earns its keep

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

## 7. Publication seals what it archives

A published change's events move to `history/<slug>/history.jsonl` beside its bundle, so the live
ledger stays proportional to work in progress rather than to the age of the corpus. It is `molly
publish`'s job — it already archives the bundle. **Needs 6**, because dropping `by` and `at`
changes the shape of what gets sealed.

Not urgent on its own: ten thousand changes over three years is 14 MB and about 40 ms to parse.

## 8. A move can be refused on its merits

An event at the transition point whose subscribers answer **pass**, **refuse** with findings, or
**defer**. All three already have homes: a refusal is a finding, a deferral is the `blocked` event,
and an external answer is a verdict pinned to the content hash it judged. The first slice worth
writing against it restores what was deliberately removed — **strict sequencing** — which doubles
as the worked example of the extension model. The base can be read now, so a subscriber can see it.

## 9. A capability can retire, and a concern can cross one

`superseded_by:` on a capability — **a status, never a lifecycle**, so it may never carry `state:`
and `molly move` must never touch one. A bare deprecation is a dead end; naming the successor gives
the refusal something to say. And `tags:` for what genuinely crosses capabilities, plural precisely
because a tag does not scope a read, with `tracker: [JIRA-1234]` the same shape.

**Not urgent**: two capabilities and eight specifications is nothing to redirect, and a refusal
nobody can trigger is one nobody has tested. The field shapes are settled so this can be added
without reopening them.

## 10. The tools nobody has read yet

Continue, Augment, Warp, Trae. Each is a row, a vendor page and an assertion, and each arrives when
somebody wants that tool — writing rows nobody reads is how the wrong ones got into circulation.
Kilo Code and Qwen Code are refused with reasons worth re-reading rather than re-deciding: Kilo's
is a bug report that may close, Qwen's a feature request that may land.

## 11. The corpus reads outside this tool

A renderer, as a separate package or repository. The thing being replaced is Confluence, which sets
the sizing — a capability reads as an epic, a specification as a feature-sized document. The corpus
is plain markdown with a small frontmatter record, close to what Starlight, VitePress or MkDocs
expect. **The adoption path matters more than the choice**: the corpus becomes the source of truth
before the viewer changes, so governance moves first while readers stay where they are.

Largest and least urgent. **Needs 4**, which is the same projection rendered for a terminal.

### 12. `alters:` can be corrected, and the refusal names the right cause

Two halves, and the smaller one is a defect. `molly status` reports `second alters thing, which is
not in the knowledge base` when the document *is* in the base and is listed four lines above in the
same output — the field wanted `specs/thing` and the message describes a missing document rather
than a missing prefix, which sends the reader to look for something that is sitting there. That is
the failure this corpus already published a specification about, in its own report.

The larger half is that **`alters:` is the one field whose true value is usually not known when the
change is created**, and `molly change new` is the only thing that writes it. A change drafted
expecting to publish a decision and then finding it has to correct a specification has no route
except a hand edit of a closed record, which is the one operation `molly-corpus` tells an agent not
to perform — so the correct move and the permitted move are different moves. The field is not
load-bearing at publish time, which is what makes this a claim with no way to keep it true.

Found in the first adopting repository against `0004-sign-in-with-entra-id`, and reproduced against
0.3.2. **The message is the urgent half**; the correction route is a design question — whether it is
a flag on `move`, a second command, or a re-read at publish — and it should not be answered by
widening `change new`.

## 13. The reasoning behind a line of code is reachable from it

`molly why <path>[:<line>]` — the change or changes behind that code and what they argued, joined
from the ledger and read out of `history/` on the tool's own behalf.

**This is the other side of `0026` and arrives with it.** The archive is closed to an agent
because reading a retired change is how a retired shape gets copied forward. It is not closed to
the tool that sealed it, and the difference is the whole point: a question with a current answer
gets the current answer, and *why does this line exist* has no current answer anywhere else. A
plan is archived on publication day, so "the argument lives in the change" is a rule that loses the
argument the moment the change succeeds.

The evidence is not a session that went wrong. It is that the workaround is measurable and
ratchets: in the first adopting repository the code carries the argument instead, one file is 45%
comment and another was 53%, and the instruction that produced it — match the density of the
surrounding code — makes each generation match the last. The join already exists, because the
link from a commit to a change is derived rather than declared.

**Needs 7**, which decides what an archive holds; and it must read commits and never their
messages, which is settled. Two weaker forms were considered and are worth recording as not the
answer: keeping published changes in the working tree, which puts a second copy where greps find
it; and a warning at publish time naming reasoning no published document repeats, which depends on
somebody reading a warning about a document they are finished with.

# Still undecided, and not features until they are

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

**Seven proposals arrived from the first adopting repository and six are refused.** They share an
origin worth naming: each was written after an agent session went wrong — a document appended to
instead of rewritten, a filed specification edited by hand, frontmatter invented, a plan naming an
identifier belonging to a different application. In every case a person reading caught it, at the
moment it was cheapest to fix, for nothing. **A proposal whose only evidence is one session's
mistake that a person caught for free is describing the session rather than the tool**, and the
answer to that class is the text an agent reads before it writes, never a check the engine runs
after it.

**Unanswered questions do not become first-class again.** The ask was a gate on `in_progress →
implemented`, and a content-hash comparison of a change's documents across it. That mechanism was
built and removed before 0.2.0 and the reasoning is published in [instructions any agent can
read](../specs/agent-instructions/spec.md): a question is text, so a question appearing and being
answered is a diff, and git records it with author, timestamp and surroundings. The re-derivation
also rests on a premise the source disproves — nothing in this tool hashes anything — and the signal
it proposes fires on the healthy case, because documents unchanged between approval and
implementation are what a change that survived contact with the code looks like. The refusable move
that would let a project enforce a gate of its own is feature 8 above; this is one of its customers
and not a request for it. What survives is a heading: `change.md` carries what the documents do not
answer, so a change that is unresolved is unresolved on its face.

**No finding compares one document's frontmatter with its neighbours'.** Consistency with the
majority is the wrong oracle. The first document in an area has nothing to compare against, the
second makes the first the standard, and every later addition — `tracker:`, `superseded_by:` — is
reported until enough documents carry it to become the majority: it fires on the evolution it should
permit and goes quiet once a wrong shape has spread. The case that prompted it is already handled on
purpose, in that a missing `title:` falls back to the name, because what was written fastest is what
a reader most needs listed. What was owed instead is a closed list of the keys the tool writes,
which is a sentence in a scaffold and not a check.

**Nothing reports a filed document that stopped matching what published it.** The comparison is
available — `history/` holds a byte-frozen copy — and it is refused for what it would make `history/`
into. An archived bundle is sealed and never re-checked, and a check reading every archive on every
run makes `molly status` cost the age of the corpus rather than the work in flight, which is the
exact property feature 7 exists to remove. The refusal at publish asked for alongside it is the shape
already rejected for link repair: it would make editing a document somebody else left behind a
precondition for publishing your own. A hand edit is a commit touching a governed path with no
publication behind it, which is a question about git, and this tool reads git once to ask who you
are. What was owed is the positive form of the rule — where a correction goes — because an agent
holding a correction needs a destination rather than a prohibition.

**The clause about a payload's links moves rather than being added where it was asked for.** The
ask was a consequence appended to the mirror mapping in the area explainer, and that is the wrong
surface: the explainer is read once at the start of a session, and a link is written while a payload
is. It is one line in `molly-publish` instead — *its links are written for where the document lands,
not for where the file sits* — which makes it a placement rule beside the others rather than a note
about a checker's false positive. The false positive itself stays somebody else's: it belongs to a
checker walking `docs/` without knowing the mirror, and the wrong repair it fears is already named
by `molly publish` at the moment it fires.

**`molly context` gains no second caller before its own question is answered.** Folding a change's
four documents and its `alters:` targets into one result was measured at about 5% of one publishing
session, against a feature whose unit — documents or tokens — is open in feature 3 above. Widening a
design before its own question is settled is how this slice came to be seven slices. The
measurement's finding stands and is not this: cost scales with round trips, and its two largest
recoveries were an agent reading a command's semantics before walking them by hand, and a session
launched in the corpus root.

**A corpus does not declare the repositories a project spans.** Asked for as one field in
`mollyguard.yml`, so a product reading a corpus could learn what else is worked on with it from the
checkout rather than from its own database. The alternatives it weighs against are real and it
picks the better of them — but the comparison leaves out what the field would make this tool.
Every key that file holds is read by a command here: `root:` is how the corpus is found, `lang:` is
what documents are written in, `naming:` is how a name is minted. **No command would read this
one.** A configuration key the tool never reads is a registry entry for somebody else's product,
kept in this tool's file, going stale with nothing here able to notice — which is the failure this
product exists to prevent, arriving in the one file that says where the corpus is. What repositories
a project spans is a property of the project; the reading product owns it, or it goes in a file that
product owns beside the corpus. `naming:` is not the precedent it is claimed to be: a naming policy
is something every `molly` command has to obey.

**Enforcing the archive seal is not this tool's, and the adopter's own hook is the right owner.**
The eighth proposal asked `molly init` to write a `PreToolUse` hook refusing reads of `history/`,
and the settings entry that wires it. Its evidence is the strongest any proposal has arrived with —
the seal was breached by the session auditing for that class of defect, sweeping archived task
lists as its method — and the refusal is about scope rather than about the evidence. Three things
are already published and each one alone is decisive. **A settings file is not written, anywhere**:
that was built, and removed on the argument that a tool adding itself to the file deciding what
runs without being asked has approved itself — and a hook nobody wires does nothing, so shipping
one means either writing that file or shipping an inert script. **There are two kinds of file this
tool writes outside a corpus and there is no third**, asserted by the harness on every run; an
executable that runs inside somebody's agent session is a third. And **nothing verifies that the
instructions were followed** — a hook is exactly that verification, and the tool approves nothing,
here as everywhere. What was owed is the rule itself, which was genuinely missing: `history/` was
sealed against editing and against re-checking and silent about reading. That shipped as `0026`.
The instrument stays with the project, in the harness the project controls, removable in a file
somebody reviews — which is what `docs/conventions.md` is for, and where that repository's working
hook already lives. `changes/0027` is the ledger node where this was drafted before it was
withdrawn.

**The seventh is the one that is right, and it generalises past what it asked for.** `change.md` was
leaking construction detail because the tool partitions the four documents by subject — what and why
here, how there — and *why* absorbs every architectural argument truthfully. A subject is something a
writer classifies, and classifying one's own prose is the judgement both people and agents make
differently every time. A reader is not: *would this reader need it* has an answer. That is the shape
the scaffolds owe every document they open, and it is what the other six were each asking for one
symptom at a time.

# What is done

## 0.3.2 — a phase names what it reads, and an install says what it did not update

**`0026-a-phase-names-what-it-works-from-and-what-it-leaves-closed`** — every rule these
instructions carried fired in front of somebody writing, and reading was unbound. The archive is
now closed in the `history/` explainer and in `molly-corpus`, with the destination in the same
breath; `molly-advance` says what implementation works from, that a plan found wrong moves the
change back rather than being edited in place, and that a published specification found wrong is a
new change; the `tasks.md` template and `molly-new` say the payload is not a task. The reference
skill's cap moved from sixty to sixty-four, and the argument for moving it is published rather than
assumed: a body loads only once a model has decided the work is ours, so those lines are weighed
against the archived bundle they stop it loading.

Nothing is checked, and the harness asserts that too — reading `history/` still fails nothing.

**`0028-an-install-names-a-file-whose-text-this-version-changed`** — `molly init` said *it already
had everything this version writes* from `existsSync` alone, and printed it over an explainer
holding the previous release's text. `place()` gains a third outcome, the report names the path and
still keeps the file, and the sentence now claims only what existence establishes. Three files are
excluded because for them differing is the healthy case: `conventions.md` is an invitation, the
attributes file has its own remedy, and the ledger holds data.

**Feature 1 is not this**, and stays open. That one is about a `molly-*` directory a later version
no longer produces, which `--check` calls current because it never looks; this is about a file that
is still written and whose text moved.

## 0.3.1 — a document the tool opens says who it is for

**`0025-a-document-the-tool-opens-says-who-it-is-for`** — the four documents were partitioned by
subject, and a subject is something a writer classifies. Each template now opens by naming the
reader it is written for and where a sentence that fails that reader goes instead; `change.md`
carries *What is not settled*; the templates and `molly-new` say that revising is rewriting;
`molly-corpus` states how a correction reaches a filed document as an action rather than a
prohibition; and `molly-corpus` and `molly-publish` state the frontmatter a document carries as a
closed list rather than as agreement with its neighbours.

Not one of it is checked, and the harness asserts that: an open question under the new heading is
neither a finding nor a refusal. It is the answer to six proposals that each asked for a check, and
the reason it is a different answer rather than a smaller one is above.


## 0.2.0 — a corpus can be run from `init` to a formed knowledge base

Three defects, each of which forced a workaround on anybody adopting the tool. Found by running the
adopter path on clean repositories rather than by reading the plan.

**`0017-a-new-corpus-can-merge-its-own-ledger`** — `molly init` writes `<root>/.gitattributes` with
`.mollyguard/history.jsonl merge=union`. Before it, two branches each advancing a change conflicted
in the one file every skill says never to hand-edit, and the remedy was undiscoverable. Written
inside the corpus rather than at the repository root, which is what keeps it the tool's own file
under `decisions/the-tool-writes-only-what-it-owns`.

**`0018-the-ledger-names-a-change-that-is-gone`** — a ledger node with no bundle is reported by
`status` and by `move`. `changes/0010-a-commit-names-its-change` had been silently orphaned in this
corpus since that work was removed. Writing the tests found a second defect: with every change
deleted, `status` printed *no changes yet — nothing has been published* while the ledger remembered
four events, because the empty-listing branch returned before any finding rendered.

**`0019-the-knowledge-base-is-read-back`** — `molly status` reports `specs/` and `decisions/` in the
table and in `--json`; a published `capability:` resolves and fails when it dangles; `alters:`
resolves and reports without failing. Before it, publishing the first specification in a fresh
corpus produced a `status --json` that mentioned it zero times.

## Earlier

**`0015-a-roadmap-is-a-slice-of-planned-work`** — the roadmap holds slices, `molly roadmap new`
writes the shape, and the `molly-roadmap` skill teaches an agent to read one and draft from it. Its
progress half is feature 5 above, still open.

**`0016-a-command-that-needs-a-choice-offers-it`** — a command needing a value the corpus can
enumerate offers it to a person and refuses with the list to a pipeline, held by
`decisions/a-command-that-needs-a-choice-offers-it`.
