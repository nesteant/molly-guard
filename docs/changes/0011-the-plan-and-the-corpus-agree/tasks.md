# The work, in order

1. **Give an entry a body.** `roadmap` joins `DocumentPart` in core, with the two sections an
   entry is: what should hold later, and why it is not a change yet.

2. **Write one.** `writeRoadmapEntry` in store, mirroring `writeCapability` — collision refused,
   no `state:`.

3. **Command it.** `molly roadmap new`, minting through `nameFor` and checking `--capability`
   when given.

4. **Link a change to it.** `realises:` on the record, `--realises` on `change new`, checked at
   creation.

5. **Report the disagreement.** `realised-roadmap` and `dangling-roadmap` in `status`, both
   non-failing, rendered under the table and present in `--json`.

6. **Say it in the READMEs** — the areas table stops calling `roadmap/` written-directly, and the
   area's own README says what the command buys over a hand-written file.

7. **Assert all of it**, including that retiring the entry quietens the report and that a
   published change is not asked about a reference it correctly outlived.
