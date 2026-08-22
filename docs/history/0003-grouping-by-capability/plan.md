# How it will be built

The same boundary as the two changes before it: `@mollyguard/core` decides and holds no I/O,
`@mollyguard/store` reads and writes the corpus, `mollyguard` parses argv and prints.
What is new is the shape of the thing being written — **one file in an area that holds files**,
where everything so far has been a folder in an area that holds folders.

## Core

**`areas.ts`** gains the two halves of path identity as functions rather than as a rule each
caller re-implements:

```ts
qualify(area, slug) → 'capabilities/billing'
unqualify(area, given) → 'billing'      // from either form
```

`molly move` already open-coded the second one for `changes/`, and a second copy for
`capabilities/` is how two spellings of one rule start to disagree. `unqualify` strips a
leading `<area>/` and returns whatever it was given otherwise, so a field that admits one area
accepts the qualified form where somebody types it and stores the bare name.

**`capability.ts`** is what a capability is: a title and a language, and nothing else. No
state, no kind, and nothing it alters. The absence is the design — a record with a `state` field is a
record something will eventually try to move.

**`change.ts`** gains one optional field, `capability`. Optional in the type as well as in the
document: absent and empty are different answers, and a change that has not been filed is not
the same as one filed under nothing.

**`templates.ts`** widens its key from `ChangePart` to `DocumentPart` — the four parts of a
change bundle, plus `capability`. One seam rather than a second method per document kind, so a
format slice still substitutes `bodyFor` whole and a later `decision` or `roadmap` body is one
more member of a union. The capability body ships the same way the others do: it names the
sections and imposes no form, and it says *state the edge* because a capability with no stated
boundary collects every specification nobody else wanted.

## Store

**`layout.ts`** gains `isDocumentName`, which is false for `README.md` and for anything
beginning with a dot. One predicate, used by every scan there is and every scan there will be.
Writing the exclusion inside the new scanner would leave the change scan carrying its own copy
of the same rule, and the two would have to be found together the next time either is touched.

**`capability.ts`** writes one and reads them all.

`writeCapability` checks the path is free and returns a collision rather than throwing, like
the bundle writer. It appends nothing to the ledger, and that is the point rather than an
omission: the ledger holds lifecycle events, and this document has no lifecycle.

`readCapabilities` scans an area that holds files, which inverts the report the change scan
makes: a *folder* is what does not belong here, and it is named rather than skipped. Everything
else follows the rule already established — frontmatter that will not parse is reported, and a
document whose record is damaged is still listed, because a scan that dropped it would report
a corpus smaller than the one on disk.

**`bundle.ts`** carries `capability` through: written into the record at creation, read back by
the scan, and absent from the document entirely when nobody declared one — `serializeFrontmatter`
already omits an undefined field rather than emitting a blank key.

## CLI

**`capability.ts`** — `molly capability new "<title>"`, grouped under a noun like
`molly change new`, with the same four refusals: no corpus, no title, a title that reduces to
no usable name, and a name already taken.

**`change.ts`** — `--capability <name>` is resolved against what is on disk before anything is
written. The refusal names the capabilities there are and the command that makes another; a
refusal that only says "no" sends the reader to the source.

**`status.ts`** — one line listing the capabilities that exist, a column saying which one each
change is filed under, and a finding for any change whose capability does not resolve. The
finding exits 1, like the drift report: a corpus with a broken reference is not a corpus that
merely has news.

The column is always present, showing a dash where nothing is declared. A column that appeared
only when something used it would make the table's shape depend on the corpus, and a reader
seeing no column could not tell whether nothing was filed or the tool had no such idea.

# What this constrains afterwards

<!-- decision: a-readme-is-never-a-record -->

**A file named `README.md`, in any area, is documentation and never a record.** Excluded by
name, in one place, for every area — including every area added later.

Every directory in a corpus explains itself, because git tracks no empty directory and a
skeleton without them vanishes on clone. That was free while the only scanner filtered to
folders. It stops being free the moment an area that holds files is read, and the failure is
not subtle: an explainer in `decisions/` parses as a decision named `readme`, and a corpus
containing nothing but its own documentation goes red on its first check.

<!-- decision: the-ledger-holds-only-what-has-a-lifecycle -->

**Only a document with a lifecycle appears in the transition ledger.** A capability is created,
edited and deleted without a single line being appended, and the same will be true of anything
else that is current rather than in flight.

The alternative — recording creation for everything, so that "the ledger has never heard of
this" stays a usable signal everywhere — fails on its own terms. The event would have to carry
a `to:` state for a document that has none, every fold over that node would answer `draft`, and
a projection of that answer would be a state nothing could ever move. A signal bought by
writing something untrue into the record is not a signal.

What follows for publishing, which is next: a specification is accumulated truth rather than
work in flight, so folding a change into the knowledge base appends a line for the **change**
reaching `published`, and none for the specification it wrote.
