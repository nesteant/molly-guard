---
title: A roadmap is a slice of planned work
lang: en
part: plan
---

# How it will be built

Three things change and the area's shape is not one of them. `roadmap/` stays flat — one `.md` per
slice — because nothing the tool reads needs a folder, and a folder would imply per-feature ids the
tool would then be expected to resolve.

## 1. The template, which is the shape

`templates.ts` gains a roadmap body that is a plan rather than a note. The headings are the
contract between what `molly roadmap new` writes and what the skill knows how to read:

```
# What this slice is for          the business need, in the terms whoever asked for it used
# The features, in order          each one: what it is, and why it sits where it sits
# What has been decided           choices already made, so they are not relitigated per change
# What is done                    features realised, and by which change
```

They are a starting point and not a schema. A slice that deletes a heading is still a slice, and
nothing reports it — the tool has no opinion about a body, and a template that became a checked
structure would be `core-never-parses-a-body` broken through the writing door instead of the
reading one.

The headings are English while the prose under them is written in `lang:`, exactly as every other
template already is.

## 2. The skill, which is the reader

A fifth entry in `SKILLS` — `scaffoldFor` already derives a skill file per root and a command file
per tool from that list, so one entry generates everything and `--check` covers it.

`molly-roadmap`, described so a model loads it when asked to plan or to draft the next thing rather
than only when the word roadmap appears. What it teaches:

- **Where the plan is.** `molly status` lists the slices; each is one file; read the whole file,
  because the order is stated in it and not derivable from anything else.
- **How to find what is next.** The first feature under *the features, in order* that is not under
  *what is done* and is not claimed by a change in flight. Cross-checking against `molly status`
  matters: a change already drafted against a feature is the common reason the next one is not the
  first one.
- **How to turn it into a change.** `molly change new "<title>" --capability <c> --realises
  <slice>`, one claim per change, with `--alters` for the documents it changes. The title comes
  from the feature, not from the slice — a change named after a body of work is a change making
  several claims.
- **What it may never do.** Never invent a feature the slice does not name; if what was asked is
  not in the plan, say so and offer to add it. Never reorder or reprioritise unasked — the order is
  somebody's judgement and rewriting it silently is the same failure as rewriting a reference.
  Never mark a feature done that has not published.
- **How the plan is kept true.** No change alters a slice, so the slice is edited directly — moving
  a feature into *what is done*, naming the change that did it, is a normal edit and wants no
  ceremony.

The existing skills gain a pointer, not a copy: `molly-new` says to read the slice before drafting.

## 3. The command, which loses a flag

`molly roadmap new` stops taking `--capability`, and `bin.ts`'s `FLAGS` table drops it, so passing
it is refused by name rather than ignored. `readRoadmap` stops reading the field, `status` stops
rendering it, and a slice carrying one is reported by the scan — reported and not failed, as
everything about this area is.

## What it inherits

`--realises <slice>` is a value the corpus can enumerate, so
`0016-a-command-that-needs-a-choice-offers-it` makes it a choice offered rather than a refusal
printed. Neither change blocks the other: whichever lands second picks the other up for free.

## What is deliberately not built

**No `order:` or `priority:` frontmatter.** They were in the first draft of this plan and are the
thing being reversed. See `change.md`.

**No `molly roadmap show`.** With the plan in one file, `show` would be `cat` with a border on it.

**No migration command.** The seven entries are reshaped by hand, once, in one diff — the grouping
is a judgement, and a converter would have to guess it.

# What this constrains afterwards

**The template and the skill must be changed together.** They are two halves of one agreement about
a shape, and neither is checked against the other by anything — which is the cost of keeping the
body unparsed, and is worth stating plainly rather than discovering. Whoever edits one edits both.

**A slice never gains a lifecycle.** No `state:`, nothing in the ledger, no `molly move`. Planning
that can be advanced is planning somebody advances instead of writing the change.

**The tool will not learn to sort a plan.** Not order, not priority, not dependencies, not
estimates or assignees or dates. Each is defensible alone and their sum is the backlog manager this
area's own command already refused to become. What makes the plan legible is the shape and the
skill; if that stops working the answer is a better shape, not a schema.
