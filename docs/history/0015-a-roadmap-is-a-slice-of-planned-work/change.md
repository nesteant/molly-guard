---
title: A roadmap is a slice of planned work
lang: en
kind: feature
capability: the-corpus
realises: the-roadmap-can-be-planned-against
state: published
alters:
  - specs/planning-what-is-not-a-change-yet
  - specs/agent-instructions
---

# What this change makes true

**A roadmap document is a slice of planned work: one file describing a body of work, the features
in it, the order they are wanted in, what has been decided about them, and what is already done.**
It replaces one-note-per-idea, which is what the area held until now.

**The tool writes the shape and teaches the shape, and never reads it.** Two halves that must both
be true and must stay separate:

- **`molly roadmap new` writes a slice in that shape** — a template with the headings a plan needs,
  so a slice is born readable instead of each author inventing a layout.
- **A `molly-roadmap` skill teaches an agent to read one and generate a change from it** — where
  the plan lives, how to find what is next in it, how to turn that into
  `molly change new --realises <slice>`, and what it may never do to somebody's plan.

Nothing between those two is parsed. There is no `order:` field, no `priority:` field, no sorting,
no computed *what is next*. The order is prose, the priority is prose, the decisions are prose —
and the reader that acts on them is a model, which is the one reader that can read prose. The tool
contributes the shape and the vocabulary, which is what makes the prose consistent enough to be
read reliably.

**A slice is not filed under a capability.** A capability answers *what is the product responsible
for*; a slice answers *what body of work are we planning*. The axes are independent and a slice is
expected to cross several capabilities — that is the shape a business need arrives in. `molly
roadmap new` stops taking `--capability`, and a slice carrying one is reported by the scan.

**Two slices may describe overlapping work, and nothing refuses it.** Isolation is a decision about
how work is managed, not a constraint the corpus enforces.

**A change still realises a slice, and the finding is reworded.** `molly status` cannot know
whether a slice is finished, because completeness is prose — so instead of telling somebody to
retire an entry the moment one change publishes, it names the changes that have published against
the slice and asks whether the plan is still current. A slice outliving several changes is the
normal case now.

# Why

The roadmap area was used for the first time and did not do a roadmap's job.

The entire plan for this product was migrated into it: sixteen notes, five thousand words, and a
`molly status` line that was 625 characters of alphabetical slugs. Answering *what should I build
next* meant opening sixteen files and reconstructing an order that existed nowhere. Consolidating
to seven fixed the reading cost and nothing else — the ordering, the priorities and the reasoning
about what had to land first were still scattered across seven documents with no stated shape, so
the only way to plan was to read all of them.

**The first design of this change got it wrong in the expensive direction.** It proposed making the
slice a folder and moving order and priority into frontmatter, so the tool could sort. That buys a
sorted list and pays for it with a schema every corpus has to maintain, a second place for the plan
to live, and the beginning of the backlog-manager this tool has already refused to become — and it
answers a question nobody has: nothing was blocked on the tool being able to sort a plan.

What was actually blocked is an agent being asked *draft the next change* and having no reliable
way to find out what next means. That is not a parsing problem. It is an instruction problem, and
this repository already has the seam for it: the skills are how an agent is taught, they are
generated, they are checked by `--check`, and they hold no corpus content — so a skill teaching how
to read a plan can never go stale against the plan it describes.

**Prose is the right medium and the model is the right reader.** A plan's real content is what has
to land first and why, which is an argument, not a number. Reducing it to `order: 30` throws away
the sentence that made it thirty. Keeping the sentence and teaching a model to read it keeps both,
and holds `core-never-parses-a-body` exactly as written — the engine reads nothing, and the reader
that does is not the engine.

What this narrows, knowingly: an entry is no longer the cheapest possible note. A loose thought now
belongs in a slice, beside the work it competes with. That is accepted, because a note with nothing
to be ordered against is how the area filled up with sixteen of them.
