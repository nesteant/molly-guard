# What will prove it

Assertions in `scripts/smoke.sh`. The greps prove the code cannot do it; the runs prove it does
not. Both, because a grep passes over code that was never written and a run passes over a path
nobody took.

## The boundary, grepped

**Only `identity.ts` runs a subprocess.** One import of `node:child_process` in the whole tool,
in the one place that reads. This is the assertion that fails the day something shells out to
`git add`, and it fails at the import rather than at the damage.

**Nothing anywhere calls `chmod`.** An executable bit is wanted for a hook or a script and for
nothing else, and this tool writes markdown, YAML and JSONL. It is a narrow grep on purpose: the
broad one — for the literal `.git` — cannot be written, because `.github/prompts` is a legitimate
path in the tools table and an assertion with an exception in it is one people learn to edit.

Modelled on the assertion that keeps `node:` out of core, and for the same reason: a property
somebody can grep for is a property, and one stated in a review is a promise.

## The boundary, run

**`molly agents` creates no settings file.** Run in a directory that had none, `.claude/settings.json`
is still absent afterwards — and the run still says which permissions to add, so the convenience
survives the write not happening.

**`molly agents` writes only `molly`-namespaced paths.** Every path it reports is under a skills
directory or is a `molly` command file. This is the one that catches a future tool row whose
palette directory is a file somebody else owns.

## What stays working

**The check still checks.** A trailer naming a change passes; one naming nothing is refused; a
required type with no trailer is refused; an archived change still resolves. None of that
depended on the hook, and all of it is the half that was always the tool's.

**A passing check says nothing.** Exit `0` and no output — because it runs on every commit, and a
check that printed advice on success would print it a thousand times.

**Nothing offers to install anything.** `molly hooks install` is not a command, and is refused as
an unknown one rather than accepted and ignored.
