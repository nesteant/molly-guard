# The work, in order

Core before store before CLI, as always. The refusals come with the write rather than after it:
this is the first command that touches four places, and a check added afterwards is one written
to fit whatever the code already happened to do.

1. **Say which areas a change may write into.** `publishable` on `Area` — true for `specs` and
   `decisions`, false for everything else. The refusal for a misplaced document is then derived
   from the table rather than listed in the command.

2. **Name the folder.** `CHANGE_PUBLISH` beside `CHANGE_PARTS`, because it is part of what a
   change bundle is.

3. **Read the proposal.** `readPublishSet` — walk the tree, return each document with its path
   relative to the corpus root, report what cannot be read.

4. **Write it.** `applyPublishSet` — create directories, replace documents whole.

5. **Archive the bundle.** `archiveChange` — rename into `history/`, refusing rather than
   overwriting an archive that already exists.

6. **Give it a command.** `molly publish <change>`, resolving the name bare or qualified like
   `molly move` does, and refusing on the drift between the ledger and what the document
   claims — the same refusal, because publishing from a disputed state would write the
   knowledge base out of a disagreement.

7. **Refuse before touching anything.** No `publish/`, an empty one, a document outside a
   publishable area, a name that is not a usable slug, a new specification with no `spec.md`, a
   capability that does not resolve, and a publication where every document is byte-identical
   to what is already there. All of them with the disk untouched.

8. **`--dry-run`.** The same decisions, the same refusals, the plan printed, nothing written.

9. **Do it in order.** Write, record, project, archive — so that a failure late leaves earlier
   facts true rather than pretending they are not.

10. **Assert every refusal, the order, and the archive.** Including the two that are easy to
    lose: that a refusal leaves the corpus untouched, and that the archived bundle still holds
    its `publish/` folder.

11. **Say it exists.** `molly help`, and the READMEs that said merging was not built — the
    paragraph in the root README was written precisely so it could be deleted when it stopped
    being true.
