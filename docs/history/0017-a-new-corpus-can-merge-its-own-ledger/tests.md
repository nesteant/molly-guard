---
title: A new corpus can merge its own ledger
lang: en
part: tests
---

# What will prove it

**The assertion that matters is a real merge**, not the presence of a file. A pattern written to
the wrong path, or relative to the wrong directory, produces a `.gitattributes` that looks right
and does nothing — which is the failure mode this change exists to remove, one level up.

```
git init; molly init
two branches, one `molly move` each, then `git merge`
```

- exits `0`, and the ledger holds **both** events
- no conflict markers in `docs/.mollyguard/history.jsonl`
- asserted in a corpus at `--root kb` as well, because a pattern relative to the repository root
  rather than the corpus root passes the first test and fails this one

## The file

- `molly init` writes `docs/.gitattributes` containing `.mollyguard/history.jsonl merge=union`.
- Nothing is written at the repository root. The existing assertion that `molly init` writes only
  its own must still pass, with `.gitattributes` counted as the corpus's rather than a third kind.
- A corpus at `--root kb` puts it at `kb/.gitattributes`, and the pattern is unchanged — it is
  relative to the file, which is what makes one string correct for every root.

## When it is already there

- A `docs/.gitattributes` written by somebody else is **left byte-identical** and reported in the
  already-here block.
- When it does not carry the ledger pattern, the run prints the line to add and still exits `0`:
  a corpus that will conflict later is not a failed initialisation.
- When it does carry it, nothing is printed about it — a tool that remarks on the correct case
  trains people to skim.

## What must not have changed

- Union merge applies to the ledger and to nothing else: a specification edited on two branches
  still conflicts, and that is asserted rather than assumed.
