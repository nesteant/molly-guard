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
.agents/skills/molly-roadmap/SKILL.md     read the plan, and draft what is next from it
.claude/skills/…  .junie/skills/…  .kiro/skills/…      the same five

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
default install writes thirty-five files and never forty. The other four arrive when their
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
| write prose in the corpus's language | `lang: uk` | `mollyguard.yml` |
| read `docs/conventions.md`, where there is one | this project's own rules | `docs/conventions.md` |

A skill that inlined any of those would be a second answer to a question the corpus already
answers, stale the moment a decision is superseded and stale **silently** — which is the failure
this whole product exists to prevent, arriving through the tooling instead of the documents.

The corpus's *location* is the one thing they cannot leave unsaid, because a corpus made with
`--root` is not at `docs/` and every path would then be read against the wrong directory. Each
skill says where to look — `mollyguard.yml` sits at the top of the repository and names the
corpus directory, as [finding the corpus](../finding-the-corpus/spec.md) sets out — and writes its
examples against the default, which keeps it static while staying true anywhere. **Each says it
for itself**: only one skill may be loaded, so one that depended on another being open would be a
skill that is sometimes wrong.

That sentence is also the one place a skill can go quietly wrong about the tool rather than about
the project, and it has. The configuration moved out of the corpus and the skills kept pointing
inside it for the language — a path that resolves in a corpus written before the move and nowhere
else. Nothing failed: `molly agents --check` compares what is installed against what this version
generates, and both said the same wrong thing. **A check that regenerates cannot notice a claim
the generator is also making**, which is why the paths a skill names are asserted against a real
corpus rather than against the text they came from.

Two consequences follow, and both are the point rather than a side effect. **Nothing in a skill
is corpus-derived**, so `molly agents` is an upgrade-time command: no one has to remember to
re-run it after publishing, and forgetting cannot go unnoticed because there is nothing to
forget. And **the tool directories stay out of unrelated diffs**: a publication that adds a
decision does not touch `.claude/`.

# A project's own rules reach every agent, or they reach none of them

**A project writes its own rules for working in its corpus into `docs/conventions.md`, and every
skill points at it.** MollyGuard's guidance is how the tool works; that file is how *this*
repository uses it, and the skills say which wins: where the two differ, the project does.

**And the corpus arrives with the file**, empty of opinions. `molly init` writes it beside the
area explainers, with headings and a line saying what belongs under each — and not one
convention, because `init` seeds no example anywhere else and this is the file where a seeded
opinion would be worst: whatever a template showed would become every corpus's rule. A project
that leaves it as it is has no rules of its own beyond the tool's, which is a real answer and
the common one.

That half was missing for a release, and the way it failed is the argument for it. The pointer
said *`docs/conventions.md`, if it is there*, and nothing anywhere told anybody to put it there.
In the first repository to adopt the mechanism the skills were installed and current, the file
did not exist, and that project's rules were half of a `CLAUDE.md` — reaching one of the four
directories `molly agents` writes into, arriving as always-on context at session start, and least
salient exactly when a change was being drafted. Which is the failure this section exists to
prevent, arriving one step earlier than this section was looking.

**The rest of its rules went into the files the tool generates.** That corpus's `README.md`
carried a section stating how work moves from plan to knowledge; its `roadmap/README.md` had been
replaced outright, taking the tool's own explanation of the area with it. Both are written by
`molly init` and never revisited, so the project put its rules in the only place that looked
official. **A convention with nowhere to live does not stop existing — it moves somewhere worse**,
and somewhere worse is a file where nobody can tell the project's words from the tool's.

**A pointer whose target is absent teaches that the pointer is decorative**, which is the cost
underneath both. An agent that has learned one instruction is decorative reads the next one the
same way.

**`molly agents` names it when it is missing**, once, in the summary. That is the upgrade path
for a corpus made before the file existed, because `init` writes it and `init` is the one command
an existing corpus cannot run. It reads nothing from the corpus but whether a single path exists,
it never refuses, and it says nothing at all where there is no corpus to ask — this command has
to work in a repository nobody has initialised.

**It is never a finding in `molly status`.** A project with no conventions is not a corpus with a
problem, and a listing that nags about an optional file teaches people to read past its findings.
The install is the moment the sentence is actionable, because it is the moment the pointer was
written.

