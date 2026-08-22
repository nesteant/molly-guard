# What will prove it

In `scripts/smoke.sh`, under `agents`. The assertions divide in two: that the files arrive where
each tool reads, and that they say what they must and nothing they must not. The second half
matters more, because a skill with the wrong content is indistinguishable from a right one until
somebody follows it.

## The files arrive, in both default directories

- `molly init` writes `.agents/skills/molly-corpus/SKILL.md` and the Claude equivalent.
- All four skills are there under each: `molly-corpus`, `molly-new`, `molly-advance`,
  `molly-publish`.
- `.claude/settings.json` exists and pre-authorises the `molly` commands.
- `molly agents` on its own puts the same files down, and says they are already current the
  second time — the outcome `--check` depends on.
- `--tools agents` writes the vendor-neutral one and **not** the Claude one, asserted as an
  absence.
- An unknown tool id is refused by name, listing the ones there are.

## Naming a tool answers "does this work with mine"

- `--tools cursor` writes the shared root, because that is where Cursor reads.
- `--tools codex,cursor` writes four files, not eight. Two tools naming one directory is one
  directory, and a count that double-counted would be a count nobody could use.
- The run names the other tools that directory serves, so nobody installs once per tool or
  doubts that they are covered.
- `--tools cline` writes `.claude/skills/` and **not** the shared root, asserted as an absence.
  Cline is the mirror image of Claude Code, and it is the row most likely to be quietly
  "corrected" into the majority by somebody tidying the table.

## Every skill is a valid Agent Skill

This is what makes one installation serve every major tool, so it is asserted rather than
assumed. For each generated `SKILL.md`:

- the frontmatter holds exactly `name` and `description` — a seventh field is accepted where it
  was invented and a hard error on the path that packages a skill
- `name` matches the directory it is in, which the specification requires
- the directory name is `molly-` followed by lowercase words, so uninstalling is exact and the
  name is valid
- the description is non-empty and within the 1024-character limit
- the description contains no `: `, which would end the value early and leave every reader with
  frontmatter that means something else

## The skills carry the rules a model would otherwise break

Each of these is a sentence somebody could delete without any test noticing:

- the reference skill forbids editing `docs/specs/` directly
- it says a document is replaced **whole**, and that there is no delta format
- it says the tool composes no text
- it says `published` is reached by publishing rather than by moving
- it points at `docs/decisions/`, `molly status` and `mollyguard.yml` — the three places truth
  lives
- **every** skill says how to find the corpus, and the trigger is not tied to `docs/`. A corpus
  made with `--root` is somewhere else; only one skill may be loaded, so one that relied on
  another being open would be a skill that is sometimes wrong

## And carry no fact the corpus holds

The refutations that protect the design. Over a corpus with a capability, a decision and a
language set to something other than English, none of the generated skills contains:

- a capability name
- a decision name
- the corpus's language tag

If any appears, the instructions have taken a copy of something the corpus already answers, and
the copy is stale the moment that answer changes — silently, because an agent cannot tell a
superseded decision from a current one.

## `--check` fails on a difference and writes nothing

- On a fresh install it exits 0.
- With a skill edited by hand it exits 1 and names the file.
- After failing, the file is **still** as it was edited — a check that repaired what it found
  would be an install, and nobody would know which they had run.
- With nothing installed at all it exits 1 rather than crashing.

## The instructions name only commands that exist

The same check the generated READMEs get, pointed at every skill. It is the reason these are
generated rather than written once: a skill naming a command that has moved on sends its reader
to a dead end, silently, in a file nobody opens.

## Token cost is asserted, because it is a design constraint

The reference skill is under a stated line count and each workflow skill under a smaller one. A
limit nothing checks is a limit that is exceeded by the third person who adds a helpful
paragraph, and the cost lands on every session that loads it.
