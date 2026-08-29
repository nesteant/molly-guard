Written for whoever picks the work up part-done. An item belongs here only if somebody could look
at the repository and say whether it is finished.

# The work, in order

1. **Finish the archive explainer's sentence.** `ROADMAP_README`'s neighbour in
   `packages/core/src/readmes.ts` — the `history/` text — states the seal against editing and
   against re-checking. Add reading to it, and the destination in the same paragraph: `specs/`
   and `decisions/` for what is in force, `molly status` for what exists, `roadmap/` for what is
   intended.
2. **State it in the reference skill.** One line in `molly-corpus`'s *Read before writing*, which
   is the only place in the instructions that already enumerates what to open. It says the
   archive is closed and where to go instead.
3. **Raise the reference skill's cap to 64** in `scripts/smoke.sh` § *the skill stays short*, and
   put the reason in the comment above it: the cap is about a body loaded when the work is
   corpus work, and the four lines replace an archived bundle.
4. **State the implementation boundary in `molly-advance`.** What the phase works from, that a
   plan found wrong moves the change back rather than being edited in place, and that a published
   specification found wrong is a new change. It must still be 30 lines or fewer.
5. **Say the payload is not a task, in the `tasks.md` template** — `packages/core/src/templates.ts`
   — at the keystroke where a task list is written.
6. **Say it in `molly-new` too**, inside step 4's existing sentence about what each document is
   for, re-wrapped rather than appended. It must still be 30 lines or fewer.
7. **Assert all four in `scripts/smoke.sh`**, in the section that already walks the installed
   instructions: the explainer names reading, the reference skill names the archive, the advance
   skill names what implementation works from, and the template names the payload.
8. **Reinstall and re-run.** `npm run build && npm run smoke && npm run molly -- agents` — the
   generated files under `.agents/`, `.claude/`, `.junie/` and `.kiro/` are outputs and are
   regenerated rather than edited.
9. **Correct this repository's own conventions.** `docs/conventions.md` § *What is never edited
   by hand* calls `docs/history/` sealed, which is now the smaller claim of the two; it defers to
   the tool's wording rather than restating it.
10. **Move the change to `implemented`** once the harness passes and `molly status` is clean.
