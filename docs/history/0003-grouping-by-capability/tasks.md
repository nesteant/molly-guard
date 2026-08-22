# The work, in order

Core before store before CLI, because each layer is the vocabulary the next one speaks. The
exclusion rule arrives with the scanner that makes it necessary and with the assertion that
proves it fires — a guard shipped before there is anything to guard is indistinguishable from
protection that is not there.

1. **Say the id once.** `qualify` and `unqualify` in `areas.ts`, and `molly move` switched onto
   the second of them. The rule existed already, open-coded for one area; this is the step that
   stops there being two spellings of it before there are three.

2. **Say what a capability is.** `capability.ts` in core — a title and a language. No state and
   no kind: a record with a state field is one something will eventually try to move.

3. **Open the document on something.** `templates.ts` widened from `ChangePart` to
   `DocumentPart`, and a built-in capability body that names its sections, asks for the edge,
   and imposes no requirement form.

4. **Exclude the explainer, once.** `isDocumentName` in `layout.ts`, and the change scan moved
   onto it so both scans read the same rule rather than each carrying a copy.

5. **Put a capability on disk.** `writeCapability` — compose in memory, refuse a collision
   before writing, return what was written, and append nothing to the ledger.

6. **Read them back.** `readCapabilities` — the first scan of an area that holds files. A
   folder here is what does not belong and is named; unparseable frontmatter is named; a damaged
   record still lists.

7. **Give it a command.** `molly capability new`, its `--name` override, and its four refusals.

8. **Carry the reference.** `capability` on `ChangeRecord`, written at creation, read by the
   scan, omitted entirely when nobody declared one.

9. **Resolve it while the author is there.** `--capability` on `molly change new`, checked
   against what is on disk, refused by name with the list of what exists and the command that
   makes another.

10. **Show the grouping.** `molly status` — the capabilities that exist on their own line, the
    column saying where each change is filed, and the finding for a reference that no longer
    resolves, exiting 1.

11. **Assert every refusal, both absences, and the exclusion.** The four refusals and the
    unknown-capability one; that a capability reaches no ledger line and carries no `state:`;
    that `README.md` is not read as a capability; that a bare and a qualified name are the same
    reference; and that a corpus declaring no capabilities is still clean.

12. **File this corpus under its own capabilities**, and say in the READMEs that the command
    exists. A feature the tool's own corpus does not use is one whose first real user is a
    stranger.
