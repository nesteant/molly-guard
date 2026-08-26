# changes/

Work in flight. This is the directory you edit.

One folder per change, and four documents in it: `change.md` says what this change makes true
and why, `plan.md` how it will be built, `tasks.md` the work in order, and `tests.md` what
will prove it. Only `change.md` carries a frontmatter record — a title repeated in four files
is a title that disagrees with itself by the end of the week.

**Each is written for a different reader, and the reader is what settles where a sentence goes** —
`change.md` for somebody deciding whether the work should happen at all, who will not open the
codebase; `plan.md` for whoever will build it; `tasks.md` for whoever picks it up part-done;
`tests.md` for whoever has to believe the claim afterwards. A subject is something a writer
classifies and a reader is something they can ask, which is why the documents say who theirs is.
A sentence that fails one document's reader belongs to another's; it is moved, not dropped.

**They state what is in force, not how they came to say it.** A change corrected later is
rewritten as though it had always said the new thing — git and the ledger hold the history, and a
document that holds it too gives a reviewer two accounts and no way to choose.

A change has a state, in this sequence:

```
draft → review → approved → in_progress → implemented → verified → deployed → published
```

`molly move` records a move; run it with no arguments and it asks which change and which
state. `molly status` says where everything is.

A fifth thing may sit beside the four documents: `publish/`, a mirror of the corpus holding
the documents this change puts into the knowledge base — `publish/specs/<name>/spec.md`
becomes `specs/<name>/spec.md`. `molly publish` files them and archives the bundle.

**The sequence is an order, not a rule.** Any state may follow any other, and nothing here
refuses a move on those grounds — what one requires is policy, and policy belongs to an
extension or to whatever orchestrates the work. The order still decides what a picker offers
first, and whether a move is recorded as going forwards or back.

The last state is the one exception, and it is not about order: `published` is reached by
`molly publish`, which writes the change's documents into the knowledge base. `molly move`
refuses it, because recording it would claim a publication that never happened.

Nothing outside the frontmatter is read. The prose is for whoever reviews the change.
