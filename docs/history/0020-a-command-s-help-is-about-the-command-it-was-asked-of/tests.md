# What will prove it

**`molly publish --help` says something about publishing that `molly help` does not.** The failing
case today, stated as the assertion: the two outputs differ, and the per-command one names
`--dry-run`.

**Every command in the listing has an entry, and every entry is in the listing.** Both directions,
over the merged table, so a command cannot be added with a description missing or described without
being real. This subsumes the existing completeness check rather than sitting beside it.

**The bare listing is unchanged.** Byte-identical to what `molly help` prints today, asserted
across the merge, because a refactor that quietly reworded the index would be the change nobody
reviewed.

**`--help` answers outside a corpus, and before a bad flag is refused.** `molly publish --help` in
a directory with no `mollyguard.yml` exits `0` and prints publish's entry; `molly publish --help
--nonsense` prints it too rather than refusing the unknown flag, because the caller is asking what
the flags are.

**`molly frobnicate --help` gets the unknown-command message**, exits `1`, and does not print an
empty entry.

**Each refusal an entry names still fires.** For every command, the refusal quoted in its help is
provoked in the harness and its exit code asserted — so a line describing a refusal that was
removed fails the build rather than becoming a false statement about the tool.
