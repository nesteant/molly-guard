# How it is built

The same boundary as everything before: `@mollyguard/core` holds what the files say and no I/O,
`@mollyguard/store` writes them, `mollyguard` parses argv and prints. The scaffolding is *data*
in core, exactly like the generated READMEs, which is what keeps it testable without a
filesystem.

# Core

**`scaffold.ts`** — the skills, and the table of tools.

```ts
SKILLS: readonly Skill[]           corpus, new, advance, publish — each holding an id, not a name
TOOLS: readonly Tool[]             a row per tool: the directories it reads, and its defaults
NAMESPACE, skillName(skill)        'molly', and the one place `molly-<id>` is spelled
skillFile(skill, merged): string   frontmatter and body, the two spec fields and nothing else
commandPath(commands, skill)       molly/new.md, or molly-new.md
commandFile(commands, skill, m)    the same body, the palette line, the shape the vendor reads
invocation(commands, skill)        /molly:new, or /molly-new
scaffoldFor(tools): ScaffoldFile[] every path and its exact content, deduplicated by path
defaultTools(), readers(dir)       what an unqualified run installs, and who each directory serves
```

**A command row is three fields and not four, because the name is not one of them.**

```ts
interface Commands {
  dir: string;                        // '.claude/commands'
  style: 'namespaced' | 'flat';       // molly/new.md, or molly-new.md
  extension: string;                  // '.md', '.prompt.md', '.toml'
  shape?: 'toml';                     // frontmatter and markdown otherwise
}
```

`style` decides the path and the same `style` decides the spelling, so `commandPath` and
`invocation` read one field and cannot disagree. The failure that rules out is an install that
prints `/molly:new` while writing the file that registers `molly-new` — a report of success over a
palette entry nobody can type.

**A skill holds an `id` rather than a name.** `molly-corpus` was a string that had to agree with a
directory name, and now has to agree with a command name as well; three spellings of one word is
two chances to be wrong. `id` is `corpus`, and `molly-corpus`, `/molly:corpus` and `/molly-corpus`
are all computed from it. A `summary` sits beside `description`: one line written for a person
reading a list, where the description's trailing *Use when…* is noise.

**A `merges` flag carries the one fact that decides whether two surfaces can coexist quietly.**
`skillFile` and `commandFile` each take it and each add one key, so the tool that would list
everything twice is the only one whose files differ from everybody else's — and they differ by a
line of frontmatter, never by a line of body.

`scaffoldFor` returns paths relative to the repository root and the bytes that belong at each,
and that is the whole of the decision-making. A pure function returning file contents can be
asserted directly, which matters more here than usual: the failure mode of this feature is a
skill that says something no longer true, and a check that had to install files to read them
would be a check nobody runs.

Two things about the shape of `TOOLS` are deliberate. It is **a row per tool, not per
directory**, so that naming a tool works and the answer to "does this work with mine" is data
rather than a paragraph; and paths therefore repeat, so `scaffoldFor` deduplicates — a writer
that reported one file twice is a writer whose count means nothing.

**Nothing reads the corpus.** No decision, capability or language is embedded, so `scaffoldFor`
takes a list of tools and nothing else.

**Covering a tool is a row.** Adding a directory needs nothing in the writer, the check or the
CLI:

```ts
{ id: 'goose',     title: 'Goose',      skills: '.agents/skills' }
{ id: 'roo',       title: 'Roo Code',   skills: '.agents/skills' }
{ id: 'openhands', title: 'OpenHands',  skills: '.agents/skills' }
{ id: 'junie',     title: 'Junie',      skills: '.junie/skills', byDefault: true,
  commands: { dir: '.junie/commands', style: 'flat', extension: '.md' } }
{ id: 'kiro',      title: 'Kiro',       skills: '.kiro/skills',  byDefault: true }
```

That is the payoff of the shape, and it is worth saying out loud: the cost of covering a new tool
is a row and an assertion, which is what makes "verified, one at a time" an affordable rule
rather than a good intention. `readers()` reports who else a directory serves and skips
directories with a single reader, so `--tools junie` says nothing beyond the path it wrote —
correct, because naming the one tool a directory belongs to says nothing its path did not.

**Where the verification lives is not the code.** Each row's source is a URL and a date, and a
comment holding sixteen links is a comment nobody re-reads — and a second answer to a question
the archive already holds. The table's comment says the rows were read from vendor documentation
on a date; the change that added them keeps the evidence. The code keeps the claim.

# Store

`scaffoldFor` emits the command files alongside the skills, deduplicated by path exactly as the
skills already are. That is the whole of the wiring: the writer, the `--check` and the report each
take a list of paths and contents, and none of them learns what a command is.

**`scaffold.ts`** — `writeScaffold` puts the files down and reports what it did: created,
replaced, or already current. Three outcomes rather than two, because "already current" is the
answer `--check` needs and a writer that could not tell them apart would make the check a second
implementation of the same comparison.

There is no exception to it. `writeScaffold` is the only writer, and every path it is handed
comes from `scaffoldFor`, which reads the tools table — so what this module writes outside the
corpus is a list somebody can read rather than a habit spread across commands.

