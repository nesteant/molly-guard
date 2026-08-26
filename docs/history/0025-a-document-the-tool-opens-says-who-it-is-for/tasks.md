# The work, in order

1. Lead paragraphs in all six templates in `packages/core/src/templates.ts`, each naming a reader,
   the question that settles a sentence, and where a sentence that fails it goes.
2. `# What is not settled` added to the `change.md` template, with the rule that answering means
   rewriting the document the answer belongs in and deleting the question.
3. The standing-constraint paragraph moved out of `molly-new` and into the `plan.md` template, and
   the delete-rather-than-strike rule written into the `tasks.md` template.
4. `molly-corpus` given the correction path in its positive form and the closed frontmatter record,
   keeping *Never edit them directly* — the harness asserts that string twice.
5. `molly-new` step 4 restated by reader, step 6 pointed at the new heading, and one line on
   revising being rewriting. It must come back at 30 lines or fewer.
6. `molly-advance` and `molly-publish` given their one line each.
7. The `changes/` explainer in `packages/core/src/readmes.ts` given the four readers and the
   in-force sentence.
8. Assertions in `scripts/smoke.sh`: every generated change document names its reader, the
   `change.md` template carries the heading, an open question under it is neither a finding nor a
   refusal, and the existing caps still pass.
9. The one assertion that tracks the length of the `change.md` template — the broken-link report
   names a file and a line, and the fixture appends to a fresh bundle — updated, and commented so
   the next template edit knows why it moved.
10. `npm run build && npm run smoke`, then `npm run molly -- agents` to reinstall this repository's
    own skills, and `npm run molly -- agents --check`.
11. `publish/specs/creating-a-change/spec.md` and `publish/specs/agent-instructions/spec.md`,
    each the whole new version.
