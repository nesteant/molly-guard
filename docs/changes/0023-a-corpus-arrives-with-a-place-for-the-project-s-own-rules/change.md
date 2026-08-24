---
title: A corpus arrives with a place for the project's own rules
lang: en
kind: feature
capability: the-corpus
state: draft
alters:
  - specs/agent-instructions
---

# What this change makes true

**`molly init` writes `<root>/conventions.md`, and the corpus README names it.** The pointer four
installed skills already carry stops being a pointer at a file nobody was told to write.

The file it writes is an explainer, in the shape every area README already takes: what belongs in
it, and what does not. It states no convention, because the tool has none — a corpus that adopts
this and writes nothing under the headings is a corpus with no project rules, which is a real
answer and the common one.

**`molly agents` names it when it is absent.** A corpus made before this change never gets the
file from `init`, and `agents` is the upgrade-time command. It names the one path its skills point
at that is not there, once, in the summary — and never as a finding in `molly status`, because a
project with no conventions is not a corpus with a problem.

# Why

`0013-a-project-s-rules-reach-every-agent` published the rule and installed the mechanism.
[Agent instructions](../../specs/agent-instructions/spec.md) states it: *a project writes its own
rules for working in its corpus into `docs/conventions.md`, and every skill points at it*, and
where the two differ the project wins. The pointer went into `molly-corpus` and `molly-new`, in
four tool directories, and it says **"if it is there"**.

Nothing anywhere tells a project to put it there. `molly init` writes a README into every area and
`docs/README.md` tables every directory a corpus has; neither mentions the file. So the sentence
that makes the mechanism work — *write your rules here* — exists only inside the specification that
argued for it, which is the one document a consumer of the published package never reads.

**It has already failed once, in the first repository to adopt 0.2.0**, and the way it failed is
worse than the file being absent. The skills are installed there and current:
`.claude/skills/molly-corpus/SKILL.md:22` points at `docs/conventions.md`, and there is no such
file. Half of that project's `CLAUDE.md` is its conventions — reaching one of the four directories
`molly agents` writes into, arriving as always-on context at session start, and least salient
exactly when a change is being drafted. That is the failure `0013` was written to prevent, arriving
one step earlier than `0013` looked: **the mechanism shipped and the invitation did not.**

**The rest of its conventions went into the files the tool generates.** That corpus's
`docs/README.md` carries a section the tool did not write, stating how work moves from plan to
knowledge and requiring that *when a change publishes, the roadmap entry it came from goes away*.
Its `roadmap/README.md` was replaced outright with a project index and a backlog model — priority,
dependency, a `needs` column. Both are files `molly init` writes and never revisits, so the project
put its rules in the only place that looked official, and the tool's own explanation of the area is
gone from one of them.

**That is the shape of the cost.** Rules in a generated file cannot be told from the tool's, drift
without anything comparing them, and are lost the day somebody regenerates. And one of these rules
is not merely misplaced: retiring a roadmap entry on publication is that project's invention, it
contradicts a slice keeping *what is done*, and it is what broke that project's own checker on its
first publication. A convention with nowhere to live does not stop existing — it moves somewhere
worse. [`0024`](../0024-an-upgrade-brings-the-areas-a-corpus-does-not-have-yet/change.md) is the
other half of how that corpus got there.

An absent pointer target is also the worse half of the two ways this can go wrong. A skill naming
a file that is not there teaches an agent that the pointer is decorative, and an agent that has
learned one instruction is decorative reads the next one the same way.

# What this must not become

**Seeded content.** `molly init` seeds no example anywhere else, for a reason it states: a corpus
that starts with somebody else's specification starts with a deletion. A `conventions.md` that
arrived holding opinions about branch names would be that mistake in the one file whose whole
purpose is to hold the project's own.

**A configured path.** `conventions: ./conventions.md` in `mollyguard.yml` was proposed and is
refused here: the path is fixed by the skills that point at it, so there is nothing to declare, and
a declared path is a second answer to a question the pointer already answers.

**Composed into the skills.** Refused in `agent-instructions` already, and restated because this
change is the one that makes composing look easy: it would put corpus content into the tooling,
stale the moment the file changes and stale silently, times four skills times four directories.
