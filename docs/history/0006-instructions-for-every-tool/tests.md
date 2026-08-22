# What will prove it

In `scripts/smoke.sh`, under `agents`, beside the assertions the previous change left. Every
existing assertion stays: this change adds directories and must not move what the two already
there contain.

## The four directories arrive

- `molly init` writes `.junie/skills/molly-corpus/SKILL.md` and the Kiro equivalent, alongside
  the two that already existed.
- All four skills are under each of the four roots.
- The default install writes **sixteen** files. A count is what catches a directory added
  without anybody deciding to add it.

## Naming a tool still answers "does this work with mine"

- `--tools junie` writes `.junie/skills/` and **not** `.agents/skills/`, asserted as an absence.
- `--tools kiro` writes `.kiro/skills/` and **not** `.agents/skills/`, the same way.
- `--tools goose` writes the shared root, because that is where Goose reads.
- `--tools roo,openhands` writes four files, not eight — two tools naming one directory is one
  directory.
- An unknown id is still refused by name, and the list it prints now names the new ones.

The two absences are the assertions that matter most here. Junie and Kiro are the rows a person
tidying the table would fold into the majority, exactly as Cline is the row somebody would fold
the other way, and nothing but an absence catches that.

## The new directories hold real skills, not just files

The spec-conformance assertions and the content assertions run over the generated skills rather
than over one directory, so a new root is covered by them the moment it is written. Asserted at
`.junie/skills/` specifically, because a root that received files but not *these* files is the
failure that a file-count would call a success:

- every `SKILL.md` under it has frontmatter of exactly `name` and `description`
- `name` matches its directory
- the reference skill under it forbids editing the knowledge base directly

## `--check` covers all four

- On a fresh install it exits 0 — with four directories rather than two.
- A hand edit inside `.junie/skills/` fails it and names the file. This is the assertion that
  earns the default: a directory the check does not look at is a directory that goes stale, and
  the only difference between an installed root and a checked one is `byDefault`.

## Everything the previous change asserted still holds

Named here because a change that adds directories is a change that can quietly move what is in
them. The skills still name no capability, no decision and no language tag; each still says how
to find the corpus; the line counts still hold; and the commands named in them are still
commands that exist.
