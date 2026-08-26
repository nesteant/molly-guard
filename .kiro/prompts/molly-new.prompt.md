---
description: Draft a change - the four documents one unit of intent is made of
---

# Draft a change

`mollyguard.yml` sits at the top of the repository and names the corpus directory —
`docs/` unless it says otherwise, and is found from anywhere inside. Paths below assume that.

1. `molly status` for the capabilities and what `docs/roadmap/` already intends — contradicting
   a slice is an argument somebody has later. Read `docs/decisions/`, and `docs/conventions.md`
   if it is there: that is how *this* repository writes, and it wins.
2. **If the work is in a roadmap slice, read it first** — the `molly-roadmap` skill acts on one.
3. `molly change new "<title>" --capability <name>`, with `--alters specs/<name>` per document
   it changes and `--realises <slice>` where a slice already intends it.
4. Fill in all four. Each opens with the reader it is for, and that reader settles where a
   sentence goes: `change.md` for whoever decides the work should happen at all, `plan.md` for
   whoever builds it, `tasks.md` for whoever picks it up part-done, `tests.md` for whoever must
   believe it after. One its reader would not need moves to the document whose reader would.
5. Write in the corpus's language, from `lang:` in `mollyguard.yml`.
6. **Never guess at what the documents do not answer.** Write the unknown into `change.md` under
   *What is not settled* and stop — locally, ask; unattended, exit non-zero. Nothing in the tool
   refuses a change for holding one: an unresolved change is one nobody approves. An answer is
   recorded by rewriting the document it belongs in and deleting the question.

One claim per change; a second claim is a second change. **Revising is rewriting** — a change
corrected later says what is in force now, as though it had always said it: no correction block,
no dated addition, no struck-through task. Report the change's name and what is still empty. Do
not move it — that is the next step.
