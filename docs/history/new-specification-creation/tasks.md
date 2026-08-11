# The work, in order

The order is the shape of the dependency: core knows what a change is before store can write
one, and store can write one before the command can call it. The last item is not optional —
an assertion written afterwards is written to fit what the code already does.

1. **Name a change.** `slug.ts` — `slugify`, `isSlug`, the 60-character cap and the
   word-boundary clip. Nothing else can be created until the thing has a name.

2. **Say what a change is.** `change.ts` — the four parts, the four kinds, and the record: a
   title, a language, a kind, and what in the knowledge base it alters.

3. **Write a record down.** `frontmatter.ts` — serialise scalars and arrays of scalars, quote
   what would otherwise be misread as YAML, and omit an absent field entirely rather than
   emitting a blank key. An empty list and a missing key mean different things and the file
   has to be able to say which.

4. **Open the four documents on something.** `templates.ts` — the `Templates` interface, and a
   built-in implementation whose bodies name the section and impose no requirement form.

5. **Put a bundle on disk.** `writeChangeBundle` — compose all four in memory, refuse a
   collision before creating any directory, return what was written.

6. **Give it a command.** `molly change new`, its flags, and its four refusals. `--alters`
   collected from raw argv so it can be repeated.

7. **Record the creation.** One `created` line in the ledger, carrying the state it starts in
   and who made it. Appended after the bundle is on disk, so a collision leaves no event
   behind for a change that does not exist.

8. **Assert every refusal, and the absence of a format.** The four refusals; that only the
   entry carries frontmatter; that a long title clips at a word; that an empty `alters` is
   written as `[]`; and — the one that protects the seam — that no generated bundle contains
   `given:` or `SHALL` anywhere.
