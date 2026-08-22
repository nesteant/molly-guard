# What will prove it

In `scripts/smoke.sh`, under `capabilities`. As before, mostly refusals and refutations: a
check that silently stops refusing looks exactly like one that is working, and nothing else in
the system notices.

## A capability is one file, with a record and no state

- `molly capability new "Billing"` reports `capabilities/billing`, and
  `docs/capabilities/billing.md` exists afterwards — one file, not a folder.
- It carries `title:` and `lang:`.
- It contains **no** `state:` anywhere. Asserted as an absence, because a lifecycle field
  arriving by accident would look like a feature until something tried to move the document.
- Nothing about it reaches the ledger: after creating one, no line in `history.jsonl` mentions
  `capabilities/`. This is the assertion that keeps the record a record of lifecycle rather
  than a log of everything that happened to touch the disk.

## A name is minted, and a bad one is refused

- `--name` overrides the derived name.
- `"!!! ???"` is refused with *does not reduce to a name*, the same rule and the same words as
  a change, because a name that survives translation is one rule for the whole corpus.
- Creating the same capability twice is refused with *already exists*, after a successful
  create, so it is the collision being caught rather than a missing corpus.
- A missing title is refused, and outside a corpus the refusal is *no corpus at*.

## No format is imposed

Two refutations over the generated document, the same pair a change bundle carries:

- it contains no `given:`
- it contains no `SHALL`

They fail the moment somebody adds a helpful example to the template, which is exactly when
the corpus would quietly acquire a house form nobody chose.

## The reference resolves, or it is refused

- `molly change new "…" --capability billing` writes `capability: billing` into `change.md`.
- The **qualified** form `--capability capabilities/billing` writes the same bare name. One
  reference, two spellings accepted where a person types them, one spelling stored.
- `--capability nope` is refused with *no capability named*, and the refusal names `billing` —
  both halves asserted, because a refusal that does not say what the valid answers are sends
  the reader to the source.
- **The refused change is not on disk.** The reference is resolved before anything is written,
  so a refusal leaves no half-made bundle — the same property the name collision has, asserted
  the same way.
- A change created with no `--capability` at all is not refused and not reported. Not declaring
  a grouping is an answer.

## What `status` shows, and what it finds

- The capabilities that exist are listed, including one no change points at. That is what every
  capability looks like on the day it is made, and a listing that only showed the ones in use
  would hide exactly the ones somebody needs reminding to use.
- A change's row names the capability it is filed under.
- A change filed under nothing shows a dash rather than a blank, so the column reads as
  answered-with-nothing rather than as a rendering that failed.
- Deleting a capability something points at makes `status` **exit 1** and name the change and
  the capability it cannot find. The reference breaks after the author has left the terminal,
  which is why the refusal at creation is not the whole check.
- A corpus with no capabilities at all says nothing about them and exits 0. A tool that
  reported an empty grouping as news would train people to ignore its findings.

## `README.md` is documentation, never a record

- The explainer `molly init` writes into `capabilities/` is **not** listed as a capability, and
  is not reported as unreadable either. Both halves matter: reading it as a record is the bug,
  and reporting it as a problem is the bug's second form.
- The same file in `changes/` is still not reported, which is the assertion that proves the
  rule moved into one place rather than being written twice.

## What cannot be read is said out loud

The area holds files, so the report is the mirror of the one `changes/` makes:

- A **folder** in `capabilities/` is reported as *a folder, and capabilities/ holds files*.
- So is a file that is not a markdown document at all.
- Frontmatter that will not parse is named.
- A capability with a damaged record is still listed, because a scan that dropped it would
  report a corpus smaller than the one on disk.

## The id is said once, and asserted where it is decided

The two halves of path identity are pure functions, so they are checked directly rather than
through a command:

- `unqualify` returns the bare name from either the bare or the qualified form.
- It leaves a **different** area's prefix alone, so `capabilities/x` given where a change is
  expected stays wrong and is refused by name rather than silently resolving to `x`.
- `qualify` and `unqualify` round-trip.

## And the constraint still holds

`@mollyguard/core` declares no dependencies, and a grep over its source finds no `node:`
import, no `Date.now` and no `new Date`. Nothing in this change gave the engine a reason to
read the disk, and the check is what keeps that true rather than the intention.
