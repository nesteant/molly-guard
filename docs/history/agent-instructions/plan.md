# How it will be built

The same boundary as everything before: `@mollyguard/core` holds what the files say and no I/O,
`@mollyguard/store` writes them, `mollyguard` parses argv and prints. The scaffolding is *data*
in core, exactly like the READMEs, which is what keeps it testable without a filesystem.

## Core

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

**Nothing reads the corpus.** No decision, capability or language is embedded — see the entry
document for why — so `scaffoldFor` takes a list of tools and nothing else.

## Store

**`scaffold.ts`** — `writeScaffold` puts the files down and reports what it did: created,
replaced, or already current. Three outcomes rather than two, because "already current" is the
answer `--check` needs and a writer that could not tell them apart would make the check a
second implementation of the same comparison.

`.claude/settings.json` is the exception and is handled apart. It is the one file here the tool
does not own, so it is written whole only when absent, and otherwise parsed, given the entries
it lacks, and written back.

It is merged **only into the shape it understands**. A file that will not parse is reported and
left alone, and so is one whose `permissions` is not an object or whose `allow` is not a list —
spreading a string would scatter it character by character into an object, and both losses would
be silent, in a file holding somebody else's decisions. Guessing at the contents of a
configuration is worse than saying it could not be used.

## CLI

**`agents.ts`** — `molly agents [--tools <list>] [--check]`.

`--tools` takes the ids from the table and refuses anything else by name, listing them. With
nothing named, the default is the shared root and Claude Code, which between them is every major
tool; the remaining rows exist so that asking for one by name works and says where it reads.

`--check` writes nothing and exits 1 if any file is absent or differs. That is the whole of it:
an upgrade that was never followed by a reinstall leaves a skill describing commands that have
moved on, and this is what makes that a failing check rather than a slow afternoon.

**`init.ts`** calls it, because installing the tool and scaffolding the corpus are one act from
where the person is standing.

# What this constrains afterwards

<!-- decision: instructions-name-where-truth-lives-rather-than-repeating-it -->

**Generated instructions carry no fact the corpus already holds.** A skill, a prompt, or
anything else the tool writes for a model to read may say *where* to find the decisions in
force, the capabilities that exist, or the language to write in — and may never restate them.

The test is whether regenerating is needed when the corpus changes. If it is, the instructions
have taken a copy of something, and the copy will be stale in a way nothing detects: an agent
does not know it is reading a decision that was superseded last week, and the text it produces
looks exactly like text produced from a current one.

It also keeps the tool directories out of the corpus's diffs, which is what stops people
learning to ignore them.

<!-- decision: generated-instructions-use-only-the-portable-format -->

**Anything generated for a model to read is an Agent Skill, and uses only the fields the
specification requires.** A directory named for the skill, a `SKILL.md`, a `name` and a
`description`. No vendor command format, and no seventh frontmatter field.

The reason is that portability here is not a preference but the feature: a corpus that can only
be worked on from one vendor's client is a corpus that has picked the reader's tools for them.
The moment a file is written in a shape only one tool reads, every other tool needs its own —
which is four formats to keep true, and three of them nobody here can test.

A field outside the specification is the same bet in miniature: it is accepted where it was
invented, ignored in some implementations, and a hard error in at least one. When a vendor
feature is genuinely wanted, it is worth a row of its own in the table and an assertion — not a
field quietly added to a file that eleven other tools also read.