**The path is fixed, and there is no `conventions:` key.** Four generated skills name it, and a
configurable path is a path the config and the skills can disagree about — the skills being what
an agent actually reads. So there is nothing to declare.

Saying so is the whole value of the pointer. A skill that mentions a file without ranking it
against its own contents leaves an agent to decide, and an agent deciding between two sets of
instructions will follow the one in front of it.

It is read at the two moments it is needed — in the reference skill, among the things read before
writing, and in the drafting skill, because drafting is when a project's conventions bind hardest.

**It is a pointer and never a copy**, and writing the file changes nothing about that: `init`
places an empty invitation once and no command reads what ends up in it. This is the same rule as
every other row in the table above and the reason this was buildable at all. Composing `conventions.md` into each installed
skill is the obvious implementation and the one thing this must not do: it would put corpus
content into the tooling, stale the moment the file changes and stale silently, times four skills
times four tool directories. The skills already point at `docs/decisions/` without holding them.
This is one more pointer of the same kind, and it can never drift.

**The problem it solves is coverage, and the shape of it is worth stating.** A project's
conventions had one place to live and it was a single tool's instruction file. `molly agents`
installs into four directories; the rules reached one of them, so an agent driven by any other
tool got MollyGuard's rules, none of the project's, and behaved confidently and wrongly — which is
the failure this specification exists to prevent, one layer up. They also arrived at the wrong
moment: always-on context at session start, competing with everything else, and least salient
exactly when a change was being drafted. A pointer inside a skill arrives when the work does.

# What the documents do not answer is written down, not guessed

The drafting skill carries one further instruction: **never guess at what the documents do not
answer.** Write the unknown into `change.md` under *What is not settled* and stop — locally, ask;
unattended, exit non-zero.

**The heading is scaffolded rather than left to be invented**, which is the half that was missing.
An instruction to write something under a heading of its own asks an agent to compose a heading at
the moment it is least sure of anything, and the cheapest way to comply is not to have an unknown.
`molly change new` now writes the heading, so complying is filling in a section that is already
there. See [creating a change](../creating-a-change/spec.md) § *What a change cannot answer is part
of the change*, where the heading and what it does to an answer are specified; here it matters only
because the skill's sentence has to name a heading that exists.

**And it says plainly that nothing in the tool refuses a change for holding one.** That sentence
is there because the alternative is worse than silence: an agent told *the tool will stop you*
about something the tool does not stop is an agent that stops trusting the rest of the
instructions. What the tool refuses and what it merely advises are stated separately, and where a
skill advises it says so.

Nothing needs to refuse it. The unknown goes where every other sentence in a change goes, and the
gate is the approval phase — a person declining to advance a change they can see is unresolved.
The engine owns the vocabulary and the record; *is this resolved enough to proceed* is process,
and process is not the engine's.

**This is what is left of a larger idea that was built and then removed.** Unanswered questions
were briefly first-class: a command, an append-only log, a hash pinning each answer to the
documents it was given against. It was wrong, and the reason generalises. A question is *text*, so
a question appearing and being resolved is a diff — and git already records that, with author,
timestamp and the surrounding context, better than a second log could. Worse, the feature most
defended in it, detecting an answer that never reached the documents, solved a problem that
existed only because there was a second place to record answers.

**The skill also says where the answer lands, and that is the part the removal left unsaid.** An
answer is recorded by rewriting the document it belongs in and deleting the question. Without that
sentence the instruction is complete about stopping and silent about resuming, and what happened in
the first repository to adopt it is that three questions were asked, answered in a chat window, and
reached the documents only because a person asked for them a second time. This costs one clause and
needs nothing from the engine, because a question and its answer are both text and both go where
text goes.

# What a phase works from, and what it leaves closed

Every other rule here fires in front of somebody **writing**. This is the one that fires in front
of somebody **reading**, and it was missing because a read is the move nothing notices: it leaves
no artefact, fails no check, and produces work that looks better for having been informed by it.
So the cheapest thing an agent can do is find the nearest prose of the right shape — and in a
corpus that archives every change it has ever published, the nearest prose of the right shape is a
retired one.

