---
title: The plan and the corpus cannot disagree
lang: en
kind: feature
capability: the-corpus
state: draft
alters:
  - specs/creating-a-change
---

# What this change makes true

**`roadmap/` has a command, and a change can say which entry it realises.** `molly roadmap new
"<title>" [--capability <name>]` writes an entry the same way `molly capability new` writes a
capability. `molly change new ... --realises <entry>` records the link, refusing an entry that is
not there.

**A plan that goes on planning something already built is said out loud.** When a change carrying
`realises:` publishes and its entry is still sitting in `roadmap/`, `molly status` reports it —
every run, until somebody retires it.

**Nothing is retired by the tool.** The entry is somebody's planning note; the tool writes no
prose and deletes none. It says the two models disagree and leaves the decision where it belongs.

# Why

A specification-driven project has a stage before a change: what it knows it wants and has not
specified yet. MollyGuard has the directory for it and had nothing else — no way to make an entry
with a usable name, no link from the change that answers it, and no way to notice when the two
had drifted apart.

The drift is the part that costs. A change publishes, the entry survives, and the plan goes on
planning something that already exists — with nothing saying so, because the two are separate
models of the same work and only one of them knows when something shipped. A project meeting this
writes a script to reconcile them, and that script is code the tool should have made unnecessary.

The name matters more than it looks. An entry is hand-written, so it gets no name check, and the
scan already reports `Seven Years.md` as unusable for as long as it sits there. A command that
mints the name by the same rule as every other name is the difference between an entry every
command can address and one that is reported as damage.

**What this deliberately does not model is a backlog.** No `needs:`, no ordering between entries,
no cycle detection, nothing computing what may be started. That is a planning tool, and the
priority grammar a project wants — *a `Must` never depends on a `Should`* — is the project's own.
The engine owns the vocabulary and the record and not the process, and "which planned thing may
be started" is process. A corpus wanting more can put anything it likes in this directory.

**And the finding does not fail.** An entry is a note rather than a governed unit. Failing a build
over a planning document nobody retired would be refusing somebody's notes for existing — which
is the same reason every other roadmap finding reports and does not fail.

The dangling reference is checked only while a change is in flight. An archived change pointing at
a retired entry is the *finished* shape of this link, and reporting it would turn every correct
publication into a finding.

Filed against `specs/creating-a-change`, which states the command's signature; `--realises` joins
it. `0009-a-corpus-orders-its-own-names` altered the same document and has been published, so this
one's `publish/` set is written on top of what is in `specs/creating-a-change/` now — a
specification is replaced whole, and drafting against the older text would silently retract the
corpus's naming policy.
