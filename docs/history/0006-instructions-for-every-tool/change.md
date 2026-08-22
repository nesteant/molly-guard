---
title: Instructions reach every major tool
lang: en
kind: feature
capability: the-corpus
state: published
alters: []
---

# What this change makes true

`molly agents` installs into **four** directories rather than two, and the table names sixteen
tools rather than twelve. Every row was read from that vendor's own documentation on 2026-08-11.

```
molly agents                     .agents/skills  .claude/skills  .junie/skills  .kiro/skills
molly agents --tools junie       the JetBrains directory, and it says so
```

## The two directories were not every major tool, and the claim had to be checked to find out

The previous change said the shared root and Claude Code were "every major tool rather than a
sample of them". Re-reading the vendors said otherwise: two majors read neither.

| directory | read by | new here |
| --- | --- | --- |
| `.agents/skills/` | OpenAI Codex (its first location), Cursor, GitHub Copilot, Gemini CLI, Antigravity, Windsurf, Amp, Zed, OpenCode | Goose, Roo Code, OpenHands |
| `.claude/skills/` | Claude Code, Cline | |
| `.junie/skills/` | Junie | **the directory itself** |
| `.kiro/skills/` | Kiro | **the directory itself** |

**Junie ships inside every JetBrains IDE**, and its documentation is explicit that
`.junie/skills/` is the only place it looks. **Kiro** is the same shape at `.kiro/skills/`. Both
have an open request to read the shared root, and an open request is not a location: a file
written where nothing reads it is silent, and indistinguishable from working.

The three additions to the shared root cost nothing — those files are already written. They are
rows because "does this work with mine" is answered by a row, and Goose, Roo Code and OpenHands
were absent from a directory they have always read.

## Why they are installed by default rather than asked for

Because the alternative leaves the files nothing maintains. `molly agents --check` verifies the
tools it would install, so a directory installed by name and then left out of the default is one
that never gets checked and never gets upgraded — a skill describing a command that has moved
on, in exactly the failure mode `--check` exists to catch.

The cost is eight further files of about a kilobyte each, in directories that are inert for
anybody not running that tool. The benefit is that somebody working in a JetBrains IDE gets
instructions without first having to know that they must ask for them, which is the whole
argument for installing anything.

## Two rows were left out on purpose, and one is the interesting one

**Kilo Code** documents `.agents/skills/` and has an open report that it does not load from it.
Documentation is the standard for admitting a row, and a contradicted claim does not meet it.

**Qwen Code** reads `.qwen/skills/` and nothing else; the request for the shared root is open.
It is a fifth directory for one tool, and it waits until somebody wants it.

Both stay in the roadmap with what was found, so the next person starts from the finding rather
than from the search.

# Why

**Because a corpus whose instructions one tool cannot find is a corpus that tool works in
blind.** It will edit `docs/specs/` directly, write a delta, and hand-write `state:` — each
producing a corpus that looks maintained and is not. That was the argument for installing
instructions at all, and it does not weaken for the reader who happens to use a JetBrains IDE.

**Because "every major tool" is a claim, and it decayed.** It was true against twelve rows and
false against sixteen, and nothing in the tool could have noticed: coverage is a fact about
somebody else's software, so it goes stale from the outside. Checking it is the only way to
know, and the finding is worth recording where the claim was made.

**Because a verified row is cheap and a guessed row is a silent failure.** Two of the four
tools examined here read a directory nobody would have guessed, and one documents a directory
it does not honour. That is the ratio which makes reading the vendor the rule rather than the
scruple.

## What is deliberately left undone

**The tail is still a tail.** Continue, Augment, Warp, Trae and others each read a directory of
their own and none was checked here. They arrive the same way these did: one row, one vendor's
documentation, one assertion.

**Nothing removes what a previous version wrote.** Unchanged and still recorded in the roadmap —
and this change makes it slightly more likely to bite, because a corpus installed before it has
two directories where the default now writes four. Re-running `molly agents` is the whole of the
upgrade; nothing goes stale in the two that already existed.
