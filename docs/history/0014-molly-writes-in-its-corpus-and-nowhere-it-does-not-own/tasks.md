# The work, in order

1. **Take the hook out.** `cli/commit.ts` loses `HOOK`, `hooksDirectory` and `hooksCommand`, and
   the imports that existed only for them — `execFileSync`, `chmod`, `place`.

2. **Take it out of the surface.** `bin.ts`: the command table, `FLAGS`, `OUTSIDE`, the switch and
   the import. `OUTSIDE` gets the boundary rule written on it, because it is where a new command
   meets this question.

3. **Say how to wire it instead.** `molly help` gains the husky, lefthook and pre-commit lines, in
   the place somebody reads while deciding — not in the command, which must stay silent on a pass.

4. **Take the permissions grant out.** `store/scaffold.ts` loses `authorise` and `Authorised`;
   `store/index.ts` stops exporting them; `cli/agents.ts` reports the file and the two permissions
   rather than writing them.

5. **Guard it.** `scripts/smoke.sh`: the two greps and the two behaviours. The existing hook
   assertions go with the command they tested; the ones about the check itself stay, because the
   check stays.

6. **Say it where it is claimed.** The README's assertion count, and the two specifications this
   alters — one describes the settings write, the other names it as the sanctioned exception to a
   rule it no longer needs an exception to.
