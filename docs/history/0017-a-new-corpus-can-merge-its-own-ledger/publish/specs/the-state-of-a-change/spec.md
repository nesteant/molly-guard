---
title: The state of a change
lang: en
capability: the-change-flow
---

# Eight states, one of them terminal

A change has a state. It is recorded in an append-only ledger, projected into the change
document so a reader can see it without running anything, and checked in both directions.

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

Two refusals are about the *argument* rather than the order: a state that does not exist, which
names all eight, and a change that does not exist, which points at the picker. Neither is a move
any policy would want recorded.

A third is about neither. The **terminal state may not be recorded by a move**, because reaching
it is a write into the knowledge base performed by `molly publish` — a line saying a change was
published, appended by a command that published nothing, is the ledger stating something that
did not happen. Declining to assert what it did not do is not the same as having an opinion
about what ought to happen next.

# The record and the projection

The ledger is the record: one JSON line per event, appended, never rewritten. **Creation is an
event too**, so the first state is backed by a line like every later one rather than by the
absence of them — and a bundle the ledger has never heard of becomes a signal rather than the
normal case. Events carry a `kind`, which is what a rename will hang off later: a rename is not
a transition and must not be folded as one.

**Append-only is what makes it mergeable, and `molly init` writes the line that makes git agree.**
Two branches that each advanced a change have both appended at the end of the same file, and git
cannot know that both additions are wanted — so without help the first parallel branch conflicts,
in the one file every generated skill says never to hand-edit. The corpus is born carrying:

```
<root>/.gitattributes     .mollyguard/history.jsonl merge=union
```

**Inside the corpus, not at the repository root.** Git reads a `.gitattributes` in any directory
and applies it to that directory and below, so the pattern is relative to the corpus and one
string is correct for every `root:`. It also keeps this the tool's own file: the tool writes two
kinds of thing outside a corpus and there is no third, and a repository-root `.gitattributes`
would have been the third — small, defensible alone, and inside a file that belongs to the
project.

**Union merge is correct here and nowhere else**, which is why the pattern names one file rather
than a directory. It keeps both sides, and that is only ever right for a file whose lines are
independent facts and whose order carries no meaning beyond *this happened*. Two edits to a
specification are a disagreement somebody has to resolve; keeping both would be the wrong answer,
so a document still conflicts and is meant to.

A `.gitattributes` that was already there is **left byte-identical and reported**: if it does not
carry the pattern, the run names the line to add and still exits `0`. Repairing somebody's git
configuration unasked is the write this tool exists to prevent, and a corpus that will conflict
later is not a failed initialisation.

The change document carries `state:` in its frontmatter, and that is a **projection** of the
ledger, not a second answer to the same question. Only the entry carries it; the other three
documents of a bundle have none.

The distinction is that a projection can be checked against its source, and it is — before every
move and on every `status`. A `state:` that disagrees with the fold is reported by name, and a
change whose document disagrees cannot be moved until the two are reconciled. Hand-editing that
field is the obvious way to bypass the lifecycle, so it is the case that has to be caught rather
than the case that is assumed not to happen.

A change the ledger has no record of at all — written by hand, or a folder renamed with `mv`,
which orphans everything recorded under the old name — is **reported rather than refused**. A
corpus that predates the field is not broken.

# Moving

`molly move` takes a change and a state, and either may be left out — what is missing is chosen
from a list.

```
molly move                    pick a change, then a state
molly move <change>           pick a state
molly move <change> <state>   no prompt
```

The lists are produced by pure functions, and a slice may filter them. **A filter may narrow a
list and may never widen one:** anything it returns that was not offered is dropped, so no
extension can present an edge the table does not have. That rule is where sequence enforcement
will live once a slice can supply it.

The order within a list is the useful part: the next state first, then the rest forwards, then
the ones that go back. Sorted by name, `approved` would sit above `draft` and the common case
would be the hardest to find. The state a change is already in is never offered. Leaving the
terminal state is offered — it is not a dead end, only a state a move may not *enter* — and it
is offered from nowhere else, because a list holding something that will be refused teaches the
wrong thing.

Where nothing is reading input the command **refuses rather than waits**, and the refusal
carries what the prompt would have offered. A prompt in a pipeline blocks until the job is
killed, and the output says nothing about why.

**Moving to the state a change is already in exits 0 and appends nothing.** Re-running a
pipeline step that already happened must not fail a build, nor inflate the audit trail.

# Who did it

Every transition records who made it, read from `git config`. Where that cannot be determined
the answer is the literal `unknown` — an identity is never inferred from the operating system
user or anything else. A ledger that attributes a transition to somebody who did not make it is
worse than one that admits it does not know.

# Why it is arranged this way

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

**Because a name is not derivable from a title.** A change created with `--name` bears no
resemblance to what it is called, so before the picker existed the only place a name was ever
printed was inside a refusal: you had to run the command wrong to learn how to run it right.

**Because "no events" and "just created" would otherwise be the same observation.** Folding
answers `draft` for both, so a folder renamed outside the tool would silently reset its change
and the refusal that followed would state the wrong state with full confidence. Recording
creation separates them, and the disagreement surfaces twice over — once as an unrecorded
bundle, once as a document whose `state:` no longer matches the fold.

# What is not here

**Nothing enforces the order.** The seam that would — a hook at the transition point answering
pass, refuse or defer — is not built, so until it is, the tool records whatever it is told. The
cost is stated rather than hidden, and the absence is asserted rather than left as the state of
things nothing happens to check.
