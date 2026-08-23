---
title: A name can change without losing what points at it
lang: en
capability: the-corpus
---

# What is meant to be true later

**A document can be renamed, and every reference to it keeps resolving — including one sealed
inside an archived bundle.**

## In order

**1. The orphan check, which is the correctness.** A ledger node with no document and no
`renamed_to` is reported by `status` and by `move`; folding a node with no events, where a
same-titled orphan exists, says so rather than quietly answering `draft`.

Half of this is built: a bundle the ledger has never heard of is reported, and its `state:`
disagrees with the fold, so `mv` trips two independent signals. The other half is silent —
everything recorded under the *old* name is orphaned, `stateOf` answers `draft` with full
confidence, and the next refusal states that wrong state as a fact.

**This corpus has one right now.** The ledger holds fourteen nodes and thirteen changes exist;
`changes/0010-a-commit-names-its-change` was the `MollyGuard:` trailer work, removed by hand when
that idea was dropped. Its events are still in `history.jsonl`, no bundle exists in `changes/` or
`history/`, and `molly status` exits `0` without mentioning it.

Roughly fifteen lines, with a live case to test against.

**2. `molly rename <id> <new-name>`, which is the convenience.** Moves the directory or file and
appends one line:

```json
{"node":"changes/before","at":"…","renamed_to":"changes/after","by":"human"}
```

**Nothing prior is rewritten**, and that is structural rather than lazy. `history/` is immutable,
so a reference inside an archived bundle can never be rewritten and any rename would dangle by
construction. And rewriting an `alters:` line moves that change's content hash, which would
un-approve every change in flight against a specification somebody merely tidied — a tidying
operation must not invalidate somebody else's review.

So references resolve *through* the chain: `stateOf` follows it forward and every state before the
rename is still counted. Identity stays single-valued at every instant — exactly one path names
the document, and the log says how it got there.

Refusals it needs: the new name is taken (refuse before moving anything, because a half-applied
rename leaves two partial documents and no way to tell which is current); the new name is not a
usable slug; renaming to its current name is a no-op that exits `0`; the document does not exist,
and the refusal lists what does.

## What holds a reference to a name

Only the first two exist today. The rest are listed because the resolution rule has to be designed
for all of them at once — one that handles the present set and not the eventual one gets rewritten
rather than extended.

| holder | reference | status |
| --- | --- | --- |
| `history.jsonl` | `node` on every event | built |
| the filesystem | the directory or file name itself | built |
| a change's frontmatter | `alters: [specs/…, decisions/…]` | built, unresolved |
| a change's frontmatter | `capability:` | built, resolved |
| a spec's frontmatter | `capability:` | planned |
| a decision | `from: <change>` | planned |
| an archived bundle | everything above, **frozen** | planned |
| the verdict ledger | node plus content hash | planned |
| a roadmap entry | what realised it | planned |

# Why it is not a change yet

Step 1 is unblocked and worth doing on its own — possibly *instead* of step 2 for now, because
`mv` will always be available, so the orphan case has to be visible rather than prevented.

Open in 2: **does a rename need a reason** — a change that is `approved` or later was read under
its old name, and recording why is nearly free. **Does `show` print the current name** for an aged
reference, or are references left to age visibly. **Renaming a capability** moves every
`capability:` pointing at it at once, and is the rename most likely to be wanted, because
capability boundaries are the least stable thing in a corpus.

# Deliberately not doing

**An explicit `id:` in frontmatter.** It makes identity a field that can disagree with the path,
moves uniqueness from the filesystem into a check we would own, and stops a ledger entry from
pointing at anything resolvable without scanning every document.

**A tracker number as identity.** A change with no ticket then has no identity, two changes for one
ticket collide, and a tracker migration dangles every reference. The ticket is a *reference* — see
`a-capability-can-retire-and-a-concern-can-cross-one`.
