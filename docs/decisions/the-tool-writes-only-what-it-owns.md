---
title: The tool writes only what it owns
lang: en
---

# The constraint

MollyGuard governs a corpus of specifications. Outside that corpus it writes exactly two kinds of
file and there is no third:

- **`mollyguard.yml`** — the corpus saying where it is, which has to sit high enough to be found
  from anywhere in the repository.
- **`molly`-namespaced skills and commands** — the instructions that teach an agent to use the
  corpus, in the directories agent tools read, every path of them named by the tools table.

Both are this tool's own. Both can be deleted without surgery on anything of somebody else's.

**It ships checks and never the plumbing that runs them.** A rule the tool can answer is exposed
as a command that reads what it is handed and answers in an exit code — `0` clean, `1` a refusal.
Where that command runs is the repository's arrangement, and whatever already manages that
arrangement is better at it than this tool would be.

**A subprocess is a read, or it is a defect.** One call, in `identity.ts`, asking git who you are.

# Why it is binding

A tool that manages one thing well keeps finding adjacent things it could also manage. A commit
hook. A settings file. A lockfile, a CI definition, a `.gitignore`. Every one of them is a small
step, every one is defensible on its own terms, and the sum is a tool whose reach nobody can
predict — which is the property that makes people stop installing things.

The two that had to be taken back out are the shape of the mistake:

**A hook is a repository's own machinery.** Writing `.git/hooks/commit-msg` put this in the
business husky, lefthook and pre-commit are in, and put it there badly: those tools order hooks,
chain them, and install them across a team, and this wrote one file and hoped nothing else wanted
it. It already had to keep a hook it found and tell the reader to edit it by hand, which is what
a tool looks like when it has discovered it is the wrong tool for the job.

**A settings file is a security decision.** The grant was merged in carefully — whole when
absent, otherwise parsed, given only what it lacked, left alone in any shape it did not
understand — and careful was not the point. A file that decides what may run without being asked
holds somebody's judgement about risk. A tool that adds itself to it has approved itself, and
doing so helpfully makes it harder to notice rather than more defensible.

This is also the rule the product enforces on other people's documents. A corpus is a claim that
what you are reading is what is true, and a tool that reaches past what it was given while
exiting `0` is making the same false report it was built to catch. See
[[what-a-command-may-never-do-silently]].

# How it is held

Grepped and run, because a grep passes over code nobody wrote and a run passes over a path nobody
took.

**Grepped:** one import of `node:child_process` in the whole tool, in `identity.ts`. No `chmod`
anywhere — an executable bit is wanted for a hook or a script, and this writes markdown, YAML and
JSONL.

**Run:** `init` and `agents` are executed into empty directories and everything each leaves
behind is walked. Anything that is not the corpus, not `mollyguard.yml`, and not
`molly`-namespaced fails the harness. Each of those names a file count it has to beat before it
may pass, because a run that wrote nothing leaves nothing foreign either — an absence is always
one line away from being green on a command that crashed.

The broad grep — for the literal `.git` — is deliberately not the one used. `.github/prompts` is a
legitimate path in the tools table, and an assertion with a carve-out in it is one people edit
rather than obey.
