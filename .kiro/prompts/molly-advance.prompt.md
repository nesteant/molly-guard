---
description: Move a change to its next state - approve, start, implement, verify, deploy
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

The terminal state is not reachable this way. When the work is done and the documents are
written, publish instead.
