# How it will be built

The tool table grows a second optional column, and everything else follows from it.

```ts
interface Commands {
  dir: string;                        // '.claude/commands'
  style: 'namespaced' | 'flat';       // molly/new.md, or molly-new.md
  extension: string;                  // '.md', '.prompt.md', '.toml'
  shape?: 'toml';                     // frontmatter + markdown otherwise
}
```

Three fields and not four, because **the name is not one of them**. `style` decides the path and
the same `style` decides the spelling, so `commandPath` and `invocation` read the one field and
cannot disagree — the failure this rules out is an install that prints `/molly:new` while
writing the file that registers `molly-new`.

A skill loses its `name` field and gains an `id`. `molly-corpus` was a string that had to agree
with a directory name, and now has to agree with a command name as well; three spellings of one
word is two chances to be wrong, so `id` is `corpus` and `molly-corpus`, `/molly:corpus` and
`/molly-corpus` are all computed from it. A `summary` is added beside `description`: one line
written for a person reading a list, where the description's trailing "Use when..." is noise.

`scaffoldFor` emits the command files alongside the skills, deduplicated by path exactly as the
skills already are. That is the whole of the wiring — the writer, the `--check`, and the report
all take a list of paths and contents, and none of them learns what a command is.

Seven rows get the column. Each path was read from that vendor's own documentation and, where
one exists, cross-read against a shipped implementation. The rest of the table keeps skills
alone: a tool whose command directory has not been verified gets no invented path.

A `merges` flag carries the one fact that decides whether the two surfaces can coexist quietly.
`skillFile` and `commandFile` each take it and each add one key, so the tool that would list
everything twice is the only one whose files differ from everybody else's — and they differ by
a line of frontmatter, never by a line of body.

Rejected: dropping the skills where a tool has commands, which is the smaller change and the
wrong one. It would leave the model routing on the palette summary, which is the description
with the routing half removed, and it would leave the five tools whose commands are prompt
templates rather than skills with nothing a model can reach on its own at all.

## What this constrains afterwards

**A row is a claim about a directory somebody else owns, and only a verified one goes in.** This
already governed `skills`; it now governs `commands`, where the failure is quieter — a skill in
the wrong place is a model that never mentions MollyGuard, a command in the wrong place is a
palette entry that was never there to miss.

**Neither surface may hold text the other does not.** The body is one string. A command that
grew a line of its own would be a second answer to a question the skill already answers, stale
the moment either moves, which is the failure this product exists to prevent.

**A key only one vendor documents goes only into that vendor's copy.** `user-invocable` and
`disable-model-invocation` are Claude Code's. Writing them into the shared root would be a claim
about how twelve other implementations treat an unknown key, and the install has nothing to gain
that would make that claim worth holding.
