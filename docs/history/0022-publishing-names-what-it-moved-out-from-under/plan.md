# How it will be built

**After the move, over the areas that are live.** The publication is performed first — documents
filed, state recorded, bundle archived — and the scan runs against the corpus as it now is. That
order is not an optimisation: a reference is broken by the move, so checking before it would be
checking a different corpus, and any check that ran first would have to predict rather than observe.

**What is scanned.** Markdown files under the live areas — `changes/`, `capabilities/`, `roadmap/`,
`specs/` and `decisions/` — for inline links and reference definitions whose target is a relative
path. `history/` is excluded, and the exclusion is the area's definition rather than a special case.

**What is reported.** A relative link that resolves to nothing **and** whose pre-move target was
inside the bundle just archived. Both halves are required: the first alone would report every link
somebody has broken since the corpus was made, and the second alone would report links that still
resolve because a file of the same name exists.

The old path is known exactly — the command performed the rename — so the second half is a prefix
comparison against a path this command holds, not a guess.

**Where the new path is named.** Each finding says where the target went, because the reader's next
action is to repoint it and the answer is one substitution. Naming it is not rewriting it: the
difference is who edits the file, and it is the whole difference.

## What this rules out

**Reading a document's meaning.** A link is a path. Nothing here parses prose, resolves anchors
within a document, or has an opinion about whether the link should have existed.

**Absolute and external links.** Untouched. A `https://` reference is not something a publication
can invalidate, and a path from the repository root is not one this command moved.

**Failing the run.** Stated in `change.md`. The exit code is the contract, and `1` means a refusal;
a publication that happened and reported a consequence is not a refusal.

## Sequencing

This change and `0021-a-move-that-crosses-several-states-names-them` both alter
`specs/what-a-command-may-never-do-silently`, each adding one instance to a document that is a
catalogue of them. A document publishes whole, so whichever lands second carries the other's
section. Named now rather than met at publication.

# What this constrains afterwards

**A command that moves a document reports what it moved out from under.** This is the general form,
and the next command to move anything — a rename, a sealed history, a capability that retires —
answers it in the same way: name what pointed there, name where it went, edit nothing.
