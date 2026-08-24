---
title: A command that needs a choice offers it
lang: en
---

# The constraint

When a command needs a value, and the corpus can enumerate what that value may be, and a person is
on the other end, **the command asks**. It refuses only when there is nobody to ask, or when the
set is empty.

Three parts, and all three are the rule rather than caveats to it:

- **A knowable set.** The corpus can list capabilities, changes, states and roadmap slices. It
  cannot list titles, and it cannot list documents that do not exist yet — so a title and `alters:`
  are outside this, and no amount of helpfulness brings them in. Offering a list of titles would
  be composing text, which the engine does not do.
- **A person present.** Both streams a TTY, which is what `interactive()` answers. **Nothing reading
  input is a refusal, never a wait** — a prompt in a pipeline blocks until the job is killed and
  the output says nothing about why, so an agent or a CI step is told to pass its arguments
  instead, with the list it could have passed.
- **A non-empty set.** An empty menu is a question with no answer. When nothing can be chosen, the
  refusal names the command that creates the first one.

**An optional value stays optional.** Where declining is a legitimate answer, the offer carries an
explicit way to decline, and declining is not a failure. A menu that cannot be refused is a
requirement wearing a menu's clothes.

**Nothing is written before the question is answered.** A command that writes and then asks leaves
a half-made document behind when the person walks away, and abandoning — Ctrl+C — exits `0` with
nothing changed, because giving up is not a failure of the tool.

# Why it is binding

**The information was already there.** Every refusal in this tool names the remedy, so a bad
`--capability` prints the capabilities that exist. That is one round trip short of finishing the
job: the author is at a terminal, the tool knows every valid answer and has just rendered them as
an error, and the whole command has to be retyped. A list printed in a refusal and a list offered
as a choice are the same list; only one of them respects that somebody is sitting there.

**The alternative is remembering.** Two commands did this and three did not, and the difference was
not a design — it was which commands happened to be written after the picker existed. A rule
living in the habits of whoever wrote `move` is a rule the next contributor cannot read, and every
command added later faces the same choice.

**The asymmetry is deliberate and load-bearing.** Interactive runs ask; automated runs refuse. That
is not a gap to be closed later by making CI prompt or the terminal silent — it is the tool being
usable by a person and predictable to a machine at the same time, which are different requirements
and are met differently.

# How it is held

Not by a grep, and that is worth admitting rather than dressing up.

**One implementation, shared.** `chooseFrom` in the CLI is the only place *ask, or refuse with the
list* is written. A command that resolves a value from a set reaches for it, and a second copy of
that logic is the thing review is looking for.

**The suite runs with no TTY**, so every refusal path is asserted on every run, under a timeout —
a command that blocks fails the build rather than hanging it. The interactive path cannot be
asserted there, is checked by hand before a change touching it advances, and the result is written
into that change's `tests.md`.

**A command is listed in `molly help`, and the harness checks the listing is complete.** Adding one
is therefore visible, which is the moment this constraint is meant to be read.
