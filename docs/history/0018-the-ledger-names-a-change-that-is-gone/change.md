---
title: The ledger names a change that is gone
lang: en
kind: bug
capability: the-change-flow
realises: what-mollyguard-still-owes
state: published
alters:
  - specs/the-state-of-a-change
  - specs/what-a-command-may-never-do-silently
---

# What this change makes true

**A ledger node with no bundle is reported, by `molly status` and by `molly move`.** The events are
still there, the change they belong to is not, and the report says so instead of leaving the corpus
to look complete.

**A fold over a node with no events says so where a same-titled orphan exists.** `stateOf` answers
`draft` today for a bundle the ledger has never heard of, and the next refusal states that wrong
state as a fact. Where an orphan is sitting in the ledger, the report names it beside the
unrecorded bundle, because those two findings are one `mv` and reading them apart is what makes
them hard to act on.

**Neither fails a build.** A corpus that predates the ledger, or one somebody reorganised by hand,
is not broken — it is a corpus whose record and whose directories disagree, and saying so is the
whole job. The existing `unrecorded` finding is already on this line and this one joins it.

# Why

Half of this is built and the built half is the half that produces a *missing* answer. The silent
half produces a **wrong** one.

Rename a change directory with `mv` and `molly status` reports `1 change(s) the ledger has no
record of: <new-name>`. Everything recorded under the old name is now orphaned, and nothing
mentions it — not the listing, not the exit code, which stays `0`. Fold the old node and the answer
is `draft`, stated with full confidence by a function that has no events to fold and no way to say
so.

**This corpus has an orphan right now**, which is what makes the check testable rather than
theoretical. The ledger holds fourteen nodes and thirteen changes exist:
`changes/0010-a-commit-names-its-change` was the `MollyGuard:` trailer work, removed by hand when
that idea was dropped. Its events sit in `history.jsonl`, no bundle for it exists in `changes/` or
`history/`, and every `molly status` since has exited `0` without mentioning it. The only trace is
the ordinal it consumed, and only the naming rule can see that.

**The report is the product's one claim.** A corpus is an assertion that what you are reading is
what is true, and a listing that silently omits a governed unit the record still knows about is the
same false report this tool exists to catch in other people's documents. It is fifteen lines and it
turns a confident wrong answer into a named finding.

It is also what `molly rename` is built on. A rename that recorded `renamed_to` would resolve
through the chain — but `mv` will always be available, so the orphan has to be *visible* rather
than prevented. This is the correctness; the command is the convenience.
