---
title: The ledger names a change that is gone
lang: en
part: plan
---

# How it will be built

Everything needed is already gathered. `status` reads the ledger and both bundle scans; the finding
is a set difference nobody has taken.

**`core/lifecycle.ts`** gains `nodesIn(events)` — every distinct `node`, in first-seen order. Pure,
like everything else there, and it is the half `isRecorded` already implies without exposing.

**`cli/status.ts`** takes the difference: a ledger node that matches no bundle, in flight or
archived.

**And it does not pre-empt `renamed_to`.** The first draft of this plan checked for one, so the
rename command would land without coming back here. Reading the code killed it: `readEvent`
requires a valid `to` state, so a line recording a rename is dropped today and reported as
unreadable — the clause would never have fired. A check that cannot run is worse than an absent
one, because it reads like cover. Teaching this check about renames is the rename's job, and it
is written into *what this constrains afterwards* so that it is found there rather than
rediscovered here.

The finding is `orphaned`, `fails: false`, and it names the node.

**`cli/move.ts`** reports the same thing before it acts. `move` is where a wrong state does damage,
so it is the second place this has to be visible — and it reads the ledger already.

**The two halves of one `mv` read together.** Where an unrecorded bundle and an orphaned node exist
in the same run, the rendering says so in one line rather than leaving a reader to correlate two
lists. It does not guess which orphan belongs to which bundle: a same-titled match is a heuristic,
and offering one would be the tool inventing a rename nobody performed.

## What is deliberately not done

**No repair, no `--fix`.** The remedy is `mv` it back or record the rename, and both are the
person's. A tool that quietly renamed ledger nodes to match directories would be rewriting the
record to fit the filesystem, which is the wrong direction — the ledger is the record.

**No guess at which bundle an orphan became.** See above.

**`stateOf` keeps answering `draft` for an unknown node.** Changing its return type to express
*unknown* would touch every caller for a case the report now names. The signal is the finding, not
a third kind of state.

# What this constrains afterwards

**Any feature that moves a node must teach this check, and `molly rename` is the first.** The
event model admits `created` and `transition` and nothing else, so a rename needs a new kind, a
reader that accepts a line with no state, and a clause here that stops treating a renamed node as
an orphan. All three land together or the rename ships a corpus that reports every rename as a
defect.

Until then the rule has no exceptions, which is what makes it worth having: a ledger node with no
bundle is a finding, always.

**A finding about the record never fails a build.** A corpus whose directories and ledger disagree
is a corpus somebody has to look at, not a broken one — and failing would make the first thing
anybody does with a hand-reorganised corpus be to silence the tool.
