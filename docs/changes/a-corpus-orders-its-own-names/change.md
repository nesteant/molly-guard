---
title: A corpus orders its own names
lang: en
kind: feature
capability: the-corpus
state: draft
alters:
  - specs/creating-a-change
---

# What this change makes true

**A corpus may say what shape its names have, and the tool allocates them.** A pattern in
`mollyguard.yml` — `changes: '{ordinal:4}-{slug}'` — makes `molly change new "Sign in with Entra
ID"` produce `0001-sign-in-with-entra-id` rather than `sign-in-with-entra-id`, with the number
chosen by the tool. An area that declares no pattern keeps exactly the names it has today, and
`--name` still overrides everywhere.

**A number is never reused, and "taken" is a wider question than "what is on disk".** Three
places are asked: the area, its archive, and the transition ledger. The last is the one that
matters — a change created and deleted by hand leaves no directory anywhere and a `created` line
for ever, and reusing its number would file two different pieces of work under one id in the
record whose whole value is being readable back.

**`mollyguard.yml` is read.** It was written by `molly init` and then never opened again: its
`lang:` was documentation for whoever looked. A pattern is the first thing in it the tool acts
on, so this is also where the file stops being decoration — and the second thing follows
immediately, because a corpus that declared `lang: uk` was still getting documents that said
`lang: en`.

# Why

The allocation is the part a person cannot do reliably, and it is the part they were doing. A
repository that wants ordered names reads `ls docs/changes`, takes the next number and passes
`--name` — which is a race between two people drafting on one afternoon, and a memory test for
whoever does it from memory instead. Neither failure announces itself: a duplicate ordinal is two
directories that sort next to each other and look like a pair.

Nothing detected it, either, and nothing could. The rule lived in a paragraph of somebody's
`CLAUDE.md` telling an agent to take the next number *by looking, never by memory* — which is
prose, and prose refuses nothing. This makes it something the tool cannot get wrong instead of
something a reader has to be persuaded by.

**The tool still has no opinion about whether to.** That is the line this change is careful
about: a corpus that declares no `naming:` is unchanged in every respect, and the commented block
`molly init` now writes is an offer rather than a default. Ordering is a house style, and the
argument for the tool owning it is only that the *allocation* is mechanical — not that ordered
names are better.

What this does not do is renumber anything. A corpus adopting a pattern keeps every name it
already minted, because `matchName` reads back only what the pattern would have produced and
counts nothing else — a scan that refused the corpus's own history could not read the directory
it is meant to be counting.

Filed against `specs/creating-a-change`, whose *The name* section states that a directory name is
minted from the title and that `--name` overrides it. That stays true and gains a third answer
between them: the corpus's own pattern. `the-plan-and-the-corpus-agree` alters the same document,
so whichever of the two publishes second carries the other's wording as well — a specification is
replaced whole, and there is no delta format to merge two edits with.
