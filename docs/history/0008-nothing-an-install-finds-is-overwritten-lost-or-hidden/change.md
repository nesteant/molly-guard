---
title: Nothing an install finds is overwritten, lost or hidden
lang: en
kind: bug
capability: the-corpus
state: published
alters:
  - specs/creating-a-change
---

# What this change makes true

Three defects, found by the first real install of `0.1.0` in a repository that already had a
`docs/` directory, a Ukrainian vocabulary and a roadmap. They are one change because they are
one failure said three ways: **the tool destroyed, discarded or concealed something that was
already there, and reported success each time.**

**A file that is already there is left alone.** `molly init` guarded exactly one path —
`mollyguard.yml`, the marker that says a corpus exists — and wrote every other file
unconditionally. `docs/` is the default root and `docs/README.md` is a file a great many
repositories already have, so the ordinary first run of the ordinary first command overwrote
somebody's documentation index and exited `0`. Worse and quieter: with the config deleted but
`docs/.mollyguard/history.jsonl` still present, init truncated the ledger — the one file in a
corpus that cannot be reconstructed from anything else. Now every write init makes is skipped
when something is there, and the run names what it left.

**A name is derived from the whole title, or not at all.** `slugify` reduces to ASCII and drops
what will not reduce, so *Вхід через Entra ID* was named `entra-id`: two thirds of the title
gone, no message, and a corpus of names that no longer resemble the work they point at. A title
that reduces to nothing already refused with a good message, which made the mixed case the one
that hurt — the realistic one for any corpus not written in English. Now the words that would be
lost are named and the run refuses, remedy first: `--name <name>`.

**`roadmap/` appears in `molly status`.** The area the corpus README calls "read while planning"
was the one area no command showed. `status` listed capabilities, changes and findings, and a
planner asking the tool what was already intended got an answer that omitted it — with nothing
saying anything had been omitted. The entries now appear in the table and in `--json`, read the
same way capabilities are.

# Why

Each of these is the same bug, and it is the bug this product exists to prevent: **a report of
success over an act nobody would have authorised.**

The first is the plainest. A tool that writes into a directory it does not own owes its user
the same courtesy `authorise()` already gives `.claude/settings.json` — merge what can be
merged, report what cannot, and never assume the contents were nobody's. `docs/README.md` is
not a special case of that rule; it was the first one anybody happened to run into.

The second is not a formatting problem. A name is minted once and never translated, which is
precisely what makes a silently partial one permanent: `entra-id` will be typed, cited and
archived under a title it no longer resembles, and the moment to catch it is the second before
it is written. Refusing costs one flag. Not refusing costs a name for as long as the corpus
lives.

The third is the cheapest to fix and the most corrosive to leave. A listing that omits an area
without saying so is worse than no listing, because it is *believed*: somebody planning against
`molly status` concludes nothing was intended and drafts a change that contradicts an entry
sitting in the corpus. This is the same argument the unreadable-change finding already makes —
exiting `0` while a governed unit is invisible is the tool vouching for something it did not
look at.

What this does not do is check roadmap entries the way changes are checked. An entry naming a
capability that does not exist is still not reported. That is a real gap and it is deliberately
left: `Finding` names its subject `change`, and generalising it is a change to the shape of the
report rather than to what the report can see.
