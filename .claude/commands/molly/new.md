---
description: Draft a change - the four documents one unit of intent is made of
disable-model-invocation: true
---

# Draft a change

The corpus is the directory holding `mollyguard.yml` — `docs/` unless a command was
given `--root <dir>`. Paths below assume the default; read them against the root you find.

1. `molly status` for the capabilities that exist, and read every file in `docs/decisions/`.
2. `molly change new "<title>" --capability <name>`, adding `--alters specs/<name>` for each
   knowledge-base document it will change. A change that introduces new truth alters nothing.
3. Fill in all four documents. `change.md` states one claim and why; `plan.md` how it will be
   built; `tasks.md` the work in order; `tests.md` what would have to be observed for the
   claim to be believed.
4. Write in the corpus's language, from `lang:` in `docs/mollyguard.yml`.

One claim per change; a second claim is a second change.

Mark a standing constraint in `plan.md` only where a check enforces it and it binds work not yet
done. Most changes leave none, and saying so is the answer — restating the design is not a
constraint, and a marker is a proposal whoever reviews may drop. Report the change's name and
what is still empty. Do not move it — that is the next step.
