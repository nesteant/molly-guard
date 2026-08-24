---
title: The roadmap can be planned against
lang: en
---

# What this slice is for

**Somebody can open the roadmap and see what to do next without reading all of it, and see what is
already being done.** Today neither is true, and this entry exists because the area was used for
the first time and did not do a roadmap's job.

## What the first real use found

The whole plan was migrated in, one file per topic, and it came out at sixteen entries and roughly
five thousand words. `molly status` rendered them as a 625-character alphabetical list of slugs.
Answering *what should I build next* meant opening sixteen files and reconstructing an order that
existed only in prose. The entries have since been consolidated to seven feature-sized ones, which
fixes the reading cost and none of the following.

# The features, in order

## 1. Progress, which needs no new field — still open

`molly status` already knows both halves and joins only one of them. It reports a roadmap entry
realised by a change that has **published** and is still sitting there — and says nothing about an
entry a change is working on *right now*, although an in-flight bundle carrying `realises:` is
exactly that fact, already recorded, already read.

So an entry nobody has started and an entry halfway through implementation render identically. The
join is the same shape as the one already written; it is the filter that is wrong.

An entry then reads as **open**, **in progress** — naming the change and the state folded from the
ledger — or **realised, retire it**. Nothing new is declared and nothing is stored; it is a
projection of two things the corpus already holds, which is the only kind of derived answer this
codebase permits.

## 2. Ordering and dependency — answered, and not the way this proposed

`molly roadmap new` states its stance plainly: *it models a note, not a backlog — no `needs:`, no
ordering between entries, nothing that computes what may be started.* The reasoning was that
planning is somebody else's tool and what MollyGuard owns is that the plan and the knowledge base
cannot silently disagree.

Using it found the cost. Every entry here has a *Why it is not a change yet* section that says what
has to land first, in prose, in English, where nothing can read it: `the-knowledge-base-can-be-read`
gates `a-move-can-be-refused-on-its-merits`; step 2 of `the-ledger-s-role-is-settled-and-it-stays-bounded`
gates on step 1 answering *keep it*. A dependency nothing can read is one that goes stale exactly
the way a hand-written table of contents does — which is the argument this codebase makes
everywhere else.

The narrow form, if it is done: **`needs: [<entry>, …]`, resolved like every other reference** — an
entry naming one that is not there is reported, a cycle is refused, and `molly status` orders what
is ready before what is waiting. That is a scalar array, so it does not give up the frontmatter
rule that documents may not carry structure their prose contradicts.

**What it must not become**: estimates, assignees, priorities, percent-complete, or anything that
computes a schedule. Those make it a planning tool competing with the ones a team already has, and
the entry stops being a record.

## Why none of it is a change yet

Part 1 is unblocked, small, and worth doing on its own — it is a filter change and a rendering, and
it makes the plan honest about what is underway without adding a field anybody has to maintain.

Part 2 reverses a stated design decision, so it wants a decision rather than an implementation
first: whether ordering is the corpus's business at all, or whether the prose is enough and the
staleness is acceptable. The argument for reopening is that the alternative was tried here and the
order silently lived in a file that has since been deleted.

# What has been decided

Nothing beyond what the features state above.

# What is done

**Part 2 — the shape a plan is read in.** `changes/0015-a-roadmap-is-a-slice-of-planned-work`,
published. It reversed the expensive half of what this entry proposed: the roadmap holds slices
rather than one note per idea, `molly roadmap new` writes the four headings a plan needs, and the
`molly-roadmap` skill teaches an agent to read one and draft the next change from it. There is no
`order:` and no `priority:` — the ordering stays an argument in prose and the reader that acts on
it is a model, which holds `core-never-parses-a-body` exactly as written.

**Part 1 — progress from what is already recorded — is not done.** `molly status` still joins a
slice only to changes that have *published*; a change in flight carrying `realises:` is read and
discarded, so a slice nobody has started and one halfway through render identically. What did
change is the wording: the finding names every change published against a slice and asks whether
the plan is current, instead of telling somebody to retire a plan with features left in it.
