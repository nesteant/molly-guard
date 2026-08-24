---
title: A move that crosses several states names them
lang: en
kind: feature
capability: the-change-flow
state: draft
alters:
  - specs/the-state-of-a-change
  - specs/what-a-command-may-never-do-silently
---

# What this change makes true

**A move that crosses more than one edge names the states it crossed**, in the line it already
prints:

```
→ changes/0003-run-in-a-deployed-environment draft → deployed
  (advances, skipping review, approved, in_progress, implemented, verified)
```

**Nothing is refused and no event is invented.** One transition was asked for, one is recorded, and
the states named were passed rather than performed. A move that returns across several states is
named the same way.

# Why

The lifecycle permits this deliberately, and that is not what changes here. [The state of a
change](../../specs/the-state-of-a-change/spec.md) is a sequence rather than a set of permitted
edges: what a move *requires* is policy, and policy belongs to a slice or to whatever orchestrates
the work. The engine owns the vocabulary and the record.

**What is wrong is that the record and the report say nothing about distance.** A one-edge move and
a six-edge move differ in the output by a single word, and both read as `advances`. So `molly move
0003 deployed` typed where `review` was meant is indistinguishable from a deliberate jump, at the
one moment it is still free to correct — and afterwards the ledger holds one line that is entirely
true and reads, to anybody folding it later, as a change that was never reviewed.

Under [what a command may never do
silently](../../specs/what-a-command-may-never-do-silently/spec.md), this is the reportable kind:
**what the tool knows and does not show is the same failure as what it overwrites and does not
say.** The distance is arithmetic over a sequence the tool owns, and it is currently computed —
`directionOf` derives `advances` from exactly the two positions this would name between.

**It also removes the reason to hand-walk a lifecycle.** An adopting repository was invoking `move`
once per edge, six calls, for an audit trail the tool does not require — and then proposed a
`--through` flag to make the tool do the same thing in one call, *"recording every intermediate
transition in the ledger exactly as six invocations would"*. That flag is refused here and the
refusal is the point: it would have the tool append events for transitions nobody performed, which
is manufacturing the record. [The ledger is the
record](../../decisions/the-ledger-is-the-record-and-everything-else-is-a-projection.md) rules it
out. Naming what was skipped is true; writing it down as though it happened is not.

# What this must not become

**A refusal.** Whether a jump is acceptable is policy, and this change adds no opinion about it.
The exit code stays `0` and the transition is recorded.

**A second event kind.** Nothing is appended but the transition that was asked for. What was
skipped is derivable from the line already there, which is why it is a rendering and not a record.

**A prompt.** *Did you mean review?* would be a question with no answer the tool could check, asked
at a terminal and hanging in a pipeline. The line is printed after the move, and the remedy for a
wrong one is the move that goes back — which the lifecycle already allows and already names.
