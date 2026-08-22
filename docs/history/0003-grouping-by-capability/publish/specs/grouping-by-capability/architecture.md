# How it is built

The same boundary as everything around it: `@mollyguard/core` decides and holds no I/O,
`@mollyguard/store` reads and writes the corpus, `mollyguard` parses argv and prints. What is
new is the shape of the thing being written — **one file in an area that holds files**, where
everything before it was a folder in an area that holds folders.

# Core

**`areas.ts`** carries the two halves of path identity as functions rather than as a rule each
caller re-implements:

```ts
qualify(area, slug) → 'capabilities/billing'
unqualify(area, given) → 'billing'      // from either form
```

`molly move` open-coded the second one for `changes/`, and a second copy for `capabilities/` is
how two spellings of one rule start to disagree. `unqualify` strips a leading `<area>/` and
returns whatever it was given otherwise.

**`capability.ts`** is what a capability is: a title and a language, and nothing else. No state,
no kind, and nothing it alters. The absence is the design — a record with a `state` field is a
record something will eventually try to move.

**`change.ts`** carries one optional field, `capability`. Optional in the type as well as in the
document: absent and empty are different answers, and a change that has not been filed is not the
same as one filed under nothing.

**`templates.ts`** keys on `DocumentPart` — the four parts of a change bundle, plus `capability`.
One seam rather than a method per document kind, so a format slice still substitutes `bodyFor`
whole and a later `decision` or `roadmap` body is one more member of a union. The capability body
names its sections, imposes no form, and asks for the edge rather than the centre.

# Store

**`layout.ts`** holds `isDocumentName`, false for `README.md` and for anything beginning with a
dot. One predicate, used by every scan there is and every scan there will be. Writing the
exclusion inside the new scanner would leave the change scan carrying its own copy of the same
rule, and the two would have to be found together the next time either is touched.

**`capability.ts`** writes one and reads them all.

`writeCapability` checks the path is free and returns a collision rather than throwing, like the
bundle writer. It appends nothing to the ledger, and that is the point rather than an omission.

`readCapabilities` scans an area that holds files, which inverts the report the change scan
makes: a *folder* is what does not belong here, and it is named rather than skipped. Frontmatter
that will not parse is reported, and a document whose record is damaged is still listed, because
a scan that dropped it would report a corpus smaller than the one on disk.

**`bundle.ts`** carries `capability` through: written into the record at creation, read back by
the scan, and absent from the document entirely when nobody declared one —
`serializeFrontmatter` omits an undefined field rather than emitting a blank key.

# CLI

**`capability.ts`** — `molly capability new "<title>"`, grouped under a noun like
`molly change new`, with the same four refusals: no corpus, no title, a title that reduces to no
usable name, and a name already taken.

**`change.ts`** — `--capability <name>` is resolved against what is on disk before anything is
written. The refusal names the capabilities there are and the command that makes another; a
refusal that only says "no" sends the reader to the source.

**`status.ts`** — one line listing the capabilities that exist, a column saying which one each
change is filed under, and a finding for any change whose capability does not resolve. The
finding exits 1, like the drift report: a corpus with a broken reference is not a corpus that
merely has news.

# What proves it

In `scripts/smoke.sh`, under `capabilities` — mostly refusals and refutations:

- A capability is one file, carrying `title:` and `lang:` and containing **no** `state:`
  anywhere. Asserted as an absence, because a lifecycle field arriving by accident would look
  like a feature until something tried to move the document.
- After creating one, no line in `history.jsonl` mentions `capabilities/`. This is what keeps
  the record a record of lifecycle rather than a log of everything that touched the disk.
- The name rules are the change's rules, word for word, because a name that survives translation
  is one rule for the whole corpus.
- The generated document contains no `given:` and no `SHALL` — the same pair a change bundle
  carries, failing the moment somebody adds a helpful example to a template.
- Bare and qualified forms of the reference produce the same stored name, and a refused
  `--capability` leaves no bundle on disk.
- `status` lists a capability no change points at, shows a dash for a change filed under
  nothing, and exits 1 naming the change when a capability something points at is deleted.
- The explainer in `capabilities/` is neither listed as a capability **nor** reported as
  unreadable. Both halves matter: reading it as a record is the bug, and reporting it as a
  problem is the bug's second form. The same file in `changes/` is still not reported, which is
  what proves the rule moved into one place rather than being written twice.
- A folder in `capabilities/` is reported as a folder, and a capability with a damaged record is
  still listed.
- `qualify` and `unqualify` are checked directly, including that a different area's prefix is
  left alone.

And the standing constraint holds: `@mollyguard/core` declares no dependencies, and a grep over
its source finds no `node:` import, no `Date.now` and no `new Date`. Nothing here gave the engine
a reason to read the disk, and the check is what keeps that true rather than the intention.
