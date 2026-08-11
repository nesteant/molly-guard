---
title: Grouping by capability
lang: en
capability: the-corpus
---

# A capability, and the reference to it

A capability is a document the tool writes, and a change says which capability its work belongs
to. The reference is **resolved** rather than merely written: a change naming a capability that
does not exist is refused while the author is still at the terminal, and one whose capability
disappears afterwards is named by `molly status`.

```
molly capability new "<title>" [--name <name>]

docs/capabilities/<name>.md      one file, and no lifecycle

molly change new "<title>" --capability <name>
```

| | capability | change |
| --- | --- | --- |
| lives in | `capabilities/<name>.md`, one file | `changes/<name>/`, four documents |
| has a state | no | yes, folded from the ledger |
| is recorded in the ledger | no | created, and every move |
| altered by | editing it | nothing — a change is what alters a specification |

# A capability has no lifecycle, so nothing pretends it has one

Creating one appends **nothing** to the transition ledger, and the document carries no `state:`.
Both are the same fact seen twice: the ledger is a record of lifecycle events, and a capability
has no lifecycle to record. A `created` line would have to carry a `to:` state, which would mean
inventing one — and every fold over that node would then answer `draft` for a document that is
neither drafted nor published.

That costs one signal and it is the right thing to lose. A change the ledger has never heard of
is suspicious, because `molly change new` is the only way to make one properly. A capability
written by hand is not suspicious, because writing one by hand is how the README says to make
one. What the command adds is a name minted the same way every other name is, a record at the
top, and the sections a person fills in.

# The reference, and where it is checked

`capability:` on a change takes the **bare name** — `billing`, not `capabilities/billing` —
because the field admits exactly one area, so there is nothing for a prefix to disambiguate. The
qualified form is accepted where it is typed, and what is written down is the bare name. A
*different* area's prefix is left alone rather than stripped, so `capabilities/x` given where a
change is expected stays wrong and is refused by name instead of silently resolving to `x`.

Two checks, and they are the same check at two moments:

- **At creation.** `molly change new "…" --capability nope` is refused, and the refusal lists the
  capabilities there are and the command that makes another. The reference is resolved before
  anything is written, so a refusal leaves no half-made bundle.
- **Afterwards.** A change whose capability no longer resolves is named by `molly status`, which
  exits 1. Deleting a capability that something points at is how the reference breaks once the
  author has left the terminal, and a broken reference nothing reports is a grouping that is
  quietly wrong.

Declaring nothing is allowed and is not reported. A corpus that has not divided itself into
capabilities yet is a small corpus, not a broken one — and the empty column says so on every row
without anybody having to be told twice.

# What `status` shows

The capabilities that exist, on their own line, and the capability each change is filed under, as
a column. Both are needed and neither substitutes for the other: **a capability with no changes
in it must still be visible**, because that is what every capability looks like on the day it is
created, and a listing that only showed the ones in use would hide exactly the ones somebody
needs to be reminded to use.

The column is always present, showing a dash where nothing is declared. A column that appeared
only when something used it would make the table's shape depend on the corpus, and a reader
seeing no column could not tell whether nothing was filed or the tool had no such idea.

# `README.md` is documentation, never a record

`molly init` writes a README into every directory. Reading an area that holds *files* is what
makes that cost something, so the rule arrives with the first such scan: **a file named
`README.md`, in any area, is documentation and never a record** — excluded by name, in one
place, for every area rather than per area. A rule written per area is one somebody forgets when
they add the next one, and the failure is a corpus whose first `status` reports a capability
called `readme`.

Machine-local clutter goes the same way: anything beginning with a dot is not a document.

# Why it is arranged this way

**Because a grouping nothing points at is a directory.** `capabilities/` has existed since
`molly init` was written, and until something names a capability, creating one is filing a
document in a drawer nobody opens. The field on a change is what turns the directory into a
grouping, and resolving the field is what keeps the grouping true.

**Because publishing has to know where a specification is filed.** Folding a change into the
knowledge base writes a specification, and a specification names the capability it belongs to.
The change is the only document that can say which — so the field has to exist, and be known to
resolve, before there is a publication to read it. Building it afterwards would mean publishing
either inventing a capability or filing into nothing.

**Because a capability is where a corpus stays readable.** A corpus stops fitting in one sitting
long before it stops being worked on, and the only thing that makes it readable again is reading
a slice of it. The slice has to be named by something a document declares, which is what makes
this a field rather than a folder convention.

**Because a reference that is never resolved is a string.** A capability exists or it does not,
so the field naming one can be checked the day it is written — and a corpus where one reference
is checked and another is not is one where nobody can tell which kind they are looking at
without reading the source.

**Because the moment to catch a bad name is while the author is still there.** The refusal at
creation costs one command; the report from `status` costs somebody a puzzled minute weeks
later. Both exist because they catch different mistakes: a typo, and a deletion.

# What is deliberately not done

No `molly capability list` — `status` is the corpus overview, and a second listing command would
be a second answer. No rename, and no supersession. No refusal to delete a capability something
points at: a deletion is reported, and refusing it would mean the tool guarding a document it
has told people to edit by hand. Nothing writes `capability:` onto a specification, because
specifications do not exist until a change is published into them.

One wrinkle is stated rather than pre-solved: when a change alters a specification that already
exists and already declares a capability, two answers exist. Reconciling them belongs to
publishing, because publishing performs the write. Here the field is a declaration that
resolves.
