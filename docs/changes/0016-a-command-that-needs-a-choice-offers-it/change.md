---
title: A command that needs a choice offers it
lang: en
kind: feature
capability: the-corpus
state: draft
alters:
  - specs/what-a-command-may-never-do-silently
  - specs/creating-a-change
---

# What this change makes true

**A command that needs a value from a set the corpus already knows offers that set, rather than
refusing for not having been told.** Where a person is at the terminal, they are asked. Where
nothing is reading input, the refusal stands and lists what could have been chosen.

It becomes a standing constraint — `decisions/a-command-that-needs-a-choice-offers-it.md` — because
it is a rule about every command the tool will ever grow, not a property of the two that already
follow it.

**The rule.** When a command needs a value, and the corpus can enumerate what that value may be,
and the command is running with a person on the other end, it asks. It refuses only when there is
nobody to ask, or when the set is empty and the remedy is to write the missing document first.

**What it applies to today.** `move` and `publish` already do it, which is where the pattern comes
from — either argument may be left out and the missing half is picked from a list. Three places do
not:

- **`molly change new --capability <name>`** refuses a name that does not exist and prints the
  capabilities. It has the list in its hand at the moment it refuses.
- **`molly change new --realises <entry>`** does the same with the roadmap.
- **`molly change new` with neither `--capability` nor `--alters`** reports *nothing to publish into
  yet* and carries on, leaving a change filed nowhere. That is the worse half of the same failure:
  a choice the corpus could have offered, not made, and not blocked on either.

**What it does not apply to, and the boundary is the point.** A title is not a choice — it is
authorship, and offering a list would be composing text. A name is derived from a title and only
asked about when the derivation fails, which is already the behaviour. `--alters` names documents
that may not exist yet, so there is no set to offer. And a flag whose set is empty is a refusal
naming the command that creates the first one, not an empty menu.

**Nothing waits in a pipeline, ever.** A prompt in CI blocks until the job is killed and the output
says nothing about why. `pick.ts` already states this — *nothing reading input is a refusal, never
a wait* — and this change promotes that sentence from a comment in one file to a constraint every
later command is held to.

# Why

The tool refuses well and offers badly, and the two are not the same skill.

Every refusal in this codebase names the remedy: `no capability named "x"` prints the capabilities
that exist. That is good behaviour and it is still one round trip short. The author is at a
terminal, the tool knows every valid answer, it has just printed them, and it exits `1` so the
whole command has to be retyped. The information needed to finish the job was present and was
rendered as an error message instead of a question.

**The unfiled case is the one that costs something.** `molly change new "…"` with no capability
does not fail — it writes the bundle, prints a note, and exits `0`. The author reads the note or
does not, and the miss surfaces at `molly publish`, which refuses to file a new document under no
capability. That is the right refusal at the wrong distance: the question was answerable at
creation, when the person was still thinking about it, and instead it is asked at the end by a
different command about a decision made days earlier. Offering the list at creation collapses that
gap, and `publish` keeps its refusal for the case where somebody declines.

**It is written as a decision because the alternative is remembering.** Two commands do this, three
do not, and the difference is not a design — it is which commands happened to be written after the
picker existed. Every command added later faces the same choice, and a rule that lives only in the
habits of whoever wrote `move` is a rule the next contributor cannot read. `decisions/` is for
constraints that outlive any one change and that bind work not yet done, which is exactly what this
is: it constrains commands nobody has proposed.

The cost is real and worth naming: it puts a dependency on a prompt library in the path of more
commands, and it makes interactive and non-interactive runs behave differently — one asks, one
refuses. That difference already exists and is already load-bearing, and stating it as a rule is
what stops it being rediscovered per command.