`authorise` used to be the exception: it merged `Bash(molly:*)` into `.claude/settings.json`,
whole when absent and otherwise parsed, given only what it lacked, and left alone in any shape it
did not understand. It is gone, and its absence is what makes the sentence above true without a
clause after it. A settings file decides what runs without being asked, and a tool that writes
itself into one has approved itself.

# CLI

**`agents.ts`** — `molly agents [--tools <list>] [--check]`.

`--tools` takes the ids from the table and refuses anything else by name, listing them. With
nothing named, the default is the four directories; the remaining rows exist so that asking for
one by name works and says where it reads.

`--check` writes nothing and exits 1 if any file is absent or differs. That is the whole of it:
an upgrade that was never followed by a reinstall leaves a skill describing commands that have
moved on, and this is what makes that a failing check rather than a slow afternoon. It does not
repair what it finds — a check that repaired would be an install, and nobody would know which
they had run. It verifies what it would install, which is why coverage and defaulting are the
same decision.

**`init.ts`** calls it, because installing the tool and scaffolding the corpus are one act from
where the person is standing.

# What proves it

In `scripts/smoke.sh`, under `agents`. The assertions divide in two: that the files arrive where
each tool reads, and that they say what they must and nothing they must not. The second half
matters more, because a skill with the wrong content is indistinguishable from a right one until
somebody follows it.

**That they arrive, in all four directories.** All four skills under each root, the grants named
rather than written, and `molly agents` reporting *already current* the second time. The
default install writes **twenty-eight** — sixteen skills, plus four commands for each of the three
default roots that has a palette. A count is what catches a directory added without anybody
deciding to add it, and a count that ever reads thirty-two is a command file written into the
shared root, where nothing types.

**That the settings file is never touched.** Absent, it stays absent. Present, it is
byte-identical afterwards — including one that will not parse, which is not read at all. And the
grants are still named, so the convenience is asserted to have survived the write not happening.

**That nothing foreign is left behind.** `init` and `agents` are run into empty directories and
everything each leaves is walked: the corpus, `mollyguard.yml`, or a `molly`-namespaced path, and
no fourth kind. Each assertion names a file count it has to beat before it may pass — a run that
wrote nothing leaves nothing foreign either, and the naive form of this check is green on a
command that crashed.

**That naming a tool answers "does this work with mine".** `--tools junie` writes the JetBrains
directory and **not** the shared root; `--tools kiro` the same; `--tools cline` writes Claude
Code's directory and not the shared root; `--tools agents` writes the vendor-neutral one and not
the Claude one. All four are asserted as absences, because those are the rows a tidy-minded person
would fold into the majority, and nothing but an absence catches that. `--tools roo,openhands`
writes four files, not eight, and an unknown id is refused by name.

**That both spellings land, and that the run says which.** `.claude/commands/molly/new.md` and
`.kiro/prompts/molly-new.prompt.md` both exist after an install, and `--tools claude` prints
`/molly:new` where `--tools cursor` prints `/molly-new`. The printed spelling and the written path
come from one field, so an assertion that reads the output has read the path. `--tools codex`
leaves no `.agents/commands` behind, and Gemini's file contains `prompt = ` rather than markdown.

**That the two surfaces hold one body, and that neither reader is shown four things twice.** The
body of Claude Code's skill and the body of its command `diff` clean; the skill carries
`user-invocable: false` and the command `disable-model-invocation: true`. Those last two are
asserted apart rather than together, because they fail apart: the first alone leaves the model
reading eight descriptions, the second alone leaves the menu holding eight entries, and either
looks exactly like a working install from the other side. **And the keys go nowhere else** — the
shared root's skill does not carry `user-invocable`, and Junie's command does not carry
`disable-model-invocation`, which is the pair that catches a tidy-up folding two files into one.

**That every skill is a valid Agent Skill**, since that is what makes one installation serve every
major tool: frontmatter of `name` and `description`, `name` matching its directory, a
`molly-` prefixed lowercase directory name, a non-empty description within the 1024-character
limit, and no `: ` inside it — which would end the value early and leave every reader with
frontmatter that means something else. These run over the generated skills rather than over one
directory, so a new root is covered the moment it is written, and they are asserted at a new root
specifically: a root that received files but not *these* files is the failure a file count would
call a success.

**That the skills carry the rules a model would otherwise break.** Each is a sentence somebody
could delete without any other test noticing: that `docs/specs/` is not edited directly, that a
document is replaced whole and there is no delta format, that the tool composes no text, that
`published` is reached by publishing, and that the three places truth lives are named. Every skill
says how to find the corpus, and the trigger is not tied to `docs/`.

**And that they carry no fact the corpus holds.** Over a corpus with a capability, a decision and
a language other than English, no generated skill contains a capability name, a decision name or
the language tag. These are the refutations that protect the design: a copy is stale the moment
the answer changes, silently, because an agent cannot tell a superseded decision from a current
one.

`--check` exits 0 on a fresh install across all four directories, 1 with a skill edited by hand —
naming the file, leaving it as it was — and 1 rather than crashing with nothing installed. A
newline appended to a command file fails it too, and is named: without that, the whole second
surface would sit outside the thing that keeps the first one current. A hand
edit inside a newly added root fails it, which is the assertion that earns the default: the only
difference between an installed root and a checked one is `byDefault`. The commands named in every
skill are checked to exist, and the line counts are asserted, because a limit nothing checks is
one that is exceeded by the third person who adds a helpful paragraph.
