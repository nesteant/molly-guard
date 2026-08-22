# The work, in order

1. **Give a skill one name to be wrong about.** Replace `Skill.name` with `Skill.id`, add
   `NAMESPACE` and `skillName()`, and derive the frontmatter from them. Nothing observable
   changes yet; the four directories are still `molly-<id>`.

2. **Add the `Commands` column and the seven rows.** Data only, one path per verified vendor
   directory. Still nothing observable — a column nothing reads writes nothing.

3. **Write the files.** `commandPath`, `commandFile` and `invocation`, and the loop in
   `scaffoldFor` that emits them. This is the step the install changes at, and it changes for
   `--check` and `molly init` at the same time because all three read the same list.

4. **Say what became typable.** The run groups tools by spelling and prints each group once —
   the interesting fact is that two tools differ, and a line per tool buries it.

5. **Give the palette its own line.** Add `summary` to the four skills and have the command
   frontmatter carry it, so a list reads as a list of things to do rather than a list of
   conditions under which to do them.

6. **Stop the one tool that merges them from listing everything twice.** A `merges` flag, and
   the two frontmatter keys that send each surface to the reader it is for. This is the step
   that has to come after 3 and 5 — the duplication only exists once both surfaces are written,
   and the key on the command is only correct once the command has a summary to hide.

7. **Move the counts and add the checks.** The two assertions that count written files state new
   numbers; the new ones assert both spellings land, that a tool with no verified directory gets
   nothing invented, that the two surfaces hold one body, that neither reader is shown four
   things twice, and that `--check` reads commands.

8. **Say it in the README**, where the install is described and the four skills are listed.
