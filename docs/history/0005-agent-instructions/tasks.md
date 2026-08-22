# The work, in order

The content before the writer before the command, because the whole feature is a pure function
returning file contents and everything after it is plumbing.

1. **Find out where the tools actually read.** Each vendor's own documentation, not a summary of
   it. The answer decides the table, and a table built on hearsay is a set of files nobody reads.

2. **Say what the files contain.** `scaffold.ts` in core — four skills and the table of tools,
   with the paths each reads under. Assertable without touching a disk.

3. **Keep the skills short, and each one whole.** They name where truth lives rather than
   repeating it, and each says where the corpus is, because only one of them may be loaded.

4. **Put them down.** `writeScaffold` in store — created, replaced, or already current, three
   outcomes because the third is what `--check` reads.

5. **Merge the one file the tool does not own.** `.claude/settings.json` written whole when
   absent, given only its missing entries when present, reported and left alone when it will not
   parse.

6. **Give it a command.** `molly agents`, `--tools` refusing an unknown id by name, and
   `--check` writing nothing and failing on a difference.

7. **Install it with the corpus.** `molly init` calls it, and says what it wrote — including
   which tools the directory it just wrote is read by.

8. **Assert the content, not only the files.** That every skill validates against the Agent
   Skills specification; that the reference skill forbids editing the knowledge base directly and
   says a document is replaced whole; and that none of them names a decision, capability or
   language — the last is the refutation that protects the rule the design rests on.
