# How it is built

Symmetric with capabilities at every layer, because it is the same kind of thing: a file in an
area that holds files, written by hand or by one command, with no lifecycle and nothing recorded.
What is new is one link and one comparison.

The boundary is the usual one. `@mollyguard/core` decides what an entry *is* and holds no I/O,
`@mollyguard/store` reads and writes it, `mollyguard` parses argv and prints.

# Core

`roadmap.ts` is a record and nothing else: a title, a language, and the capability it belongs to,
bare like a change's. The capability is optional and *absent* rather than empty where nothing was
declared — an entry nobody filed is not an entry filed under nothing, and the two have to stay
different facts all the way to `--json`.

There is no state field, and its absence is the design rather than an omission.

`templates.ts` gains `roadmap` as one more member of `DocumentPart`, which is why that type covers
the parts of a bundle *and* each document that stands on its own: the next standalone document is
one more member of a union rather than a second method on the seam.

# Store

`readRoadmap` is the scan `readCapabilities` makes, over the other area that holds files. A folder
where a file belongs, a name that could not be typed, a record that will not parse — each is
returned as a line the caller reports, and none of the three fails.

Reading is deliberately forgiving below that. A missing title falls back to the name and nothing
is refused, because dropping an entry for having no frontmatter would hide exactly the ones
written fastest — which are the ones a planner most needs to be reminded of.

`writeRoadmapEntry` is a writer that guards nothing. No change alters an entry, so unlike a
publication there is nothing here to verify: it refuses a collision and stops. The collision is
*returned* rather than thrown, so the caller decides how to say it and the disk is untouched by a
refusal.

# CLI

`molly roadmap new` mints through `nameFor` — the same seam `change new` and `capability new` use,
applying the corpus's pattern after the reduction and both refusals. That is the half a
hand-written entry does not get, and the reason the command exists at all.

`--capability` is resolved through `readCapabilities` when given and skipped entirely when not.
The check is at the terminal and never later: nothing downstream asks an entry about its
capability again.

`requireEntry`, in `change.ts`, resolves `--realises` against `readRoadmap` and asks one question
— is that entry there. It does not ask whether the entry is ready, or whether anything it
mentions has to land first. `realises` then rides on `ChangeRecord` as a bare slug and is parsed
back out of frontmatter by the bundle reader, so it survives to the report.

# The comparison

Both findings are gathered in `status.ts`, beside the capabilities, and both carry `fails: false`.

`realised-roadmap` walks the entries and looks for a change that names each one *and* is
archived. `dangling-roadmap` walks the changes still in flight and looks for the entry each names.
The asymmetry is the point: the first is only interesting once the change has published, and the
second only while it has not.

Neither writes anything. There is no verb here that retires an entry, and the absence is
load-bearing rather than unfinished — deleting a document because a reference somewhere else
changed state is the unasked-for write this product is a cover over.

# What this constrains afterwards

**The tool reports a disagreement between two models and resolves neither.** Retiring the entry,
or rewriting the reference to keep it resolving, would each be the tool editing a document nobody
asked it to touch. See [capabilities/the-corpus](../../capabilities/the-corpus.md), where repair is
already ruled out for the same reason.

**Every area a corpus has is an area `status` shows.** An area added to `AREAS` and left out of
the report is an area that exists and cannot be seen — stated in
[what a command may never do silently](../what-a-command-may-never-do-silently/spec.md), and this
is the second area to hold it.

**A reference is checked where the answer is still free to change.** At the terminal, against what
is on disk, before anything is written. A reference checked later is a reference that has already
been archived wrong.

# What proves it

Eleven assertions in `scripts/smoke.sh` under `the plan and the corpus`, against a real corpus in
a temporary directory, and eleven more under `the roadmap` for the scan.

Four of them are the ones worth naming, because each defends a decision rather than a behaviour:

- **A realised entry is reported and the corpus stays clean** — `ok: true` in the same run that
  prints the finding. Asserted together, because a finding that fails is a different product.
- **Retiring it quietens the report** — asserted rather than assumed. A finding that never goes
  away is one people learn to ignore.
- **A published change is not asked again.** After the entry is retired the archived change points
  at nothing, and that is correct.
- **A name that loses words is refused** — `Облік expenses`, exactly as a change or a capability
  would be. It is the one assertion that says this area's names go through the same seam as
  everything else rather than a copy of it.
