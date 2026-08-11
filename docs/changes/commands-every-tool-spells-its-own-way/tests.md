# What will prove it

Every one of these is an assertion in `scripts/smoke.sh`, run against a real corpus in a
temporary directory, because a claim about where a file lands is only true on a filesystem.

**The two spellings both land.** `.claude/commands/molly/new.md` exists after `molly init`, and
so does `.kiro/prompts/molly-new.prompt.md`. These are the two shapes; a single assertion would
pass on an install that had collapsed them into one.

**The run says which.** `molly agents --tools claude` prints `/molly:new`, and the same command
for Cursor prints `/molly-new`. This is the assertion that catches the quiet failure directly:
the printed spelling and the written path are computed from one field, so a test that reads the
output has read the path.

**Nothing is invented.** `molly agents --tools codex` leaves no `.agents/commands` behind. A
tool without a verified command directory gets its skills and nothing else.

**The shape the vendor asked for.** `.gemini/commands/molly/new.toml` contains `prompt = `, so
the one tool that does not read markdown is not handed markdown.

**One body, two files.** The body of `.claude/skills/molly-new/SKILL.md` and the body of
`.claude/commands/molly/new.md` `diff` clean. This is the constraint from the plan, asserted
rather than intended.

**The right line for each reader.** The Claude Code command file does not contain
`Use when asked to propose` — the routing half of the description stays where a model reads it.

**Neither reader is shown four things twice.** The Claude Code skill carries
`user-invocable: false` and its command carries `disable-model-invocation: true`. These are two
assertions rather than one because they fail apart: the first alone leaves the model reading
eight descriptions, the second alone leaves the menu holding eight entries, and either failure
looks exactly like the working install from the other side.

**And the keys go nowhere else.** `.agents/skills/molly-new/SKILL.md` does not contain
`user-invocable`, and Junie's command does not contain `disable-model-invocation`. This is the
assertion that catches a tidy-up folding two files into one — the version everybody's copy is
identical in is the version that put Claude Code's frontmatter into eleven other tools.

**The check reads both.** A newline appended to a command file makes `molly agents --check` fail
and name that file. Without this the whole second surface is outside the thing that keeps the
first one current.

**The counts.** A default install writes 28 files: four skills into each of four roots, plus
four commands for each of the three of those that has a palette. `--tools codex,cursor` writes
8 — one shared skills root written once, and Cursor's four commands. The numbers are the
assertion that nobody added a directory without deciding to.
