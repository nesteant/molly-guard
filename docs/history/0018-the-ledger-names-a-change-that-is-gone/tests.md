---
title: The ledger names a change that is gone
lang: en
part: tests
---

# What will prove it

The whole case is one command, so the fixture is one command: `mv` a change directory and ask.

## The orphan

- `mv docs/changes/before docs/changes/after`, then `molly status` names **both** halves — the
  bundle the ledger has no record of, and the node the corpus has no bundle for. Today only the
  first appears, and the assertion is on the second.
- `molly move` reports it too, before it acts, and still performs the move it was asked for.
- Exit stays `0`. Asserted, because the temptation is to fail on it and that would make a
  hand-reorganised corpus unusable until somebody silenced the tool.
- Deleting a change directory outright reports the orphan and no unrecorded bundle — the two
  findings are independent, and a test that only ever sees them together would not catch a
  rendering that assumes it.

## What is not an orphan

- A published change: its events stay under `changes/<name>` while its bundle moves to
  `history/<name>`, and the archived scan is what keeps it resolvable. **Reporting every
  publication as an orphan is the way this gets written wrongly**, so it is asserted directly.
- A corpus with no ledger at all, and one with an empty ledger: no findings, exit `0`.

## In this corpus

- `changes/0010-a-commit-names-its-change` is a real orphan sitting in the live ledger, so a run of
  `molly status` here must name it. That is the acceptance test, and it is the reason this check is
  worth fifteen lines: it has been silently wrong on every run since that change was removed.

## What must not have changed

- The `unrecorded` finding keeps its exact behaviour and wording.
- Nothing writes. A run of `status` over a corpus with an orphan leaves `history.jsonl`
  byte-identical — asserted, because the repair that must never exist is one line away from the
  check that must.

# What writing these tests found

**The empty listing was hiding the finding.** With every change deleted, `molly status` printed
*no changes yet — nothing is in flight, and nothing has been published* and returned before any
finding was rendered. The ledger remembered four events; the command whose whole job is to be true
about the corpus said there had never been anything.

It is the failure this corpus already names one level up — a report that omits an area is believed
— and it was reachable only through the branch that fires when the listing is empty, which is why
no existing assertion saw it. The empty-corpus sentence is now claimed only when nothing
contradicts it.

Kept as a record because the test that caught it was written from the sentence *the two findings
are independent, and a test that only ever sees them together would not catch a rendering that
assumes it*. That was the reason for the case, and it was right for a reason I had not predicted.
