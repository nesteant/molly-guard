# The work, in order

1. `CONVENTIONS_README` in `packages/core/src/readmes.ts`, exported beside `ROOT_README`. Headings
   only, each with a line saying what belongs under it and none saying what it should say.
2. `ROOT_README` gains the paragraph naming the file, placed with the sentence about where agent
   instructions live. Written first because it is the one an existing corpus never gets, and
   deciding its wording decides the explainer's.
3. `init.ts` places it via `put()`, so an existing file is kept and named like any other.
4. `agents.ts` names an absent `<root>/conventions.md` in its closing summary. After `init`, so the
   two messages can be read together and neither says it twice.
5. The harness: assert the file after `init`, assert an existing one is kept and reported, assert
   the `agents` line fires only when the file is absent.
6. `specs/agent-instructions` rewritten whole, under *A project's own rules reach every agent*.
