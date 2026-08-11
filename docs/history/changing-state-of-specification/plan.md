# How it will be built

The same boundary as before: core decides, store persists, the CLI parses argv and prints. Two
things arrive from outside and are therefore **passed in rather than read** — the timestamp and
the identity of whoever is acting. A function that read the clock or shelled out to `git` could
not be re-run to reproduce a result, and that property is what lets the same code answer the
same way behind a terminal, inside a server, and in a test.

## Core

**`lifecycle.ts`** — the states as an ordered list, and nothing that permits or forbids:

```ts
export const STATES = ['draft', …, 'published'] as const
export function positionOf(state: State): number
export function directionOf(from: State, to: State): 'advances' | 'returns' | 'stays'
```

There is no table of edges. `directionOf` derives the answer by comparing positions, which is
what keeps it true for a move nobody enumerated — a jump of three states forwards is still
`advances`, and a table of permitted edges could not have said so without listing it.

`INITIAL` is the first of the sequence and `TERMINAL` the last, both derived rather than
declared separately, so they cannot drift from the list they describe. `TERMINAL` is a label:
nothing refuses to leave it.

Two functions read the log:

- `stateOf(events, node)` — folds an event list. No events means `draft`. The last event wins
  **by position, not by `at`**: the file is the order things happened, and folding by timestamp
  would let one machine with a wrong clock reorder history.
- `isRecorded(events, node)` — whether the ledger knows this node at all. Distinct from "is in
  draft", and the distinction is the point: `stateOf` answers `draft` both for a change just
  created and for a bundle nobody ever recorded, and cannot tell them apart.

**`choices.ts`** — what a person may be offered, as pure functions, so a slice can filter
without importing a terminal and the harness can assert without driving one:

```ts
selectableStates(from, filters) → { to, kind }[]
selectableChanges(all, filters) → MoveChoice[]
```

A filter is intersected with what it was given rather than trusted: anything it returns that
was not offered is dropped. Otherwise a slice could present an edge the table does not have,
and the lifecycle would mean something different depending on what is installed.

**`frontmatter.ts`** gains `withField(text, key, value)` — replaces one line of a frontmatter
block and leaves every other byte alone, in whichever line endings the file already uses. Both
`\n` and `\r\n`, because the *reader* accepted both from the start: a writer that did not would
mean a document checked out on Windows reads fine and then silently refuses to be updated, with
the state recorded in the ledger and never projected. Not a re-serialisation: reading a document into a
model and writing the model back drops whatever the model does not represent, and the loss
looks exactly like success. It returns `null` where there is no frontmatter block, because
writing one into a file that has none would be inventing a record rather than updating it.

## Store

**`history.ts`** — `docs/.mollyguard/history.jsonl`, one object per line, appended and never
rewritten:

```json
{"node":"changes/<n>","at":"<iso8601>","kind":"created","to":"draft","by":"Name <email>"}
{"node":"changes/<n>","at":"<iso8601>","kind":"transition","from":"draft","to":"review","by":"…"}
```

`from` is **omitted** on a creation rather than written as null: nothing preceded it, and a
null invites a reader to treat it as a state.

Written strictly, read leniently. A line from before `kind` existed carries a `from` and is
read as a transition — refusing it would mean an upgrade silently emptied somebody's audit
trail, which is the one thing a ledger may never do.

Appending creates the `.mollyguard/` directory if it is absent. That directory is state the
tool owns, so writing into it may make it — and without that, a corpus missing it crashed
*after* the bundle had been written, leaving a change on disk the ledger had no record of. A
half-applied creation is what the collision check exists to prevent everywhere else. Reading
still reports an absent ledger, which is where that distinction belongs.

Field order is fixed at the point of writing rather than left to the caller's object literal,
so the file greps and diffs identically whoever produced the line. A malformed line is reported
and skipped, never silently dropped. A *missing* ledger is reported too: `init` writes it, so
its absence means the corpus was cut down rather than never used.

**`bundle.ts`** — the scan reports what it cannot use rather than filtering it out. A file
where the area holds folders, a folder with no `change.md`, frontmatter that will not parse:
each is named. A file that exists and does not load is specified as far as its author is
concerned and absent as far as everything else is concerned, and a silent skip means nothing
downstream will ever mention it. The two exceptions are the `README.md` every directory carries
and anything beginning with a dot — reporting those would make the report the noise.

Reading a change now also reads the `state:` it declares, kept as
`declared` and deliberately separate from the fold rather than merged into it. Undefined means
the document predates the field, which is not a disagreement. `writeDeclaredState` updates that
one field through `withField`, and returns what went wrong rather than throwing.

## CLI

**`identity.ts`** — `git config user.name` and `user.email`, resolved once per process,
combined as `Name <email>`. With neither available the answer is the literal `unknown`.

**`move.ts`** — resolve the change (bare or qualified, or picked), fold, compare the fold with
what the document declares, look up the edge, append, then project. **Recorded first, projected
second**: if the write of `state:` fails the transition still happened, and saying so is better
than pretending it did not.

**`status.ts`** — a bundle with no events at all is listed as one the ledger has no record of,
and the name first, because it is the string every other command takes and a
title need not resemble it; then state, kind and title. A row whose document disagrees with the
ledger is marked, listed underneath, and makes the command exit 1.

**`pick.ts`** — a thin shell over the pure lists. The prompt package is ESM and this build is
CommonJS, so it is imported where it is used, which also means a run that never asks anything
never loads it. Where nothing is reading input the command refuses and names what would have
been offered, because a prompt in a pipeline blocks until the job is killed and the output says
nothing about why.

# What this constrains afterwards

<!-- decision: the-ledger-is-the-record-and-everything-else-is-a-projection -->

**One place is authoritative for any fact, and everything else derived from it must be
checkable against it.** The transition ledger is the record of what happened; `state:` in a
document is a projection of it; a projection is only allowed to exist where something compares
the two and reports a disagreement.

This is what makes it safe to put a fact in a second, more convenient place — and it is the
rule that says when it is not. A cached value nothing verifies is indistinguishable from a
stale one, and the failure is silent, which is the worst property any part of an audit trail
can have.

Two consequences follow immediately. Nothing may offer to *repair* the ledger from a document:
correction runs the other way, because the record is what happened and the projection is what
someone wrote down. And a hash taken over a change must exclude `state:`, or advancing a change
would revoke its own approval on the very next step.
