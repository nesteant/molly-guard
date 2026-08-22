# How it will be built

Text, in `core/scaffold.ts`, which is where every installed skill and command comes from.

## The pointer

`molly-corpus` gains a third item in *Read before writing*: `docs/conventions.md`, if it is there,
described as how *this* repository uses MollyGuard — and where the two differ, it wins. That last
clause is the whole value: a skill that mentions a file without saying how it ranks against the
skill's own contents leaves an agent to guess.

`molly-new` gains it in the same list, because drafting is when it is needed.

## The unknown

`molly-new` gains one numbered step: never guess, write it into `change.md`, stop. Locally ask;
unattended exit non-zero. It says plainly that nothing in the tool refuses a change for holding
one, so an agent does not go looking for the command that does.

## Staying under the caps

Every skill loads its name and description into every session that starts, and the harness caps
the reference skill at 60 lines and each workflow skill at 30. Both additions are written to fit
rather than answered by raising the cap — a cap raised once is a cap.

## What this constrains afterwards

**Nothing in an installed skill is corpus-derived.** A skill says where a thing lives; it never
says what the thing contains. The next piece of project-specific guidance is a pointer, not a
composition.

**What the tool refuses and what it merely advises are stated separately.** An agent told "the
tool will stop you" about something the tool does not stop is an agent that stops trusting the
rest of the sentence.
