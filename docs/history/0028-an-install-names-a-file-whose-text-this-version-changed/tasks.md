Written for whoever picks the work up part-done. An item belongs here only if somebody could look
at the repository and say whether it is finished.

# The work, in order

1. **Give `place()` its third outcome.** `packages/store/src/skeleton.ts`: `Placement` becomes
   `'created' | 'kept' | 'differs'`, and a file that is there is read and compared. A file whose
   text is empty is kept without being read — comparing against nothing can only say *differs*,
   and the ledger is the file that case exists for.
2. **State the asymmetry in the module header**, beside the paragraph that already explains why
   two outcomes were right: the third is a report, and the reason it is not also a replacement is
   that this writes into a directory the tool did not make.
3. **Report it in `init`.** `packages/cli/src/init.ts` collects the differing paths, counts them
   among what it kept, and names them under the kept block — in both the completing run and the
   fresh one, since a corpus can be found where one existed before.
4. **Exclude the three that are not the tool's whole text**: `conventions.md`, `.gitattributes`
   and the ledger, by the constants `init` already imports, each with its reason in a comment.
5. **Correct the `added` line.** *It already had everything this version writes* becomes a claim
   about files rather than about their contents. This is the sentence the defect was reported
   against and it is wrong even when nothing differs.
6. **Assert it in `scripts/smoke.sh`**, beside the existing init assertions: an explainer edited
   before a second `init` is named and left alone, a filled-in `conventions.md` is not named, and
   an untouched corpus reports nothing differing.
7. **Reinstall and re-run.** `npm run build && npm run smoke && npm run molly -- status`.
8. **Move the change to `implemented`** once the harness passes and `molly status` is clean.
