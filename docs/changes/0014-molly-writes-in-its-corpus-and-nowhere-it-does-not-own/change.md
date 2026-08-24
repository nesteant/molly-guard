---
title: Molly writes in its corpus, and nowhere it does not own
lang: en
kind: refactor
capability: the-corpus
state: in_progress
alters:
  - specs/agent-instructions
  - specs/what-a-command-may-never-do-silently
---

# What this change makes true

**Everything MollyGuard writes outside its corpus is a file it owns and can name.** There are two
kinds and no third: `mollyguard.yml`, which is the corpus saying where it is, and the
`molly`-namespaced skills and commands that teach an agent to use it. Every path of the second
kind comes from the tools table, so what is written outside the corpus is a list somebody can
read rather than a habit spread across commands.

**`molly hooks install` is gone. `molly commit-msg <file>` stays.** The rule it checks was always
the tool's: a `MollyGuard:` trailer names an id, and only this tool knows what those address.
Where that check gets wired into a repository was never the tool's, and there are tools whose
entire job it is. So the command reads a path it is handed, answers in an exit code, and now
prints the three lines that wire it into husky, lefthook and pre-commit — which it writes
nowhere.

**`molly agents` no longer edits `.claude/settings.json`.** It names the two permissions and the
file to put them in, the way `--check` reports rather than repairs. A tool that grants itself
permission inside somebody's security configuration has answered a question that was not put to
it.

**Nothing but `identity.ts` may run a subprocess, and the harness greps for it.** One read of
`git config`, which invents nothing and answers `unknown`, is the whole of what the tool asks of
the repository around it.

# Why

The tool's claim is narrow on purpose: it governs a corpus of specifications. Everything it does
outside that borrows authority it was never given, and the two places it had done so were the two
where the borrowing is least visible and hardest to undo.

**A hook is a repository's own machinery.** Writing into `.git/hooks/` puts MollyGuard in the
business husky, lefthook and pre-commit are in — and puts it there badly, because those tools
manage ordering, chaining, staged files and installation across a team, and this wrote one file
and hoped nothing else wanted it. `molly hooks install` already had to keep a hook it found and
tell the reader to edit it by hand, which is the shape of a tool discovering it is the wrong tool
for the job. A checker that reads a file and exits `0` or `1` composes with every one of them and
competes with none.

**A permissions file is a security decision.** `authorise` was written carefully — it merges, it
refuses shapes it does not understand, it never clobbers — and careful is not the point. The
point is that a tool adding `Bash(molly:*)` to the file that decides what may run without asking
has pre-approved itself, in a file whose contents are somebody else's judgement about risk. That
it did so helpfully makes it harder to notice, not more defensible. The convenience was real and
is kept: the two lines are printed, and a person spends ten seconds pasting a grant they have
read.

The general form, which is the part worth keeping after these two are fixed: **a tool that
manages one thing well will keep finding adjacent things it could also manage.** Each is a small
step, each is defensible on its own, and the sum is a tool nobody can reason about the blast
radius of. The boundary has to be a written rule with a check behind it, or every future command
relitigates it — which is exactly how these two arrived.

What is unchanged: the corpus is still written to freely, because that is the thing MollyGuard is
for. `git config --get user.name` is still read, because a person has already said who they are
one directory up, and inventing a second answer is how the two disagree.
