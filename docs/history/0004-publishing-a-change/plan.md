# How it will be built

The same boundary as everything before it: `@mollyguard/core` decides and holds no I/O,
`@mollyguard/store` reads and writes the corpus, `mollyguard` parses argv and prints. What
is new is that this is the first command whose effect spans **several areas at once**, so the
order of writes becomes part of the design rather than an implementation detail.

## Core

**`areas.ts`** gains one field: whether documents in an area arrive by a change publishing
them. `specs` and `decisions` are `publishable`; `capabilities` and `roadmap` are written
directly; `changes` and `history` are not knowledge. The refusal for a misplaced document is
then *derived from the area table* rather than written as a list in the command — a list in a
command is one somebody forgets to extend when they add the next area.

**`change.ts`** names the folder: `CHANGE_PUBLISH = 'publish'`. It sits beside `CHANGE_PARTS`
because it is part of what a change bundle *is*, not part of what publishing does.

Nothing else. Core reads no document and decides nothing about content, which is what keeps
this command as reproducible as the rest.

## Store

**`publish.ts`**, three functions, each one plain:

- `readPublishSet(root, slug)` walks the folder and returns every document with its path
  relative to the corpus root, plus a line for anything it could not read. The walk is
  recursive because the mirror is a tree; a file it cannot load is reported rather than
  skipped, like every other scan.
- `applyPublishSet(root, documents)` writes them. Directories are created; documents are
  replaced whole.
- `archiveChange(root, slug)` renames the bundle into `history/`. It refuses rather than
  overwrites if something is already archived under that name, because an archive that can be
  overwritten is not one.

The set is read and validated **in full before anything is written**. Every refusal in this
command fires with the disk untouched, which is the same rule the bundle writer follows and
matters more here: a half-applied publication leaves the knowledge base holding some of a
change with nothing to say which half.

## CLI

**`publish.ts`** orchestrates and refuses. Order is validate, write, record, project, archive.

The comparison that answers *did anything actually happen* is a byte comparison against what is
at the path today. Byte-level rather than semantic on purpose: the tool has no opinion about
text, and "these two documents differ" is the strongest true statement it can make about a body
it refuses to read.

A document the store could not read is **refused here**, and this is the one place in the tool
where an unreadable file stops the command rather than being reported beside the work that
carried on. The store still only reports it, because reporting is what a scan owes. The
difference is what the caller does with it: a listing that skips a document it cannot read is
merely incomplete, while a publication that skips one writes part of a change into the
knowledge base and then declares the change finished.

`--dry-run` runs every check and prints the plan. It is not a second code path — the same
function decides, and only the writing is skipped, because a dry run that could disagree with
the real one would be worse than none.

# What this constrains afterwards

<!-- decision: the-tool-files-documents-and-never-writes-them -->

**The engine never authors content for the knowledge base.** It verifies, files, archives and
records. Every byte of every document is written by a person or by an agent acting as one, and
the tool's contribution is that nothing arrives unverified and unrecorded.

This is the rule that makes the whole thing safe to point an agent at. A tool that composed
text would be a tool whose output nobody owns — and the moment it composes, it must understand
what it composes, which ends language independence, ends format neutrality, and makes the
corpus's quality depend on how good the model was that day.

It also decides where every future feature goes. Contradiction detection produces a *finding*,
never a rewrite. Restructuring the base is a *change*, never a script. Translation produces a
document a person accepts, never one the tool asserts is correct.

<!-- decision: a-publication-is-validated-whole-and-written-whole -->

**A publication is all of its documents or none of them.** Everything is read and checked
before anything is written, and the archive step comes last so that the bundle stays where it
is until the base has accepted it.

The alternative — writing as you go — fails on its own terms: the failure mode of a knowledge
base is not that a write is slow, it is that nobody can tell which parts of it are true. Half a
publication is exactly that state, and it would be produced by the one command whose entire job
is to prevent it.
