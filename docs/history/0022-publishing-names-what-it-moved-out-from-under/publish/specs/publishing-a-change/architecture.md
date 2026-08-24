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

**`references.ts`** answers what pointed at a path that has just moved.

```ts
referencesInto(root, areas, moved): Promise<readonly BrokenReference[]>
```

It takes the moved path as an argument and knows nothing about publishing, which is what keeps
it a scan rather than a second half of the command: the next thing that moves a directory asks
the same question with a different argument. The areas are passed in for the same reason and one
more — the area that must **not** be walked is `history/`, and that exclusion is the archive's
definition rather than a special case this module should carry.

Two conditions, both required: the link resolves to nothing, and the path it names is inside
`moved`. The second is a prefix comparison against a path the caller performed the rename on, so
it is an observation rather than a guess.

Markdown has two link shapes and there is no third — inline `[text](target)` and a reference
definition `[id]: target`. Neither an autolink nor a bare URL can name a relative path inside a
corpus. An anchor is cut before resolving, because this resolves documents and not places inside
them, and the `g` regex has its `lastIndex` reset per line — a module-scoped stateful regex is
the classic way a scan silently skips every other match.

The set is read and validated **in full before anything is written**. Every refusal in this
command fires with the disk untouched, which is the same rule the bundle writer follows and
matters more here: a half-applied publication leaves the knowledge base holding some of a change
with nothing to say which half.

# CLI

**`publish.ts`** orchestrates and refuses. Order is validate, write, record, project, archive,
**then report what the archiving broke**.

That last step is after the move and not before it, and the order is the design rather than an
optimisation: the reference is invalidated *by* the move, so a check that ran first would be
checking a corpus that no longer exists — it would have to predict rather than observe. It
reports and returns; the exit code is untouched, because a publication that happened is not a
refusal.

The comparison that answers *did anything actually happen* is a byte comparison against what is
at the path today. Byte-level rather than semantic on purpose: the tool has no opinion about
text, and "these two documents differ" is the strongest true statement it can make about a body
it refuses to read.

A document the store could not read is **refused here**, and this is the one place in the tool
where an unreadable file stops the command rather than being reported beside the work that
carried on. The store still only reports it, because reporting is what a scan owes. The
difference is what the caller does with it.

The naming check is the caller's too, and it is a refusal rather than a rewrite. `publish` reads
the same policy `change new` reads and loops the located documents once, before anything is
written. A document replacing one already in the base is skipped, because it is filed and where it
sits is not this change's question. A bundled document whose folder already exists is skipped as
well — `replaces` is per *file*, and a second file joining an existing folder is not a new
document. What is left is a name the pattern would not have produced, and it is told the name it
would have to be.

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
- **What the archiving broke**, in its own block: one live change pointing at the published one
  is named with its file, line and target, and told where the target went. Three refutations
  stand beside it and are the half that matters — a link that still resolves, an external link,
  and breakage that was already there are each *not* named, so the report cannot become a list
  nobody reads. A link inside the archived bundle is not named either, because the archive is
  sealed.
- **The referring document is compared before and after**, which is the assertion this design
  turns on: the command names the break and does not touch the file. And the ordinary
  publication is proven quiet, because a report that fires on every run is one people learn to
  scroll past.
- A published name off the pattern is refused, and the refusal names the folder to write instead
  rather than merely saying that one is wrong — a name the author cannot see before it is
  permanent is a name they will get wrong. Asserted with the corpus checked untouched afterwards,
  and against the three cases that must *not* fire: a name already on the pattern, a document
  replacing one already in the base, and a file joining a folder that is already there.
- `--dry-run` refuses what the real run refuses, and may be written before the change name.
- `molly move <change> published` is refused and **appends nothing**, counted per change: a
  refusal that half-applied would be worse than no check, and only the count tells them apart.
- A ledger line recording `"to":"merged"` — written before the rename — still folds, and to
  `published`, and is not reported as unreadable either.

And the standing constraint holds: `@mollyguard/core` still declares no dependencies and its
source contains no `node:` import, no `Date.now` and no `new Date`. Publishing reads and writes
more of the corpus than anything before it, and none of that reached the engine.
