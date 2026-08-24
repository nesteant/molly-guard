---
title: A command's help is about the command it was asked of
lang: en
kind: feature
capability: the-corpus
state: deployed
alters:
  - specs/finding-the-corpus
---

# What this change makes true

**`molly <command> --help` prints that command's own usage** — what it takes, what it may be given,
and what it refuses. `molly help` with no command keeps printing the listing it prints today.

Nothing is invented for it. A command's entry is the usage line and summary `HELP` already holds,
the flags `FLAGS` already holds, and one line per refusal the command already makes.

# Why

**Every command accepts `--help` and every one of them answers the same question.** `help` is in
`GLOBAL`, and `bin.ts` answers it first — before `checkFlags`, before the unknown-command message,
before the corpus is located. [Finding the corpus](../../specs/finding-the-corpus/architecture.md)
states that order and the reason for it: *`--help` — asked for, so answered rather than validated*.
The order is right. What it answers is not: `molly publish --help` prints the nine-line command
list, which is the one thing the caller already knew.

**This is the failure the flag table was built to prevent, arriving through the flag that exists to
describe the others.** `bin.ts` refuses `--dryrun` by name because a flag parsed and never read *"is
the same behaviour as not having typed it"*, and because *"a command that quietly does something
other than what was typed cannot be automated against"*. `--help` is not ignored — it is accepted
and answers a different question, which is the same defect one step further along.

**Measured, in a corpus that adopted 0.2.0.** An agent about to publish spent a call on `molly
publish --help` and learned nothing about publishing: ~15,000 input-equivalent tokens at that
session's mean, for an answer it already had. That call is the correct instinct — check what a
command takes before running the one that writes the knowledge base — and today it is answered with
the caller's own question. The alternative to asking is guessing at the flags of the command that
files documents into accumulated truth.

**And it is the surface for an agent that never loaded a skill.** The five installed skills are the
main route and they are deliberately short; they *"do not restate `molly help`; they say to run
it"*. That sentence only holds if running it says something. For any agent driven by a tool
`molly agents` does not write into, per-command help is the whole of the tool's self-description.

# What this must not become

**A manual.** No worked examples, no prose about when to use a command, nothing that would have to
be kept true against behaviour it is describing from a distance. Each entry is assembled from the
tables the dispatcher already keys on, which is what makes a wrong entry a compile-time problem
rather than documentation rot.

**A second listing to keep in step.** `HELP` and `FLAGS` are two tables keyed by the same command
names, and a third would be two chances to forget. They become one table, and the harness check
that every command appears in `molly help` checks the same structure.