The rule is that a document belongs to a phase, and it is stated in three places because it is
broken in three:

**`history/` is closed.** An archived change is sealed against editing and against re-checking,
and that was said in the area explainer with reading left out — two thirds of a seal, read as a
whole one. It is now stated with its destination in the same breath, because a prohibition needs
one: what is in force is `specs/` and `decisions/`, what exists is what `molly status` lists, what
is intended is `roadmap/`. Those are the three questions an archived change gets opened to answer
and each has an answer that is current.

**Implementation works from the change's own four documents.** The knowledge base is read while a
change is drafted, which is when it binds, and `plan.md` is what that reading produced. A plan
that turns out to be wrong is not edited from inside the work: the change moves **back**, which is
already how work reopens, and is rewritten where it can be re-approved. A *published* specification
found wrong is a **new** change, because one claim per change and the claim has moved. Both
mechanisms already existed; what was missing was the sentence saying when each applies.

**The payload is not a task.** `publish/` holds what a change puts into the knowledge base and is
written when the work is done. Two skills were each unambiguous about that — payload authoring is
`molly-publish`'s step 2, and `molly-advance` says to publish once the work is done and the
documents are written — and the artefact between them belonged to neither, so `tasks.md` was where
the wrong phase claimed it. Writing it early costs twice: it switches on the stricter check that
every path a change's prose names must resolve, weeks before the documents being named are filed;
and it forces an author to predict an ordinal the tool allocates, which the corpus tells them
everywhere else never to read off a directory listing.

**None of it is checked**, and the reason is the one this whole specification gives: a check fires
after the writing, and a read has no artefact for one to fire on at all. Making the seal executable
was proposed with the strongest evidence any proposal has arrived with — the archive was breached
by the very session auditing for this class of defect, whose method was a sweep of archived task
lists — and it is refused on scope rather than on the evidence. A hook is a third kind of file
outside a corpus where the harness asserts there are two; it needs an entry in a settings file this
tool took itself out of on principle; and it is precisely the verification named as left undone
below. The instrument belongs to the project, in the harness the project controls and can remove in
a file somebody reviews, which is what `conventions.md` is for.

# Which surface carries a rule is decided by where the rule is broken

Three surfaces say something to whoever fills in a document, and the choice between them used to be
habit. A **template** is the text in front of an author at the keystroke where a rule is broken. A
**skill** is what a model has open while it decides what to do. An **area explainer** is the model
stated once, for somebody reading the corpus to understand it.

So a rule goes on the surface whose reader meets it at the moment it binds, and on as few of them as
that allows. Repetition is not free here — every skill's name and description load into every
session that starts, and a rule stated twice is a rule that can be corrected once.

| rule | surface | because |
| --- | --- | --- |
| the reader of each document, and where a sentence that fails it goes | the templates, then one line each in `molly-new` and the `changes/` explainer | it binds per sentence, which is the template's moment — and the skill cannot name the four documents at all without saying what each is for |
| revising is rewriting | the templates, and `molly-new` | it binds in a *second* session, by which time the template's prose has been replaced by the document — so the skill carries what the template can no longer say |
| how a correction reaches a filed document | `molly-corpus` | it binds when somebody has a correction and the filed file open, which is not while a change is being drafted |
| the frontmatter a document carries | `molly-corpus` and `molly-publish` | it binds while a payload is written, and once more in the reference skill because a change's own record is written by the command and never by hand |
| the archive is closed | `molly-corpus`, and the `history/` explainer | it binds *before* any document is open, when an agent is deciding where to look — the reference skill is the only surface loaded then, and the explainer is where the seal was already stated one word short |
| what implementation works from | `molly-advance` | it binds at the transition that crosses the boundary, which is the one moment that skill is loaded and the one moment moving the change back is still cheap |
| the payload is not a task | the `tasks.md` template, and `molly-new` | it binds at the keystroke where a task is written — and the skill carries it too because a task list is rewritten in later sessions, when the template's prose has been replaced by the document |

