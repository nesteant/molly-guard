# How it will be built

Three removals and one guard. The removals are the work; the guard is what stops the next command
re-deciding this.

## The hook goes, the check stays

`cli/commit.ts` loses `HOOK`, `hooksDirectory` and `hooksCommand` — and with them the only
`execFileSync` outside `identity.ts`, the only `chmod`, and the only write into a directory git
owns. `commitMessageCommand` is untouched: it already takes a path, reads it, resolves each
trailer against `changes/` and the archive named by `AREAS`, and returns `0` or `1`.

`bin.ts` drops `hooks` from the command table, from `FLAGS`, and from `OUTSIDE` — which then holds
`agents` alone, and gets the rule written on it, because that set is the one place a new command
has to answer "does this act on a corpus".

**Where the wiring lines go is `molly help`, not the command.** A `commit-msg` check runs on every
commit and a passing one must say nothing; a command that printed installation advice on success
would print it a thousand times. Help is where somebody goes when they are deciding how to wire
it, which is the only moment the lines are wanted.

## The permissions grant goes

`store/scaffold.ts` loses `authorise` and `Authorised`, and `store/index.ts` stops exporting them.
`cli/agents.ts` replaces the write with the report it already knows how to make: the settings file
each tool reads, the permissions to add, and nothing written.

Reported for every tool with a settings file rather than only where something is missing. Reading
the file to decide whether to mention it would put the tool back to inspecting a configuration it
has no business in, and the difference between a line that always prints and a line that prints
when needed is not worth the read.

## The guard

`scripts/smoke.sh`, in the section that already refuses `node:` inside core. Two greps and two
behaviours, because a grep proves the code cannot do it and a run proves it does not.

- **No source but `identity.ts` imports `node:child_process`.** After this the tool runs one
  subprocess in one place, and that place reads.
- **No source names a git directory.** The path that produced `.git/hooks/commit-msg` cannot come
  back without failing this.
- **`molly agents` creates no settings file**, in a directory that had none.
- **`molly agents` writes only `molly`-namespaced paths.** The list is walked, and anything that
  is neither under a skills directory nor a `molly` command file fails the run.

## What this constrains afterwards

**Two kinds of file may be written outside a corpus, and there is no third.** The one that says
where the corpus is, and the `molly`-namespaced instructions that teach an agent to use it. A
command wanting a third answers it in `OUTSIDE`, where the rule is written, before it is built.

**The tool integrates through exit codes and writes no integration.** `0` and `1` and no output to
parse is the whole surface a hook runner, a pipeline step or a pre-commit framework needs. Any
later check that wants to run inside somebody's toolchain ships the check and not the plumbing.

**A subprocess is a read or it is a defect.** The tool asks git who you are and asks nothing else
of anything, and the harness is what keeps that true rather than a habit.
