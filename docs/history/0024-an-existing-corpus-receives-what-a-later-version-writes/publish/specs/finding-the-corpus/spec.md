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

A second **configuration** in a directory that already has one is refused, and names the file that
configures it. `molly init --root elsewhere` where a corpus is already here is a request for a
second corpus, and two would be two answers to *where is the corpus*.

The question it asks is about *this* directory and not the whole tree, and the difference is the
feature. A package inside a larger repository may have a corpus of its own; asking the wider
question would refuse it for something sitting several directories above that has nothing to do
with it. **Because discovery walks up, the nearest configuration wins**, which is what makes
nesting mean anything rather than merely be permitted.

What this narrows, knowingly: two corpora can no longer sit side by side in one directory. That
was possible before only because the marker was the corpus, and nobody wanted it.

**The refusal is about the file and never about the command.** It had been doing duty as both,
and that is what the next section is about.

# An existing corpus receives what a later version writes

`molly init` where a corpus already is **completes it**: it writes what this version writes and
the corpus does not have, keeps every file it finds, names what it added and what it kept, and
leaves the configuration exactly as it is.

This matters because `init` is the only command that writes the skeleton. Everything a later
version adds to the shape of a corpus therefore reached **new corpora only** — permanently, with
no version of the tool able to say so.

**`0017` is the proof rather than the example.** `<root>/.gitattributes` with `merge=union` fixed
a real defect: two branches each advancing a change conflict in the one file every skill says
never to hand-edit, and — in that change's own words — *the remedy was undiscoverable*. It ships
in `init`. Every corpus created before it still had the defect and still had no remedy, because
the command carrying the fix declined to run. **A bug fix that only new users receive is not a
bug fix.** Two more of the same shape, smaller: the area explainers changed and an existing
corpus kept the earlier text for ever, and the configuration moved out of the corpus with no
command to move it.

**And the recipe that worked was to defeat the guard.** Move the configuration out of the way so
the search finds nothing, run `init`, put it back. It works, and the corpus is in good order
afterwards — but nothing documented it, so each project invented its own version, and a project
that guessed wrong at that particular manoeuvre lost the one file that cannot be written again
from anything.

What a completing run will not do:

- **Rewrite anything.** Every file is placed only where there is nothing, exactly as on a first
  run, so an explainer a project made its own survives byte for byte and is named among what was
  kept. That is the half that decides whether anybody dares run the command twice.
- **Touch the configuration.** Not a merged key, not a rewritten header. A corpus that declared
  `naming:` keeps its policy, and `--lang` is **refused** rather than ignored — its answer lives
  in a file this run leaves alone, and silently ignoring a flag is the failure refused everywhere
  else.
- **Migrate anything.** An old-layout corpus is completed where it stands, and no second
  configuration appears at the repository root. Nothing here moves a document, renames a
  directory or reconciles a ledger.

**`molly status` names what is missing**, so the gap is visible from the command a planner already
runs rather than only from the command that closes it. It **never fails**: a corpus that works and
predates a file a later version writes is not broken, and failing would make upgrading the tool a
build break — which is the surest way to teach a project not to upgrade.

**There is no `molly upgrade`.** It was the obvious shape and is refused: it would have to answer
*what is an upgrade* for ever, and every version would add one more thing to it. What was needed
was the command that already writes the skeleton, no longer refusing for a reason belonging to a
different file.

# What can be answered without a corpus is answered without one

Three questions are answered before anything is located, and each is a question whose asker may
have no corpus at all.

```
molly --version            which build is on the PATH
molly help                 what the commands are
molly <command> --help     what that command takes, and what it refuses
```

**`--help` is about the command it was asked of.** `molly publish --help` prints publish's own
entry — its usage, the flags it takes, and the refusals it makes — rather than the listing the
caller already had. `molly help <command>` is the same answer through the other door.

That it works outside a corpus is the point rather than a convenience: **the caller asking what a
command needs is exactly the caller who has not set one up yet.** So is the ordering against the
flag check — `molly publish --help --nonsense` answers, because refusing an unknown flag on the
command that exists to list the flags answers nothing.

**A name that is not a command gets the message a typo deserves.** `molly frobnicate --help` is
refused as an unknown command, not answered with an empty entry, and not answered with *no corpus
here* — the same argument the location order already makes.

**The entry is assembled from the table the dispatcher reads**, so a command cannot describe itself
into disagreement with what it accepts. The one part that cannot be derived is what a command
*refuses*, since a refusal is a branch rather than a declaration — so those are named rather than
described, and each one is provoked by the suite. A line about a refusal somebody removed fails the
build instead of becoming a false statement about the tool.

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

**Anything added to the skeleton is something an existing corpus can obtain.** The next file
`init` learns to write answers this by being written through the same placement seam, which is
where it would have gone anyway — instead of by shipping a migration note a project has to find
and follow.

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

**A command describes itself from the same table that dispatches it.** There is one record per
command, holding what the listing prints, what the flag check allows, and what `--help` answers.
Three surfaces reading one structure cannot disagree; three tables would be two chances to forget,
and the gap between the first two is where `molly publish --help` printing the listing came from.

# What is deliberately left undone

**Nothing migrates the old layout.** One `git mv` and one key is the whole of it, and a command to
do that is a command that moves directories, which this tool does not do. A completing run does
not migrate either — it fills in what is absent where the corpus already stands.

**Nothing compares an explainer with what this version would write.** A corpus that has every file
is complete as far as this can tell, even where a project has rewritten one of them into something
that contradicts the tool — which has happened, in a `roadmap/README.md` that no longer mentioned
the command that writes a slice. `molly agents --check` makes exactly that comparison for the
instructions installed outside the corpus, and the inward-facing version is a different claim: it
would have to answer what happens when a project has deliberately made a file its own. Named here
so the gap is on the record rather than discovered again.

**A corpus is not searched for downwards.** Discovery walks up and checks the old default at each
level; it does not go hunting through subdirectories for something that looks like a corpus. A
tool that found a corpus nobody pointed it at would be guessing, one directory further along.
