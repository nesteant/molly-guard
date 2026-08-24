# How it will be built

Three writes and one report, all through machinery that already exists.

**The explainer is core's, beside the others.** `readmes.ts` already generates an explainer per
area from the `AREAS` table; `CONVENTIONS_README` joins `ROOT_README` and `STATE_README` as a
constant, because `conventions.md` is not an area and must not become one. An area is a directory
the tool files documents into, and nothing files anything here — a project writes it by hand and
the tool never reads it.

**`init` places it through the same seam as everything else.** `put()` in `init.ts` calls `place`,
which writes only where there is nothing and collects what it found into `kept`. So a repository
that already has a `docs/conventions.md` keeps it and is told, exactly as it is told about a
`docs/README.md` it already had. No new path, no new rule about overwriting.

**The corpus README gains a paragraph, not a table row.** The table in `ROOT_README` is
`Directory | Holds | How something gets there`, and every row is an area reached by a command.
`conventions.md` is a file nothing writes but a person, so a row would have to lie in two of its
three columns. It goes below the table, in the paragraph that already explains that the agent
instructions live outside the corpus — which is the same subject: what an agent reads, and where
that comes from.

**`agents` names it when it is missing.** The command already ends with a summary naming the
directories it wrote and the spellings it made typable. One more line, on the same footing: the
skills it just installed point at `<root>/conventions.md`, and there is no such file. That is the
whole upgrade path for a corpus made before this change, and it costs nothing on a corpus that has
one.

## What this rules out

**A finding in `molly status`.** A project with no conventions is not a corpus with a problem, and
a listing that nags about an optional file teaches people to read past its findings. `agents` says
it once, at the moment the pointer is installed, which is when the sentence is actionable.

**Reading the file.** Nothing parses it, nothing checks it, and nothing warns that it is empty.
The tool's relationship to `conventions.md` is that it writes a stub and points at it; the moment
it has an opinion about the contents it is composing the project's rules.

**A `conventions:` key.** Considered and refused in `change.md`. The path is fixed by four skills
that name it, so a configurable path would let the config and the skills disagree — and the skills
are what an agent actually reads.

# What this constrains afterwards

**A path a skill names is a path the corpus arrives able to hold.** This is the general form of
the defect: the pointer was correct, the target was optional, and nothing connected the two. Any
future skill that names a file the project is expected to write answers this at the same time —
either `init` makes a place for it, or the skill does not name it.
