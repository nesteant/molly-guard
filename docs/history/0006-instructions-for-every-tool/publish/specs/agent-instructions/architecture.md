# How it is built

The same boundary as everything before: `@mollyguard/core` holds what the files say and no I/O,
`@mollyguard/store` writes them, `mollyguard` parses argv and prints. The scaffolding is *data*
in core, exactly like the generated READMEs, which is what keeps it testable without a
filesystem.

# Core

**`scaffold.ts`** — the skills, and the table of tools.

```ts
SKILLS: readonly Skill[]           molly-corpus, molly-new, molly-advance, molly-publish
TOOLS: readonly Tool[]             a row per tool: where it reads, and whether it is a default
skillFile(skill): string           frontmatter and body, the two spec fields and nothing else
scaffoldFor(tools): ScaffoldFile[] every path and its exact content, deduplicated by path
defaultTools(), readers(dir)       what an unqualified run installs, and who each directory serves
```

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
{ id: 'junie',     title: 'Junie',      skills: '.junie/skills', byDefault: true }
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

**`scaffold.ts`** — `writeScaffold` puts the files down and reports what it did: created,
replaced, or already current. Three outcomes rather than two, because "already current" is the
answer `--check` needs and a writer that could not tell them apart would make the check a second
implementation of the same comparison.

`.claude/settings.json` is the exception and is handled apart. It is the one file here the tool
does not own, so it is written whole only when absent, and otherwise parsed, given the entries it
lacks, and written back.

It is merged **only into the shape it understands**. A file that will not parse is reported and
left alone, and so is one whose `permissions` is not an object or whose `allow` is not a list —
spreading a string would scatter it character by character into an object, and both losses would
be silent, in a file holding somebody else's decisions.

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

**That they arrive, in all four directories.** All four skills under each root, the settings file
pre-authorising the commands, and `molly agents` reporting *already current* the second time. The
default install writes **sixteen** files — a count is what catches a directory added without
anybody deciding to add it.

**That naming a tool answers "does this work with mine".** `--tools junie` writes the JetBrains
directory and **not** the shared root; `--tools kiro` the same; `--tools cline` writes Claude
Code's directory and not the shared root; `--tools agents` writes the vendor-neutral one and not
the Claude one. All four are asserted as absences, because those are the rows a tidy-minded person
would fold into the majority, and nothing but an absence catches that. `--tools roo,openhands`
writes four files, not eight, and an unknown id is refused by name.

**That every skill is a valid Agent Skill**, since that is what makes one installation serve every
major tool: frontmatter of exactly `name` and `description`, `name` matching its directory, a
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
naming the file, leaving it as it was — and 1 rather than crashing with nothing installed. A hand
edit inside a newly added root fails it, which is the assertion that earns the default: the only
difference between an installed root and a checked one is `byDefault`. The commands named in every
skill are checked to exist, and the line counts are asserted, because a limit nothing checks is
one that is exceeded by the third person who adds a helpful paragraph.
