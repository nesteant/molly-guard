# The work, in order

1. A relative-link scan in `packages/store/`: given a root, the live areas and a path that has
   moved, return every `(file, line, target)` whose link resolved into that path and now resolves
   to nothing. Store rather than core — it reads the filesystem — and it takes the moved path as an
   argument so it has no knowledge of publishing.
2. `publish.ts` calls it after `archiveChange`, and renders the findings under the existing report.
3. The `history/` exclusion, asserted rather than assumed: a link inside the bundle just archived
   is not reported.
4. The harness: a live change referencing the published one is reported with its line; a link that
   still resolves is not; an absolute link is not; a corpus with pre-existing broken links reports
   only what this publication broke; and the exit code stays `0` with findings present.
5. `specs/publishing-a-change` and `specs/what-a-command-may-never-do-silently` rewritten whole.
