# How it will be built

Symmetric with capabilities at every layer, because it is the same kind of thing — a file per
document, no lifecycle, written by hand — plus one link and one finding.

## Writing an entry

`store/roadmap.ts` gains `writeRoadmapEntry`, mirroring `writeCapability`: refuse a collision,
write the record and the template body, and stop. No state field, because an entry is open or it
is answered by a change that landed and neither is recorded — a document carrying `state:` would
invite something to try moving it.

`molly roadmap new` mints through `nameFor`, so an entry is numbered where the corpus asks and
refused where the title would lose words. That is what a hand-written file does not get.

`--capability` is checked when given and stays optional at every later point: refusing an entry
for naming a capability nobody has written yet would refuse the ordinary order of planning.

## The link

`realises:` on `ChangeRecord`, bare like `capability:`, written by `--realises` and checked at
creation against what is on disk — the moment to catch a typo is while the author is at the
terminal.

It is a reference and not a dependency. Nothing here orders entries against each other.

## The two findings

In `status`, gathered beside the capabilities:

- **`realised-roadmap`** — an entry named by an *archived* change. Reported, not failing.
- **`dangling-roadmap`** — an *in-flight* change naming an entry that is not there. Reported, not
  failing, and only while in flight for the reason above.

## What this constrains afterwards

**The tool reports a disagreement between two models and resolves neither.** Retiring the entry
would be the tool deleting a document because a reference elsewhere changed state — the unasked-for
write this whole product is a cover over.

**Every area a corpus has is an area `status` shows.** An area added to `AREAS` and left out of the
report is an area that exists and cannot be seen.
