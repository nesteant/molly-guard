---
title: Finding the corpus
lang: en
capability: the-corpus
---

# Where a corpus is

**`mollyguard.yml` sits at the top of the repository and names the directory the corpus is in.**

```
mollyguard.yml        root: docs
docs/                 the corpus
```

The file is the marker and the corpus is what it points at, and keeping those two things apart is
the whole of this. A marker that had to live *inside* what it marks can only ever mark one place,
and it cannot be found from below without knowing the answer first.

`molly init` writes it, and `--root <dir>` puts the corpus somewhere other than `docs/`. What is
recorded is the directory that was asked for, so a corpus at `kb/` is a key in a file rather than
a flag on every invocation for ever.

# It is found by walking up, from wherever the command was run

`molly status` works in `packages/store/`. Every command walks from the working directory towards
the root of the filesystem and takes the first configuration it meets, so **`--root` is the odd
case rather than the daily one** — a corpus somebody is pointing at from outside, rather than the
one they are standing in.

**The corpus is named by what configures it and never by where the shell was.** A command run
three levels down says `docs/capabilities/billing.md`, exactly as it does from the top. The
alternative is a tool that calls one corpus `docs` in one terminal and `../../../docs` in another,
and produces output nothing can compare, paste or search for.

The old default is looked for at each level too, and that is not the same as walking up: it lies
*below* the working directory rather than above it. A repository that never migrated would
otherwise stop being found from its own root, which is the one place everybody runs commands from.

# One configuration names one corpus

A second `molly init` in a directory that already has one is refused, and names the file that
configures it.

The question it asks is about *this* directory and not the whole tree, and the difference is the
feature. A package inside a larger repository may have a corpus of its own; asking the wider
question would refuse it for something sitting several directories above that has nothing to do
with it. **Because discovery walks up, the nearest configuration wins**, which is what makes
nesting mean anything rather than merely be permitted.

What this narrows, knowingly: two corpora can no longer sit side by side in one directory. That
was possible before only because the marker was the corpus, and nobody wanted it.

# A configuration that cannot be read is refused before any command runs

It is read once, centrally, and a file that will not parse stops the run and names the line.

This is the rule of [what a command may never do
silently](../what-a-command-may-never-do-silently/spec.md) at the one place it is cheapest to
break. A tool that cannot read `root:` has an obvious fallback — take the corpus to be the
directory holding the file — and the fallback is wrong in the one way that matters: it reports on
a corpus it never looked at, exits `0`, and leaves the real one untouched beside it. Guessing
where the corpus is produces an empty report, and **an empty report is indistinguishable from a
corpus with nothing in it.**

Refusing costs a fixed typo. Not refusing costs whatever was decided on the strength of a report
about nothing.

# Both layouts are read, and nothing has to be migrated

A configuration with no `root:` is the old shape, where the corpus is the directory holding the
file. Such a corpus is still read, still found from below, and `molly init` still refuses to
double it.

The compatibility rule is one line and it is **not a deprecation**. There is no migration command
and no warning, because a corpus that works is not a corpus with a problem — and the tool has no
rename verb precisely so that it never moves somebody's directory on their behalf.

# What this constrains afterwards

**A corpus is located, never assumed.** No command builds a path out of the working directory and
a default name. The one place that answers *where is the corpus* is the one place that has to be
right.

**What does not act on a corpus does not require one.** `molly agents` is the only command that
does not: it writes the instructions agent tools read — outside the corpus by design, holding
nothing from it — and must work in a repository nobody has initialised, which is the moment
somebody most needs the instructions. `molly init` is not an exemption but the one that *creates*,
and is answered before the search.

The exemption is a set rather than a chain of comparisons, and the reason is that it is currently
a set of one. A condition written inline is a condition the next command answers by copying the
line above it; a named set is a place where *does this act on a corpus* has to be answered out
loud. It is also the narrower question. The wider one — what may be written outside a corpus at
all — is settled in [nothing outside the corpus that is not this tool's
own](../agent-instructions/spec.md), and the set is short because that answer is.

**An unknown command is refused before anything is located.** Answering *no corpus here* to
`molly frobnicate` answers a question nobody asked, and sends its reader to look for a corpus when
what they have is a typo.

# What is deliberately left undone

**Nothing migrates the old layout.** One `git mv` and one key is the whole of it, and a command to
do that is a command that moves directories, which this tool does not do.

**A corpus is not searched for downwards.** Discovery walks up and checks the old default at each
level; it does not go hunting through subdirectories for something that looks like a corpus. A
tool that found a corpus nobody pointed it at would be guessing, one directory further along.
