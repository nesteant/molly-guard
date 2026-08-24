---
title: A new corpus can merge its own ledger
lang: en
kind: feature
capability: the-change-flow
realises: what-mollyguard-still-owes
state: published
alters:
  - specs/the-state-of-a-change
---

# What this change makes true

**`molly init` writes `<root>/.gitattributes`, giving the ledger it just created the union merge
it cannot work without.**

```
docs/.gitattributes     .mollyguard/history.jsonl merge=union
```

**Inside the corpus, not at the repository root.** Git reads a `.gitattributes` in any directory
and applies it to that directory and below, so a corpus at `kb/` gets `kb/.gitattributes` and the
pattern stays relative to it. That is what makes this the tool's own file rather than a third kind
of thing written into somebody's repository — see below.

**A file already there is left alone, and the missing line is reported.** If `<root>/.gitattributes`
exists, `molly init` does not touch it: it says whether the ledger line is present and, if not,
prints the line to add. Repairing somebody's git configuration silently is the write this tool
exists to prevent.

# Why

Two branches that each advance a change have both appended at the end of `history.jsonl`, and git
cannot know that both additions are wanted. Without the line that is a conflict on the first
parallel branch — in the one file every generated skill says never to hand-edit.

It is reproducible in a minute and was, on a clean repository: two branches, one `molly move` each,
then `git merge` leaves conflict markers in the ledger and a user with no safe way to resolve them.
The remedy is one line and is undiscoverable: nobody guesses `merge=union` from a conflict.

**Union merge is only ever correct for a file whose lines are independent facts and whose order
carries no meaning beyond *this happened*.** That is exactly this ledger, and it is why nothing
else in the corpus gets the treatment: two edits to a specification are a disagreement somebody
has to resolve, and silently keeping both would be the wrong answer.

**Why inside the corpus is not a detail.** `decisions/the-tool-writes-only-what-it-owns` permits
exactly two kinds of file outside the corpus — `mollyguard.yml`, and the `molly`-namespaced skills
— and says there is no third. A `.gitattributes` at the repository root would have been the third,
and it is precisely the shape that decision warns about: small, defensible on its own, and inside
a file that belongs to the project. Putting it under the corpus root keeps every byte this tool
writes either in the corpus or on the named list, moves it with the corpus if `root:` changes, and
means removing MollyGuard is still deleting a directory.

This repository has had the line since the ledger's first conflict, at the repository root and
written by hand. So the cost has been invisible here and paid entirely by every corpus made
somewhere else — which is the definition of a defect worth releasing for.
