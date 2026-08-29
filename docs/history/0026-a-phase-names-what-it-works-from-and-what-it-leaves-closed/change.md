---
title: A phase names what it works from and what it leaves closed
lang: en
kind: feature
capability: the-corpus
realises: what-mollyguard-still-owes
state: published
alters:
  - specs/agent-instructions
---

Written for somebody deciding whether this should happen, who will not open the codebase and
does not know this corpus exists. A sentence belongs here only if the decision changes when it
stops being true; one that changes only *how* the work is done belongs in `plan.md` — moved
there, not dropped.

# What this change makes true

**The instructions say which documents a phase of a change works from, and which it leaves
closed.** Today they say only what to write. What to open is left to whatever an agent finds,
and three things it finds are wrong to open:

- **The archive.** `history/` is sealed against editing and against re-checking, and nothing
  anywhere says it is not read. Reading it is how a retired shape gets copied forward.
- **The knowledge base, a second time.** It is read while a change is drafted, which is when it
  binds. An implementation that reopens it to decide what to build is deciding again, against a
  document nobody re-approved.
- **The payload, early.** `publish/` is written when the work is done. A task list that
  instructs it during implementation moves the writing into the phase that cannot yet know
  what it says.

Three instances of one rule, and the rule is that a document belongs to a phase.

# Why

**Reading is the one thing none of these instructions bound, and it is the one that is silent.**
Every rule the corpus states fires in front of somebody writing — a document replaced whole, a
correction routed through `publish/`, frontmatter as a closed list. A read leaves no artefact,
fails no check, and produces work that looks *better* for having been informed by it. So the
cheapest thing for an agent to do is find the nearest prose of the right shape, and in a corpus
that archives every change it has ever published, the nearest prose of the right shape is a
retired one.

**Both halves of this arrived as evidence rather than as an argument.** In the first adopting
repository, an agent swept `history/*/tasks.md` to answer "where did this pattern come from" —
in the session that was auditing for exactly this class of defect. The report's own method was
the thing the report existed to catch, and the agent breaking the rule was looking directly at
it and reading it as thoroughness. Separately, **all eleven** of that repository's open changes
carried a task instructing the payload be written during implementation, drafted across separate
planning sessions; the earliest forced a real workaround, a payload document reworded to name no
path so it would get past a check that `publish/` existing had switched on weeks early.

Neither is one session's mistake that a person caught for free, which is the test this corpus
applies to a proposal before believing it. The first is a rule breached by the session enforcing
it. The second is eleven independent sessions producing the same artefact, because the artefact
was the only thing between two skills that were each unambiguous and neither of which owned it.

**What it costs to do is four lines and one cap.** Nothing is checked, nothing is refused,
nothing new is parsed. The instructions gain a boundary they did not have; the reference skill
grows past a cap that was set when every line in it was a rule about writing.

**What it costs not to do is the corpus's own premise.** A corpus is a claim that what you are
reading is what is true. An agent reading an archived change is reading something that was true,
presented by the corpus itself, with nothing on it saying which. That is the failure this
product exists to prevent, arriving through the corpus instead of around it.

# What is not settled

Nothing.

The question this change had to answer before it could be written was what an implementation
does when the plan turns out to be wrong, and the corpus already answers it in two halves. A
change not yet published moves **back** — `molly move <change> draft`, which the instructions
already call how work reopens — and the documents are rewritten there, where they can be
re-approved. A *published* specification found wrong is a **new change**, because one claim per
change and the claim has moved. Neither is a new mechanism, and this change states the pair
rather than inventing either.
