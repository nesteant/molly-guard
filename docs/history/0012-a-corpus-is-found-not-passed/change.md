---
title: A corpus is found, not passed
lang: en
kind: feature
capability: the-corpus
state: published
alters:
  - specs/agent-instructions
---

# What this change makes true

**`mollyguard.yml` sits at the top of the repository and names the directory the corpus is in.**
`root: docs`. It used to sit *inside* that directory, which made the file both the marker and the
contents.

**Every command finds it by walking up from wherever it was run.** `molly status` works from
`packages/store/`. `--root` becomes the odd case rather than the daily one.

**One configuration names one corpus.** A second `molly init` in the same directory is refused,
naming what already configures it. The check is about *this* directory and not the whole tree, so
a package inside a larger repository may still have its own — and because discovery walks up, the
nearest one wins.

**A configuration that will not parse is refused before any command runs**, naming the line.

**Both layouts are read.** A configuration with no `root:` is the old shape, where the corpus is
the directory holding the file. Nothing has to be migrated.

# Why

The old shape cost a flag on every invocation and gave nothing back. A corpus at `kb/` meant
typing `--root kb` for ever, because the file that marked the corpus was inside it and there was
no searching — the tool looked at `docs/` beneath the working directory and nowhere else. Standing
one directory down broke everything, which is a strange property for a tool used inside a
repository.

Putting the configuration where every other repository tool puts its configuration fixes both at
once: it is findable from below, and it can say where the corpus is instead of having to *be*
there.

The refusal that matters most is the one that was not asked for. While migrating this repository
the configuration was left malformed for a moment, and `molly status` reported an empty corpus and
exited `0` — because `root:` could not be read, so the corpus was taken to be the directory
holding the file, and the real one sat untouched beside it. **Reporting success over something it
never looked at is the one failure this tool exists to prevent**, and a silent fallback is how a
tool commits it. The configuration is now read once, centrally, and refused before any command
acts.

What this narrows, knowingly: two corpora can no longer sit side by side in one directory, because
one configuration names one corpus. Nesting still works and is the case that was actually wanted.

What it keeps: everything already written. The compatibility rule is one line — no `root:` means
the old meaning — and it is not a deprecation.

Filed against `specs/agent-instructions`, which tells an agent the corpus is *the directory
holding `mollyguard.yml`* and points at `docs/mollyguard.yml` for the language. Both sentences
become false here, and they are exactly the sentences an agent acts on.
`0013-a-project-s-rules-reach-every-agent` alters the same document; whichever publishes second
carries the other's wording. Both are now writing on top of
`0007-commands-every-tool-spells-its-own-way`, which replaced that specification whole — so the
`publish/` set starts from what is in `specs/agent-instructions/` today, not from the text either
of these was drafted against.