**A prohibition needs a destination, and that is where this showed.** `docs/specs/` and
`docs/decisions/` may not be edited by hand. The rule is in the reference skill, in the area
explainer, and in most projects' own conventions — and it is broken anyway, by agents that read all
three the same session. It is not broken for want of being said. It is broken because it was said as
*never*, to somebody holding a two-line correction whose only offered alternative was four
documents, a payload, an ordinal and a state transition. The skill now carries the positive form —
copy the document into the change's `publish/` at the same path and edit the copy — so the
instruction ends in an action rather than in a refusal the reader has to find their own way out of.

The closed frontmatter record is worded from the same test. *Match your neighbours* needs a survey,
and returns a different answer in a corpus whose neighbours disagree — which is the corpus that
produced the complaint. **A published document carries `title`, `lang` and, in `specs/`,
`capability`** returns the same answer everywhere, including for the first document an area ever
holds. It is stated rather than checked for the reason this whole section is about: the moment a
rule about frontmatter can be followed is the moment somebody is writing frontmatter, and a finding
raised at publish arrives after all of them.

# Token cost is a design constraint, not an afterthought

Five skills, short, and they tell the agent how to find out rather than repeating what a command
would say. They do not restate `molly help`; they say to run it. The reference skill spends its
words on the small set of things a capable model gets wrong here **because another tool taught it
otherwise**: that a document is replaced whole and there is no delta format, that the tool
composes no text, and that the terminal state is reached by publishing rather than by recording.
One entry is there for a different reason, and the difference is worth keeping in view — where a
correction goes is got wrong by models that were taught nothing at all about this tool, because
editing the filed file is simply the cheaper act. A rule competing with an economy has to name the
alternative and not only forbid the shortcut.
The four workflow skills are procedures and stay under thirty lines each — every skill's name and
description load into every session that starts, so each one has to earn the room, and the cap is
asserted rather than intended. The reference skill has a cap of its own, and it is sixty-four
rather than sixty because of the section above. **What a cap weighs against is not the same for a
body as for a description.** A name and a description load into every session; a body loads only
once a model has decided the work is ours. So the four lines that close the archive are weighed
against the sessions already doing corpus work, and in those the thing they stop an agent loading
is an archived change bundle — four documents and a payload, any one of which is longer than the
whole skill. That is the only kind of argument that should move one of these numbers, and it is
recorded here so the next one has to make it too.

**`molly-roadmap` is the one that earned it.** The others describe a command's procedure; this one
describes how to *read* something the tool deliberately does not parse. A roadmap slice states in
prose which feature comes next and why, and without a skill saying so an agent asked to draft the
next change has no reliable way to find out what next means — it guesses, or it asks. That is not
a parsing problem and must not be solved by making the engine read a body: the template writes the
shape, the skill reads it, and the two are an agreement nothing checks.

It also carries the prohibitions, which is the half a command cannot enforce: never invent a
feature the slice does not name, never reorder or reprioritise unasked, never mark a feature done
that has not published. A plan is somebody's judgement about their own work, and an agent
rewriting it silently is the same failure as a tidying operation rewriting a reference.

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
it, visible in the diff a person reads. The tool approves nothing, here as everywhere. **Nor is
anything enforced in the harness**, which is the form the request now takes: a `PreToolUse` hook
refusing a read reaches where a check cannot, and it is still refused, because writing one means
either an inert file nobody wired or an entry in the settings file this tool named-and-did-not-write
on purpose. A project that wants the floor writes it itself, and removes it in a file somebody
reviews.

The pressure to change that is recorded here rather than left to be re-derived. The first corpus to
adopt these instructions asked for three checks, each written after an agent had done the thing the
check would have caught: a filed document compared against the archive of what published it, a
document's frontmatter compared against its neighbours', and a change's documents compared against
themselves across a transition. All three are refused, and two reasons generalise past the
individual cases. **A check fires after the writing**, in a session that has usually ended, about a
document nobody is looking at any more — while every rule in this specification fires in front of
somebody who is writing. And **each of the three grows what the tool reads**, from a frontmatter
block towards a document body, which is the property the rest of this design spends its refusals
protecting.

**Skills are not translated.** They are written in English while instructing the agent to write
the corpus in its own language, which is the cheap half of the problem and the half that matters:
an English instruction produces Ukrainian documents, and a Ukrainian corpus with English
documents in it is what happens without it.
