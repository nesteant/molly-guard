---
description: Draft a change - the four documents one unit of intent is made of
disable-model-invocation: true
---

# Draft a change

`mollyguard.yml` sits at the top of the repository and names the corpus directory —
`docs/` unless it says otherwise, and is found from anywhere inside. Paths below assume that.

1. `molly status` for the capabilities and what `docs/roadmap/` already intends — contradicting
   an entry there is an argument somebody has later. Read `docs/decisions/`, and
   `docs/conventions.md` if it is there: that is how *this* repository writes, and it wins.
2. `molly change new "<title>" --capability <name>`, with `--alters specs/<name>` per document
   it changes and `--realises <entry>` where a roadmap entry already intends it.
3. Fill in all four documents. `change.md` states one claim and why; `plan.md` how it will be
   built; `tasks.md` the work in order; `tests.md` what would have to be observed for the
   claim to be believed.
4. Write in the corpus's language, from `lang:` in `mollyguard.yml`.
5. **Never guess at what the documents do not answer.** Write the unknown into `change.md` under
   its own heading and stop — locally, ask; unattended, exit non-zero. Nothing in the tool refuses
   a change for holding one, and nothing needs to: an unresolved change is one nobody approves.

One claim per change; a second claim is a second change.

Mark a standing constraint in `plan.md` only where a check enforces it and it binds work not yet
done. Most changes leave none, and saying so is the answer — restating the design is not a
constraint, and a marker is a proposal whoever reviews may drop. Report the change's name and
what is still empty. Do not move it — that is the next step.
