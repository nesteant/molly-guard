---
title: An install names a file whose text this version changed
lang: en
kind: bug
capability: the-corpus
realises: what-mollyguard-still-owes
state: published
alters:
  - specs/what-a-command-may-never-do-silently
---

Written for somebody deciding whether this should happen, who will not open the codebase and
does not know this corpus exists. A sentence belongs here only if the decision changes when it
stops being true; one that changes only *how* the work is done belongs in `plan.md` — moved
there, not dropped.

# What this change makes true

**`molly init` names a file it kept whose text is not what this version writes.** It keeps the
file, as it always has. What changes is that it stops reporting the file as though it were
current, and says which one is behind.

The report today claims something the command never checked:

```
  config      mollyguard.yml — left exactly as it is
  added       nothing — it already had everything this version writes
  kept        11 file(s) — everything that was already there
```

*It already had everything this version writes* is a claim about **contents**, made from a check
on **existence**. Where the two disagree the sentence is simply false.

# Why

**It went wrong on a real upgrade, on the release before this one.** The first adopting corpus
moved from 0.3.0 to 0.3.1 and ran `molly init`. `changes/README.md` on disk was 0.3.0's; 0.3.1
had rewritten it, adding the paragraph about who each of the four documents is written for —
the prose half of the change that release was named after. `init` printed the line above and
kept the old text, so that corpus took the release and not the change, and nothing anywhere
would have said so afterwards.

**It is silent in both directions**, which is what makes it worse than a missing feature. Nothing
on an upgrade says an explainer moved, and nothing later says one is behind. The gap is found by
somebody who reads the tool's own diff between two releases, which is not a thing an adopter can
do.

**An explainer is not decoration.** It is read once at the start of a session and is the only
statement of what an area is for. A stale one is the previous version's instructions presented as
this version's, to an agent with no way to tell — the exact failure this product exists to
prevent, arriving through the tool instead of through the documents.

**And the tool already knows how.** `molly agents --check` reports skill files that are out of
date, by name, from a comparison one file away in the same package. In the upgrade above the two
ran in the same session: one named twenty-eight stale files and the other reported that eight
explainers were current without having opened one.

**What it costs is one read per file at install time**, on a command run once per corpus per
upgrade, against a report that is currently wrong in the one situation it exists for.

# What is not settled

Nothing.

The question this had to answer is whether a differing file is also *replaced*, and the answer is
no, on a constraint that is already published: `0008-nothing-an-install-finds-is-overwritten-lost-or-hidden`.
A `molly-*` skill is this tool's own file and is rewritten on sight; an explainer sits in a
directory the tool did not make, and adopters are invited to add to it. So the outcome is a line
naming the file and the operator's decision — reported, never replaced.
