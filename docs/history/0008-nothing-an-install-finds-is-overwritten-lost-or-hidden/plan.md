# How it will be built

Three defects, three small pieces, and each one lands in the layer that owns the fact.

## The write that skips

Store grows one function, because init is the only thing that writes into a directory it did
not make:

```ts
export type Placement = 'created' | 'kept';

/** Writes only where nothing is. Reports which happened, never which it wanted. */
export function place(root: string, path: string, text: string): Promise<Placement>;
```

Two outcomes and not three. `writeScaffold` next door has three — `created`, `replaced`,
`current` — because `--check` needs to tell a file that matches from one that does not. Nothing
asks that here: init's answer is whether it wrote, and a `kept` file that happens to be
byte-identical is still a file init did not write.

Every write in `initCommand` goes through it, the ledger included. The config keeps its own
guard above them all, because an existing `mollyguard.yml` is not a file to keep — it is a
corpus, and the whole command refuses.

The run reports what it kept, by path, and still exits `0`. Nothing failed: the corpus is there
and the explainers it could write are written. What would be dishonest is the silence.

## The name that refuses to be partial

`slugify` keeps its behaviour and gains a neighbour that says what that behaviour costs:

```ts
export function lostWords(title: string): readonly string[];
```

A word counts as lost when it holds a letter or a digit and reduces to nothing. Both halves are
needed: without the first, `—` in *Invoice — immutability* is a lost word and every em dash
becomes a refusal; without the second, nothing is ever lost. Both are read through one `reduce`
shared with `slugify`, so the question "what would this become" is answered by the code that
makes it become that.

Clipping is not loss. A title over `SLUG_LIMIT` still loses its tail, deliberately and visibly,
and `lostWords` says nothing about it — it is about the alphabet, not the length.

The two commands that mint names — `change new` and `capability new` — already carried the same
eight-line block twice. It becomes `nameFor(...)` in the CLI, which refuses in the two ways a
name can be wrong and returns the one that is right. It takes the title and whatever `--name`
gave, and the corpus and area alongside them — a later change makes a name the corpus's own
shape to decide, and this is the seam it decides at. The order matters: a title that
reduces to *nothing* keeps the message it already had, because `"" would be named ""` is not a
sentence. Only a *partial* name gets the new one, and it names the words and shows the name it
refused to mint. A name given with `--name` is checked for neither: the author chose it.

## The area that shows up

Symmetric with capabilities, at every layer, because it is the same kind of thing — a file per
document, no lifecycle, written by hand.

- `core/roadmap.ts`: `RoadmapRecord`, which is a capability's record plus the capability it
  belongs to.
- `store/roadmap.ts`: `readRoadmap`, the same scan `readCapabilities` makes — a folder here is
  reported, a name that is not a slug is reported, a record that will not parse is reported, and
  none of them fails.
- `status.ts`: `roadmap` on the report, gathered beside the capabilities and rendered on the
  line under them.

Non-failing is the deliberate half. An unreadable *change* fails, because a change is a governed
unit and a listing missing one is a listing that vouches for a corpus it has not seen. Intent is
not governed. Reporting it is the rule; failing a build over a broken YAML block in a planning
note would be refusing somebody's notes for existing.

## What this constrains afterwards

**A file the tool did not write is not overwritten, in any command.** `authorise` merges,
`place` skips, and `publish` writes only into a corpus that is its own. The next command that
writes outside one answers this question before it is written, not after somebody loses a file.

**A derived name is derived from the whole title.** Any future minting — a roadmap command, a
decision command — goes through `nameFor` rather than through `slugify` directly. `slugify`
alone is the reduction; `nameFor` is the reduction plus the refusal, and the refusal is the part
that has to be impossible to forget.

**Every area a corpus has is an area `status` shows.** The report is what a planner reads
instead of `ls`, so an area added to `AREAS` and left out of the report is an area that exists
and cannot be seen. `specs/`, `decisions/` and `history/` are reachable through the changes that
published them; `roadmap/` was reachable through nothing, which is what made it the one that
broke.
