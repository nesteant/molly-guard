# How it is built

The same boundary as everything before it: `@mollyguard/core` decides and holds no I/O,
`@mollyguard/store` reads and writes the corpus, `mollyguard` parses argv and prints. What is
new is that this is the first command whose effect spans **several areas at once**, so the order
of writes is part of the design rather than an implementation detail.

# Core

**`areas.ts`** carries the field that decides where a change may write: `publishable`. `specs`
and `decisions` are; `capabilities` and `roadmap` are written directly; `changes` and `history`
are not knowledge. The refusal for a misplaced document is *derived from the area table* rather
than written as a list in the command — a list in a command is one somebody forgets to extend
when they add the next area. `grouped` and `entry` are read the same way, so the checks about
capability and about a bundled area's record are answered from the table too.

**`locate(path)`** reads a corpus-relative path as the document it addresses, in pure string
work: `specs/feeding/spec.md` is the specification named `specs/feeding`. That is why publishing
needs no flag saying where a document goes.

**`change.ts`** names the folder: `CHANGE_PUBLISH = 'publish'`. It sits beside `CHANGE_PARTS`
because it is part of what a change bundle *is*, not part of what publishing does.

Nothing else. Core reads no document and decides nothing about content.

# Store

**`publish.ts`**, three functions, each one plain:

- `readPublishSet(root, slug)` walks the folder and returns every document with its path
  relative to the corpus root, whether something is already there, whether it is byte-identical,
  and a line for anything it could not read. The walk is recursive because the mirror is a tree.
  Paths are POSIX-separated always: the string is an id as well as a path, and an id that reads
  differently on Windows is two ids.
- `applyPublishSet(root, documents)` writes them. Directories are created; documents are
  replaced whole.
- `archiveChange(root, slug, into)` renames the bundle into `history/`. It refuses rather than
  overwrites if something is already archived under that name, because an archive that can be
  overwritten is not one.

The set is read and validated **in full before anything is written**. Every refusal in this
command fires with the disk untouched, which is the same rule the bundle writer follows and
matters more here: a half-applied publication leaves the knowledge base holding some of a change
with nothing to say which half.

# CLI

**`publish.ts`** orchestrates and refuses. Order is validate, write, record, project, archive.

The comparison that answers *did anything actually happen* is a byte comparison against what is
at the path today. Byte-level rather than semantic on purpose: the tool has no opinion about
text, and "these two documents differ" is the strongest true statement it can make about a body
it refuses to read.

A document the store could not read is **refused here**, and this is the one place in the tool
where an unreadable file stops the command rather than being reported beside the work that
carried on. The store still only reports it, because reporting is what a scan owes. The
difference is what the caller does with it.

The check that a new document is filed under a capability is likewise the caller's: it is
answered across the whole set, because a specification's `spec.md` may be its sibling in the
same publication, and because the change's own `capability:` stands in where the document
declares none.

`--dry-run` runs every check and prints the plan. It is not a second code path — the same
function decides, and only the writing is skipped, because a dry run that could disagree with
the real one would be worse than none. The flag takes no value and must not swallow the argument
after it, so it may be written before the change name.

# What proves it

In `scripts/smoke.sh`, under `publishing` — mostly refusals, and, because this is the first
command that writes in four places, several assertions about what is *still there* afterwards:

- A publication lands where its paths say, with no flag naming a destination. Several documents
  land together, including two whole specifications at once — the sweeping-edit case, which must
  be ordinary rather than a special mode.
- A document that replaces an existing one replaces it **whole**: the old text is gone, not
  appended to.
- The archive still holds `publish/`. Asserted because it is what would silently stop being
  true, and it is what answers "what did this change actually write" without consulting git.
- Three refusals are asserted twice — that they refuse, *and* that the corpus is untouched
  afterwards — chosen as the ones latest in the order, where a half-application would be
  possible at all. The two halves fail independently.
- The unreadable case is asserted with a dangling symlink, which fails to read for anybody
  rather than only for a user without permission.
- Both shapes a change may write are covered: a specification lands as a folder with its
  `spec.md`, and a decision lands as a single file.
- `--dry-run` refuses what the real run refuses, and may be written before the change name.
- `molly move <change> published` is refused and **appends nothing**, counted per change: a
  refusal that half-applied would be worse than no check, and only the count tells them apart.
- A ledger line recording `"to":"merged"` — written before the rename — still folds, and to
  `published`, and is not reported as unreadable either.

And the standing constraint holds: `@mollyguard/core` still declares no dependencies and its
source contains no `node:` import, no `Date.now` and no `new Date`. Publishing reads and writes
more of the corpus than anything before it, and none of that reached the engine.
