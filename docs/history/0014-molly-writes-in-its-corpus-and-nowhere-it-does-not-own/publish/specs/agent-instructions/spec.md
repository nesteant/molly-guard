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
.claude/skills/…  .junie/skills/…  .kiro/skills/…      the same four

.claude/commands/molly/new.md             typed as /molly:new
.junie/commands/molly-new.md              typed as /molly-new
.kiro/prompts/molly-new.prompt.md         typed as /molly-new
```

Nothing else. Every path is `molly`-namespaced, so an install can be removed without surgery on
anything of somebody else's — and the harness walks what was written and fails on a path that is
not one of these.

`--tools gemini,cursor,copilot,opencode` adds the four further palettes those tools read.

# Two surfaces, and one body between them

An [Agent Skill](https://agentskills.io) is a directory holding a `SKILL.md` whose frontmatter is
a `name` and a `description`. The description is loaded at startup; the body only when the model
decides the skill is relevant. That is the whole format, and it is why one installation serves
every major tool instead of one.

That is the right surface for somebody who has never read this README and describes what they
want in their own words. It is the wrong one for somebody who knows exactly what they want: they
have to describe the work to get the thing they could have named, and a description can miss. So
beside the skills go **command files**, in the seven directories whose tools read one.

The two shapes are the two answers vendors gave to the same question. **Claude Code and Gemini
CLI** turn a subdirectory into a prefix, so `commands/molly/new` registers `molly:new`; **Cursor,
GitHub Copilot, OpenCode, Junie and Kiro** take the filename whole, so the prefix has to be inside
it — `molly-new`. The name is declared in no file: every one of these tools reads it off the path,
which is why the install prints the spelling it just made typable rather than leaving it to be
guessed.

**Both surfaces carry the same body, byte for byte**, from the same table. What differs is one
line of frontmatter: a skill's `description` ends in the conditions under which a model should
load it, and a command's is that sentence with the half removed, because the reader of a palette
has already chosen and is looking for the entry they meant. A command that grew a line of its own
would be a second answer to a question the skill already answers, stale the moment either moves.

**A command file per vendor was rejected once, and the trade was read the wrong way round.** The
objection was four incompatible shapes to keep true, most of them untested by anybody here. But
the shapes differ in a path and a frontmatter key, not in the text, and the text was already one
string in one table. The cost of the second surface is the table, and the table was already
there.

**Only the two required skill fields are used.** `argument-hint` would be pleasant in two tools
and is a hard error on the path that packages a skill for upload; a seventh field is a bet that
every implementation ignores what it does not recognise. Two fields is the contract all of them
honour, so it is the whole contract.

# One action is one entry, in each of the two places an entry can appear

Claude Code reads both directories into a single namespace — a file under `commands/` *is* a skill
there — so a tool given both surfaces would offer `/molly:new` and `/molly-new` side by side, and
describe four things to the model twice over. Its two copies say which half each is for: the skill
is `user-invocable: false`, out of the menu and still in the model's context with the description
written for it; the command is `disable-model-invocation: true`, in the menu and out of the
context.

**Those two keys go into that tool's copy only.** They are Claude Code's, and no other tool merges
the two namespaces. Writing them into the shared root would be a claim about how twelve other
implementations treat a key their own specification does not have, and the install has nothing to
gain that would make that claim worth holding.

# Four directories, and sixteen tools

Every row was read from that vendor's own documentation on 2026-08-11, not from a comparison
table — three of them contradict the popular one.

| directory | read by |
| --- | --- |
| `.agents/skills/` | OpenAI Codex (its first location), Cursor, GitHub Copilot, Gemini CLI, Antigravity, Windsurf, Amp, Zed, OpenCode, Goose, Roo Code, OpenHands |
| `.claude/skills/` | Claude Code, and Cline — which reads Claude Code's directory and *not* the shared root |
| `.junie/skills/` | Junie, which ships inside every JetBrains IDE and looks nowhere else |
| `.kiro/skills/` | Kiro, the same shape |

All four are installed by default. Junie and Kiro each have an open request to read the shared
root, and an open request is not a location: a file written where nothing reads it is silent, and
indistinguishable from working.

**They are defaults rather than something to ask for, because `molly agents --check` verifies
only what it would install.** A directory installed by name and then left out of the default is
one that never gets checked and never gets upgraded — a skill describing a command that has moved
on, in exactly the failure mode the check exists to catch. The cost is eight further files of
about a kilobyte each, inert for anybody not running that tool. The benefit is that somebody
working in a JetBrains IDE gets instructions without first having to know they must ask.

A row is a claim about somebody else's software, so it goes in when their documentation says so
and not otherwise: an aggregator had Cline on the shared root and Windsurf off it, and both were
the wrong way round.

Seven of those tools also read a command directory, and each path was read the same way:

| directory | shape | typed as |
| --- | --- | --- |
| `.claude/commands/molly/` | markdown | `/molly:new` |
| `.gemini/commands/molly/` | TOML | `/molly:new` |
| `.cursor/commands/` | markdown | `/molly-new` |
| `.github/prompts/` | markdown, `.prompt.md` | `/molly-new` |
| `.opencode/commands/` | markdown | `/molly-new` |
| `.junie/commands/` | markdown | `/molly-new` |
| `.kiro/prompts/` | markdown, `.prompt.md` | `/molly-new` |

Three arrive by default — Claude Code, Junie and Kiro — because they are the three default roots
that have a palette. The shared root is a directory rather than a palette and has none, so a
default install writes twenty-eight files and never thirty-two. The other four arrive when their
tool is named. **A tool whose command directory has not been verified gets its skills and nothing
invented**: an unwritten palette entry is missing, and a wrong one is a file that writes, reports
success, and is never typable.

The table has a row per tool rather than per directory, because "does this work with Cursor" is
the question people ask. `molly agents --tools cursor` answers it by writing the file and saying
which other tools that file just served. Two tools naming one directory write it once.

**Two tools are deliberately absent.** Kilo Code documents `.agents/skills/` and has an open
report that it does not load from it — documentation is the standard for admitting a row, and a
contradicted claim does not meet it. Qwen Code reads `.qwen/skills/` and nothing else, which is a
fifth directory for one tool, and it waits until somebody wants it.

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

# A session that is not interrupted to be asked, and who does the asking

An agent that must ask permission before every `molly status` is one that spends the session
asking, and a person who has approved the same command nine times approves the tenth without
reading it — which is worse than not asking at all. The commands are local file writes in a git
working tree; the refusals are the safety net, and the diff is the review. Pre-authorising them
is right.

**The tool names the grant and does not make it.** `molly agents` prints the file and the two
permissions — `Bash(molly:*)` and `Bash(npx molly:*)` — and writes neither.

This once merged them in, and merged them carefully: whole when the file was absent, otherwise
parsed, given only the entries it lacked, and left exactly as it was in any shape it did not
understand. Careful was not the point. That file decides what runs without being asked; its
contents are somebody's judgement about risk; and a tool that adds itself to it has approved
itself in the one place that exists to approve it. Doing that helpfully makes it harder to
notice, not more defensible.

The file is not read either. Reporting a settings file that would not parse meant opening one,
and there is nothing in there this tool has any business having an opinion about. Both the
absence and the byte-identity of an existing file are asserted.

What it costs is ten seconds of pasting, against a grant the person has read — which is the
difference between approving something and finding it approved.

Claude Code is named because its project settings file is the one whose location and shape are
documented. The specification's `allowed-tools` field would carry the grant into every tool and
is not used: it is a space-separated string, `Bash(npx molly:*)` contains a space, and a
permission that parses into two halves is worse than one that was never claimed.

# Nothing outside the corpus that is not this tool's own

There are two kinds of file MollyGuard writes outside a corpus and there is no third: the one
that says where the corpus is, and the `molly`-namespaced instructions above. Both are its own,
both are named by a table, both can be deleted without touching anything else.

The rule is not a promise. The harness runs `init` and `agents` into empty directories and walks
what each leaves behind, failing on any path that is not the corpus, not `mollyguard.yml`, and
not `molly`-namespaced — and refusing to pass at all on a run that wrote too little to have been
a run, because an absence is always one line away from being green on a command that crashed.

# Why it exists

**Because instructions that live in one place stay true, and copies do not.** The same rule the
corpus holds documents to, applied to the tooling that reads it.

**Because an agent with no instructions improvises a workflow.** It will edit `docs/specs/`
directly, because that is where the text it wants to change is; it will write a delta, because
the last spec tool it saw took deltas; and it will hand-write `state:`, because that field is
right there. Each produces a corpus that looks maintained and is not. That argument does not
weaken for the reader who happens to use a JetBrains IDE, which is why coverage is a feature
rather than a courtesy.

**Because the format is settled and the directory is shared.** `.agents/skills/` is not a
convention this tool invents and then has to defend — it is where Codex looks first and where
eleven others look too. Portability costs one directory, so there is no reason to make anybody
choose a model in order to have a corpus.

**Because coverage is a claim, and it decays.** "Every major tool" was true against twelve rows
and false against sixteen, and nothing in the tool could have noticed: where somebody else's
software looks is a fact that goes stale from the outside. Two of the four tools examined most
recently read a directory nobody would have guessed, and one documents a directory it does not
honour. That ratio is what makes reading the vendor the rule rather than the scruple.

**And because being able to reinstall is what makes upgrading safe.** A skill describing a
command that no longer exists sends its reader to a dead end, silently, in a file nobody opens.
`molly agents --check` regenerates and compares, so an upgrade that was never followed by a
reinstall is a failing check rather than a puzzling afternoon.

# What is deliberately left undone

**A command path is a claim that decays more quietly than a skill path.** A skill in the wrong
place is a model that never mentions MollyGuard; a command in the wrong place is a palette entry
that was never there to be missed. `molly agents --check` catches drift in what this version
writes and cannot notice a vendor moving a directory — that arrives the way the rows did, as one
report against one vendor's documentation.

**The tail is still a tail.** Continue, Augment, Warp, Trae and others each read a directory of
their own and none has been checked. They arrive the same way these did: one row, one vendor's
documentation, one assertion.

**Nothing removes what a previous version wrote.** `molly agents` installs and compares; it does
not notice a `molly-*` directory this version no longer produces, so a rename leaves an orphan
that `--check` calls current. A corpus set up when the default was two directories has two where
the default now writes four — re-running `molly agents` is the whole of that upgrade, and nothing
goes stale in the two that already existed.

**Nothing verifies that the instructions were followed.** An agent that edits `docs/specs/`
directly is not refused — it shows up as a change to accumulated truth with no publication behind
it, visible in the diff a person reads. The tool approves nothing, here as everywhere.

**Skills are not translated.** They are written in English while instructing the agent to write
the corpus in its own language, which is the cheap half of the problem and the half that matters:
an English instruction produces Ukrainian documents, and a Ukrainian corpus with English
documents in it is what happens without it.
