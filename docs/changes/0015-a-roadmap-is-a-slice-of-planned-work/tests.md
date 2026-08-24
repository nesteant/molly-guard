---
title: A roadmap is a slice of planned work
lang: en
part: tests
---

# What will prove it

Assertions in `scripts/smoke.sh` against a corpus made by `molly init` in a temporary directory,
plus one thing a smoke suite cannot check, said plainly rather than papered over.

## The command

- `molly roadmap new "Billing overhaul"` writes `roadmap/billing-overhaul.md` and exits `0`.
- The file it writes contains the four headings — asserted on the file, because the template is
  half of an agreement the tool cannot otherwise hold.
- `molly roadmap new "…" --capability x` exits `1` naming the flags it takes. This is the flag
  table doing its job: a flag that is ignored is worse than one refused, because the caller has
  been told what they asked for.
- A slice carrying `capability:`, written by hand, is reported by `molly status`, which still exits
  `0` — everything about this area is reported and nothing fails.
- `molly status` renders slices without a capability column entry.

## The skill

- `scaffoldFor` produces a `molly-roadmap` skill under every skill root, and a command file for
  every tool that takes commands. Counted, so a fifth skill that reached three roots of four is a
  failure rather than a surprise.
- `molly agents --check` exits `0` immediately after `molly agents`, and `1` when a skill file is
  edited — proving the new files are covered by the check and not merely written.
- **The skill holds no corpus content.** The existing assertion that greps every generated file for
  decisions, capabilities and language must still pass with the new one in the set.
- Every command named in the skill body appears in `molly help`. The harness already greps for
  this, and a fifth skill is the reason it is worth having.

## The finding that changed

- A change realising a slice, published, with the slice still present: `molly status` names the
  change and asks whether the plan is current. Asserted on the text, not just the exit code,
  because the old wording told somebody to delete a plan that has four features left in it.
- Two changes realising one slice, both published: both are named. The single-change wording would
  have been a bug the moment a slice held more than one feature.
- A change realising a slice that is not there is still reported, unchanged.

## What this cannot prove, and how it is covered instead

**Whether an agent can actually find what is next.** No exit code answers that, and pretending a
grep does would be the failure this product exists to name.

It is checked by hand, once, before this change advances: a fresh session, given only the installed
skills and this repository's corpus, is asked to draft the next change. It passes if the change it
proposes is the feature the slice orders first among those not done, filed under the capability the
slice implies, with one claim in it. It fails if the agent invents a feature, drafts the whole
slice as one change, or asks where the plan is.

The result is written into this document before the change moves to `verified`, including what the
agent got wrong, because a shape that needs three attempts to read is a shape that needs changing
and the record of that belongs here rather than in somebody's memory.
