---
title: Changing state of specification
lang: en
kind: feature
capability: the-change-flow
state: published
alters: []
---

# What this change makes true

A change has a state. It is recorded in an append-only ledger, projected into the change
document so a reader can see it without running anything, and checked in both directions.
Eight states, one of them terminal.

```
draft → review → approved → in_progress → implemented → verified → deployed → published
```

| state | means |
| --- | --- |
| `draft` | being written. Where a change starts |
| `review` | submitted, and someone else is reading it |
| `approved` | accepted. Work may begin |
| `in_progress` | the work has started |
| `implemented` | the work is done |
| `verified` | the evidence held |
| `deployed` | it is live |
| `published` | folded into the knowledge base. Terminal |

**The sequence is an order, not a set of permitted edges.** Any state may follow any other, and
`molly move` records what it is told. What a move *requires* — a design present, a task claimed,
evidence that held, or simply that states are not skipped — is policy, and policy belongs to a
slice or to whatever orchestrates the work.

That leaves the sequence doing real work without refusing anything. It says which state follows
which, so the picker offers the obvious one first. And it says whether a move went forwards or
back, **derived from position rather than declared per edge**, which is what keeps the direction
true for a move that skips three states at once — something a table of permitted edges could not
describe without enumerating it.

Two refusals are about the *argument* rather than the order: a state that does not exist, and a
change that does not exist. Neither is a move any policy would want recorded.

A third is about neither. The **terminal state may not be recorded by a move**, because reaching
it is a write into the knowledge base performed by `molly publish` — a line saying a change was
published, appended by a command that published nothing, is the ledger stating something that
did not happen. Declining to assert what it did not do is not the same as having an opinion
about what ought to happen next.

## The record and the projection

The ledger is the record: one JSON line per event, appended, never rewritten. **Creation is an
event too**, so the first state is backed by a line like every later one rather than by the
absence of them — and a bundle the ledger has never heard of becomes a signal rather than the
normal case. Events carry a `kind`, which is what a rename will hang off later: a rename is not
a transition and must not be folded as one. The
change document carries `state:` in its frontmatter, and that is a **projection** of the
ledger, not a second answer to the same question.

The distinction is that a projection can be checked against its source, and it is — before
every move and on every `status`. A `state:` that disagrees with the fold is reported by name,
and a change whose document disagrees cannot be moved until the two are reconciled. Hand
editing that field is the obvious way to bypass the lifecycle, so it is the case that has to
be caught rather than the case that is assumed not to happen.

## Picking rather than typing

`molly move` takes a change and a state, and either may be left out — what is missing is
chosen from a list.

```
molly move                    pick a change, then a state
molly move <change>           pick a state
molly move <change> <state>   no prompt
```

The lists are produced by pure functions, and a slice may filter them. **A filter may narrow a
list and may never widen one:** anything it returns that was not offered is dropped, so no
extension can present an edge the table does not have.

Where nothing is reading input the command **refuses rather than waits**, and the refusal
carries what the prompt would have offered.

## Who did it

Every transition records who made it, read from `git config`. Where that cannot be determined
the answer is the literal `unknown` — an identity is never inferred from the operating system
user or anything else.

Three behaviours that are part of the claim and are not obvious:

- **Moving to the state a change is already in exits 0 and appends nothing.** Re-running a
  pipeline step that already happened must not fail a build, nor inflate the audit trail.
- **`published` is not entered by moving.** `molly publish` is what reaches it, and a move that
  named it is refused and points there. Leaving it does not arise: a published change has been
  archived, so no command in flight can find it. A description of an order cannot answer for a
  write it does not perform, so it does not try — it declines to record one instead.
- **A change the ledger has no record of is reported** — written by hand, or a folder renamed
  with `mv`, which orphans everything recorded under the old name. Reported rather than
  refused: a corpus that predates the field is not broken.

# Why

**Because the knowledge base says what is true of the product, and a requirement is not true
until it is running.** That is why `deployed` sits between `verified` and `published`. A change
that passed its tests will probably work; a change that is deployed is one the product actually
does. Publishing earlier would put an intention into accumulated truth.

**Because a corpus is reviewed as files.** A state that lived only in the ledger would mean a
pull request advancing a change shows one appended JSON line while the change document itself
looks untouched — backwards for a tool whose premise is that the corpus is readable. The
projection is what makes the state visible where the reviewer is already looking.

**Because the projection must never become a second source of truth.** Two places holding one
fact eventually disagree, and the failure is silent unless something compares them. So the
ledger is authoritative, the field is derived, and the comparison is not optional.

**Because a tool that owns the process cannot be extended into one.** An engine that decides
which moves are legal has already made the decision every team would want to make differently —
how many states of review, whether a hotfix may skip approval, who is allowed to send work back.
Holding only the vocabulary and the record leaves all of that to a slice, and leaves the engine
with one job it can do correctly for everybody.

The cost is stated plainly rather than hidden: **nothing enforces the order today.** The seam
that would — a hook at the transition point answering pass, refuse or defer — is not built, so
until it is, the tool records whatever it is told.

**Because a name is not derivable from a title.** A change created with `--name` bears no
resemblance to what it is called, so before the picker existed the only place a name was ever
printed was inside a refusal: you had to run the command wrong to learn how to run it right.

**Because "no events" and "just created" were the same observation.** Folding answered `draft`
for both, so a folder renamed outside the tool silently reset its change and the refusal that
followed stated the wrong state with full confidence. Recording creation separates them, and
the disagreement now surfaces twice over — once as an unrecorded bundle, once as a document
whose `state:` no longer matches the fold.

**Because refusing well is most of the value, where refusing is the engine's business at all.**
`"epic" is not a state` names the eight; `no change named "x"` lists what there is and points at
the picker. Those are refusals about a mistake, and they say what to type instead.
