# The work, in order

Each step is provable before the next starts, and the behaviour changes only at step 5.

1. **Give core the shape of a name.** `naming.ts` — render, match, validate. Pure, exported from
   the barrel, no caller yet.

2. **Read the configuration.** `store/config.ts` takes a file path rather than a corpus directory,
   parses `naming:`, and reports an unusable pattern and an unknown area by name.

3. **Allocate.** `store/naming.ts` — the area, its archive and the ledger, highest plus one.

4. **Widen the seam.** `nameFor` takes the corpus and the area, and applies the pattern after the
   reduction and both refusals.

5. **Call it from the two commands that mint.** `change new` and `capability new`. This is the
   step behaviour changes at, and it changes for nobody who has not declared a pattern.

6. **Ask the same of what a publication writes.** `publish` refuses a new document whose name
   the corpus's pattern would not have produced, naming the folder to write instead. The one
   place a name enters the corpus without passing through `nameFor`.

7. **Offer it in the file `init` writes**, commented out, saying what `{ordinal:n}` counts and
   that `--name` still overrides.

8. **Read `lang:` while the file is open**, so a corpus that declared one stops being handed
   documents that contradict it.

9. **Assert all of it**, including the case a directory listing cannot answer: a deleted change
   does not free its number.

10. **Say it in the README**, where the assertion count is stated.
