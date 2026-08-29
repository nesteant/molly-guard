# How it is built

Three defects in three layers, and each one lands in the layer that owns the fact. Nothing here is
a cross-cutting mechanism: a rule about not destroying things is kept by each writer refusing to
destroy, not by a guard somebody has to remember to call.

# Store — the write that skips

```ts
export type Placement = 'created' | 'kept' | 'differs';
export function place(root: string, path: string, text: string): Promise<Placement>;
```

Init's first answer is still whether it wrote: a `kept` file that happens to be byte-identical is
a file init did not write, which is why `differs` is a second kind of kept rather than a second
kind of write. `writeScaffold` next door has three outcomes for a different reason — `--check`
needs to tell a file that matches from one that does not — and it also *replaces* what differs,
which this must not, because those are the tool's own files at the repository root and these are
the project's inside a directory the tool did not make.

The third outcome exists because two made a claim the command could not support. It is computed by
reading the file, and skipped where the text to place is empty: a comparison against nothing can
only say *differs*, and the file that rule exists for is the ledger, which holds data and grows.
Which kept-and-differing files are worth saying out loud is the caller's judgement, not this
function's — `initCommand` excludes the three whose differing is the healthy case.

Every write in `initCommand` goes through it, the ledger included. The config keeps its own guard
above them all, because an existing `mollyguard.yml` is not a file to keep.

The run reports what it kept, by path, and still exits `0`. Nothing failed — the corpus is there
and the explainers it could write are written. What would be dishonest is the silence.

# Core — the reduction, and what it costs

`slug.ts` keeps `slugify` and gains a neighbour that says what the reduction discarded:

```ts
export function lostWords(title: string): readonly string[];
```

A word counts as lost when it holds a letter or a digit and reduces to nothing. Both halves are
needed: without the first, the em dash in *Invoice — immutability* is a lost word and every one
becomes a refusal; without the second, nothing is ever lost. Both read through one `reduce` shared
with `slugify`, so *what would this become* is answered by the code that makes it become that.

Clipping is not loss, and `lostWords` says nothing about it — a title over `SLUG_LIMIT` loses its
tail deliberately and visibly.

# CLI — one seam that mints

`nameFor` is the only place a name is derived, and the commands that mint call it rather than
carrying the same block each. It refuses in the two ways a name can be wrong and returns the one
that is right.

# Every layer of the area that shows up

Symmetric with capabilities at each layer, because it is the same kind of thing: a file per
document, no lifecycle, written by hand.

- `core/roadmap.ts` — `RoadmapRecord`, which is a capability's record plus the capability it
  belongs to.
- `store/roadmap.ts` — `readRoadmap`, the same scan `readCapabilities` makes. A folder is
  reported, a name that is not a slug is reported, a record that will not parse is reported, and
  none of them fails.
- `cli/status.ts` — `roadmap` on the report, gathered beside the capabilities, rendered on the
  line under them, and present in `--json` for a reader that is not a person.

Non-failing is the deliberate half, and it is the one line of this that is a decision rather than
a fix.

# What proves it

In `scripts/smoke.sh`, under `what an install finds`, `change new` and `the roadmap`. All three
defects are about what happens on a filesystem that already has something on it, so all three are
asserted against one.

**That the file survives, and that the run says so.** A `docs/README.md` holding a line nothing in
this tool would ever produce still holds that line, and the output names the path it kept. A skip
nobody is told about is a different failure from an overwrite and not a smaller one.

**That the ledger is not truncated.** A `history.jsonl` with a line in it and no `mollyguard.yml`
beside it still has that line afterwards — the case the reported defect was a mild instance of.

**That a written file is still written.** In a directory with nothing in it, init creates every
explainer and keeps none. This is the assertion that `place` did not quietly become a no-op, which
would look exactly like a fix from the other side.

**That a mixed-script title is refused**, naming the words and showing the name it declined to
mint; that `--name` still works, so a corpus written in Ukrainian remains usable; that a title
reducing to nothing keeps its own message; that punctuation between words is not loss; and that a
capability is named by the same rule, since the block was duplicated before this and duplicated
code is fixed once.

**That an entry appears in the table and in `--json`**, with its title and the capability it is
filed under, that `README.md` is not an entry, that one with no frontmatter is still listed under
its filename, and that a corpus with nothing intended says nothing about it. **And that what
cannot be read is said without failing** — a folder in `roadmap/` is reported and the exit code
stays `0`, asserted against the same shape of damage in `changes/`, which fails. The two answers
are the difference between a governed unit and a note.
