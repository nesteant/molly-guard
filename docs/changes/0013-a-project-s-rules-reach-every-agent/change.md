---
title: A project's own rules reach every agent
lang: en
kind: feature
capability: the-corpus
state: draft
alters:
  - specs/agent-instructions
---

# What this change makes true

**The installed skills point at `docs/conventions.md`.** A project writes its own rules for
working in its corpus into that file, and every agent tool the skills are installed for is told
to read it — beside `docs/decisions/` and `lang:`, which they already point at.

**And they say what to do when the documents do not answer something:** write the unknown into
`change.md` under its own heading and stop. Locally, ask; unattended, exit non-zero. Nothing in
the tool refuses a change for holding one, because an unresolved change is one nobody approves.

# Why

A project's conventions had exactly one place to live, and it was a Claude-specific file.
`molly agents` installs instructions for several tools; a project's own rules reached one of them.
An agent driven by any other tool got MollyGuard's rules, none of the project's, and behaved
confidently and wrongly.

They also arrived at the wrong moment. MollyGuard's guidance is a skill, loaded when a model
decides the work is ours; a project's arrived as a wall of prose at session start, competing with
everything else, and was least salient exactly when a change was being drafted.

**A pointer rather than a copy.** The obvious fix — composing `conventions.md` into each installed
skill — is the one thing this must not do. `scaffold.ts` states the rule it would break: nothing
in a skill is corpus-derived, because a copy is a second answer to a question the corpus already
answers, stale the moment it changes and stale silently. Composition would put that failure back
into the tooling, times four skills times four tool roots. The skills already point at
`docs/decisions/` without copying them, and this is one more pointer of the same kind: it reaches
every tool, at the moment of use, and can never drift.

The second half is what is left of a larger idea that was built and then removed. Unanswered
questions were briefly a first-class thing — a command, an append-only log, a hash pinning each
answer to the documents. It was wrong: a question is *text*, so a question appearing and being
resolved is a diff, and git already records that with author, timestamp and surrounding context.
The log was a second, worse copy of `git blame`. Worse, its most-defended feature — detecting an
answer that never reached the documents — solved a problem that existed only because there was a
second place to record answers.

So the unknown goes in `change.md`, where every other sentence in a change goes, and the gate is
the approval phase: a human declining to advance a change they can see is unresolved. The engine
owns the vocabulary and the record and not the process, and *is this resolved enough to proceed*
is process.

Filed against `specs/agent-instructions`, which states what an installed skill holds and what it
must never hold. This adds a pointer and holds to the second half — no corpus content is copied
into a skill. `0012-a-corpus-is-found-not-passed` alters the same document; whichever publishes second
carries the other's wording.
