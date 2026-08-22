# How it will be built

Two commands, and the rule between them is pure.

## Reading a message

`core/commit.ts`, which touches no filesystem:

```ts
export const TRAILER = 'MollyGuard';
export function readCommitMessage(text: string): CommitMessage;
export function mustNameChange(message: CommitMessage, requires: readonly string[]): boolean;
```

Comment lines are dropped first, because git strips them *after* the hook has run — a trailer
inside the commented block is one the author did not write, and counting it would pass a commit
that names nothing.

Trailers are read anywhere in the message rather than only in the trailing block. Git would
honour only the last paragraph; a person who wrote the line meant it where they put it, and
reading it there turns a silent miss into a check.

Generated messages are exempt and named as such: a merge, a revert, and `fixup!`/`squash!`. They
have no type and no author deciding their shape, and requiring one to name a change is requiring
an edit to a message the tool is about to discard.

The trailer key is fixed rather than configurable. It is the tool's own name; there is nothing
for a project to choose.

## Resolving

`cli/commit.ts` looks in `changes/` and in the archive named by `AREAS` — read from the table
rather than written down again, because a directory name written twice is one that gets renamed
once. Every trailer in the message is resolved, not the first: a squash merge composes one
message out of several, so two is ordinary, and checking one of them is how the other reaches the
trunk naming nothing.

## The hook

`molly hooks install` writes a hook that calls the `molly` on the PATH rather than embedding the
rule, so upgrading the tool upgrades the check. A hook holding a copy enforces whichever version
was installed on each machine.

**Where the hooks are is asked of git, not assumed.** `.git` is a *file* in a worktree or a
submodule, so joining a path onto it produces one that cannot be created. Asking
`git rev-parse --git-path hooks` also honours `core.hooksPath`, and matches how `identity` already
asks git who you are.

A hook already there is kept and reported, the same courtesy `init` gives a directory it did not
make — replacing it would silently drop whatever else it ran.

## What this constrains afterwards

**The tool checks that a reference resolves and never that a convention was followed.** The next
check that touches a commit, a branch or a tag answers this before it is written: is this about a
MollyGuard id, or about how this project likes to write things?

**Anything integrating through exit codes gets `0` and `1` and no output to parse.** That is the
whole surface a hook or a pipeline step needs, and it is why this needs no glue.
