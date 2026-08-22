# The work, in order

1. **Read the configuration by path**, and let it carry `root:`.

2. **Locate.** `locateCorpus` walking up, `corpusAt` not walking, both layouts understood.

3. **Hand commands a `Corpus`.** Seven copies of the same guard come out; one goes into `bin.ts`.

4. **Exempt what does not act on a corpus**, as a set: `agents`, `hooks`.

5. **Refuse an unknown command first**, before anything is located.

6. **Refuse an unreadable configuration**, once, before any command runs.

7. **Write the new layout in `init`** — the file at the top, the corpus where it says, and a
   refusal when one is already configured here.

8. **Say it everywhere the old definition was written**: the four skills, the corpus README, and
   the state directory's README, which had to stop implying the file lives beside it.

9. **Assert both layouts**, discovery from below, nesting, and the silent fallback that started
   this.

10. **Migrate this repository** onto the new layout, which is one `git mv` and one key.
