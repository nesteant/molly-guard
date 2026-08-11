---
title: Instructions any agent can read
lang: en
capability: the-corpus
---

# What a corpus arrives with

A corpus arrives with the instructions an agent needs to work in it, in the places agents already
look, in the one format every major tool reads. `molly init` installs them alongside the corpus;
`molly agents` reinstalls them after an upgrade.

```
molly init                       the corpus, and the instructions
molly agents [--tools <list>] [--check]

.agents/skills/molly-corpus/SKILL.md      how the corpus works, and what may never be hand-edited
.agents/skills/molly-new/SKILL.md         draft a change
.agents/skills/molly-advance/SKILL.md     move it along
.agents/skills/molly-publish/SKILL.md     write what it publishes, and publish it
.claude/skills/…                          the same four
.claude/settings.json                     the molly commands, pre-authorised
```

# Everything is a skill, in the format the tools converged on

An [Agent Skill](https://agentskills.io) is a directory holding a `SKILL.md` whose frontmatter is
a `name` and a `description`. The description is loaded at startup; the body only when the model
decides the skill is relevant. That is the whole format, and it is why one installation serves
every major tool instead of one.

The alternative was a command file per vendor — `.claude/commands/*.md`,
`.github/prompts/*.prompt.md`, `.gemini/commands/*.toml` — in incompatible shapes, each a thing
to keep true and most of them untested by anybody here. The workflows are skills instead: the
same file gives `/molly-new` in Claude Code, an entry in the VS Code `/` menu, a `$` mention in
Codex and a slash command in Cursor, because all of them read one directory in one format.

**Only the two required fields are used.** `argument-hint` would be pleasant in two tools and is
a hard error on the path that packages a skill for upload; a seventh field is a bet that every
implementation ignores what it does not recognise. Two fields is the contract all of them honour,
so it is the whole contract.

# Where they are installed

Each row was read from that tool's own documentation on 2026-08-11, not from a comparison table —
two of them contradict the popular one.

| directory | read by |
| --- | --- |
| `.agents/skills/` | OpenAI Codex (its first location), Cursor, GitHub Copilot, Gemini CLI, Antigravity, Windsurf, Amp, Zed, OpenCode |
| `.claude/skills/` | Claude Code, and Cline — which reads Claude Code's directory and *not* the shared root |

The default installs both. Nine tools converged on a shared root; the two exceptions are a
matched pair, Claude Code reading only its own directory and Cline reading Claude Code's, so one
of the two defaults catches each.

A row is a claim about somebody else's software, so it goes in when their documentation says so
and not otherwise: an aggregator had Cline on the shared root and Windsurf off it, and both were
the wrong way round. The cost of believing it would have been a file written where nothing reads
it — silent, and indistinguishable from working.

The table has a row per tool rather than per directory, because "does this work with Cursor" is
the question people ask. `molly agents --tools cursor` answers it by writing the file and saying
which other tools that file just served. Two tools naming one directory write it once.

# Skills, not an instruction file

Nothing is written into `AGENTS.md`, `CLAUDE.md` or any other file a project already owns. Four
reasons, and the last one is why this is worth stating rather than assuming:

- **A root instruction file is always-on context.** Corpus work is a fraction of what happens in
  a repository, and an instruction file taxes every unrelated request with it. A skill loads on
  its description, when it is relevant.
- **Editing a file somebody else owns is invasive**, and conflicts on merge.
- **Uninstalling becomes exact**: the directories are named `molly-*`, so removing them touches
  nothing else. Removing a marked block from somebody's file is surgery.
- **It was tried.** The tool this one is a reaction to wrote marked blocks into `AGENTS.md` and
  `CLAUDE.md`, then retreated to per-tool skill directories and now strips the blocks it used to
  write. Repeating a retreat somebody else already made is the cheapest mistake to avoid.

# The skills describe the tool. The corpus describes the project.

This is the line the content is cut along, and it decides when regeneration is needed.

| a skill says | rather than | because it lives in |
| --- | --- | --- |
| read every file in `docs/decisions/` before drafting | the decisions themselves | `docs/decisions/` |
| run `molly status` for the capabilities there are | the list of them | `docs/capabilities/` |
| write prose in the corpus's language | `lang: uk` | `docs/mollyguard.yml` |

A skill that inlined any of those would be a second answer to a question the corpus already
answers, stale the moment a decision is superseded and stale **silently** — which is the failure
this whole product exists to prevent, arriving through the tooling instead of the documents.

The corpus's *location* is the one thing they cannot leave unsaid, because a corpus made with
`--root` is not at `docs/` and every path would then be read against the wrong directory. Each
skill says where to look — the directory holding `mollyguard.yml` — and writes its examples
against the default, which keeps it static while staying true anywhere. **Each says it for
itself**: only one skill may be loaded, so one that depended on another being open would be a
skill that is sometimes wrong.

Two consequences follow, and both are the point rather than a side effect. **Nothing in a skill
is corpus-derived**, so `molly agents` is an upgrade-time command: no one has to remember to
re-run it after publishing, and forgetting cannot go unnoticed because there is nothing to
forget. And **the tool directories stay out of unrelated diffs**: a publication that adds a
decision does not touch `.claude/`.

# Token cost is a design constraint, not an afterthought

Four skills, short, and they tell the agent how to find out rather than repeating what a command
would say. They do not restate `molly help`; they say to run it. The reference skill spends its
words on the small set of things a capable model gets wrong here **because another tool taught it
otherwise**: that a document is replaced whole and there is no delta format, that the tool
composes no text, and that the terminal state is reached by publishing rather than by recording.
The three workflow skills are procedures and stay under thirty lines each — every skill's name
and description load into every session that starts, so a fifth one has to earn the room.

# A session that is not interrupted to be asked

`.claude/settings.json` pre-authorises the `molly` commands. An agent that must ask permission
before every `molly status` is one that spends the session asking, and a person who has approved
the same command nine times approves the tenth without reading it — which is worse than not
asking at all. The commands are local file writes in a git working tree; the refusals are the
safety net, and the diff is the review.

Written whole when the file is absent, and otherwise **merged**: the entries that are missing are
added and everything else is left as it was. A file that will not parse is reported and left
exactly as it is — guessing at the contents of somebody's configuration is worse than saying it
could not be read.

`--check` does not look at it, deliberately. It is the one file here the tool does not own, so a
difference in it is somebody's own configuration rather than drift, and a check that failed on it
would be a check people learn to ignore.

Claude Code alone gets this, because its project settings file is the one whose location and
shape are documented. The specification's `allowed-tools` field would carry the grant into every
tool and is not used: it is a space-separated string, `Bash(npx molly:*)` contains a space, and a
permission that parses into two halves is worse than one that was never claimed.

# Why it exists

**Because instructions that live in one place stay true, and copies do not.** The same rule the
corpus holds documents to, applied to the tooling that reads it.

**Because an agent with no instructions improvises a workflow.** It will edit `docs/specs/`
directly, because that is where the text it wants to change is; it will write a delta, because
the last spec tool it saw took deltas; and it will hand-write `state:`, because that field is
right there. Each produces a corpus that looks maintained and is not.

**Because the format is settled and the directory is shared.** `.agents/skills/` is not a
convention this tool invents and then has to defend — it is where Codex looks first and where
eight others look too. Portability costs one directory, so there is no reason to make anybody
choose a model in order to have a corpus.

**And because being able to reinstall is what makes upgrading safe.** A skill describing a
command that no longer exists sends its reader to a dead end, silently, in a file nobody opens.
`molly agents --check` regenerates and compares, so an upgrade that was never followed by a
reinstall is a failing check rather than a puzzling afternoon.

# What is deliberately left undone

**The long tail of tools is not in the table.** Roo, Kilo, Junie, Qwen, Kiro, Goose, Continue and
a dozen more each read their own directory, and each is one row — but a row is a claim about
where somebody else's tool looks, and a claim nobody here has checked against that vendor's own
documentation is exactly what this corpus exists to keep out. They arrive when asked for, one
verified row at a time.

**Nothing removes what a previous version wrote.** `molly agents` installs and compares; it does
not notice a `molly-*` directory this version no longer produces, so a rename leaves an orphan
that `--check` calls current.

**Nothing verifies that the instructions were followed.** An agent that edits `docs/specs/`
directly is not refused — it shows up as a change to accumulated truth with no publication behind
it, visible in the diff a person reads. The tool approves nothing, here as everywhere.

**Skills are not translated.** They are written in English while instructing the agent to write
the corpus in its own language, which is the cheap half of the problem and the half that matters:
an English instruction produces Ukrainian documents, and a Ukrainian corpus with English
documents in it is what happens without it.
