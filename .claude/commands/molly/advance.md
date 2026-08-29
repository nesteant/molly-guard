---
description: Move a change to its next state - approve, start, implement, verify, deploy
disable-model-invocation: true
---

# Advance a change

`mollyguard.yml` sits at the top of the repository and names the corpus directory —
`docs/` unless it says otherwise, and is found from anywhere inside. Paths below assume that.

1. `molly status` to see where it is, and whether anything disagrees with the ledger.
2. `molly move <change> <state>`, choosing the next state in the sequence unless told otherwise:

```
draft → review → approved → in_progress → implemented → verified → deployed
```

Backwards is allowed and is how work reopens. Never hand-write `state:` in a document — the
command writes it, and a document disagreeing with the ledger is refused.

A change whose `change.md` still holds a question under *What is not settled* is not one to
approve. Nothing refuses the move; the answer is written into the document it belongs in first.

**Implementation works from the change's own four documents.** The knowledge base was read while
it was drafted and `plan.md` is what that produced. A plan that turns out to be wrong is not
edited from inside the work: move the change back, rewrite it there, move it forward again. A
*published* specification found wrong is a new change.

The terminal state is not reachable this way. When the work is done and the documents are
written, publish instead.
