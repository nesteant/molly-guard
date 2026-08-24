# How it is built

One module and a great deal of removal. The boundary is unchanged: `@mollyguard/store` finds the
corpus because finding it is I/O, `mollyguard` refuses once on what it finds, and
`@mollyguard/core` never learns there is a filesystem at all.

# Store

**`locate.ts`** — the only answer to *where is the corpus*.

```ts
interface Corpus { root: string; dir: string; config: string; }

locateCorpus(cwd, given?): Promise<Corpus | undefined>   walks up; `given` is --root
corpusAt(at): Promise<Corpus | undefined>                exactly one directory, no walk
```

Three fields, and the third is the one that could not exist before: **`config` is not necessarily
inside `root`.** That single sentence is the change — the marker and the contents came apart, and
every other property follows from their being two paths rather than one.

`locateCorpus` walks from the working directory towards the filesystem root, asking `corpusAt` at
each level and stopping at the first answer, which is what makes the nearest configuration the one
that wins. Where `--root` is given there is no walk at all: it names the corpus directory rather
than the configuration, so it keeps working for a corpus in the old layout.

`corpusAt` asks the same question without the walk, and the difference between the two is the
point rather than an optimisation. **`init` asks the narrow one.** A repository may hold a corpus
at its top and another in a package below it, and asking the wider question would refuse the
second for the existence of the first — so what is refused is a second corpus *in this directory*,
which is exactly the claim `one configuration names one corpus` makes.

Inside `corpusAt`, `root:` is what tells the layouts apart: present, the file is a pointer and the
corpus is where it points; absent, the file is the marker and the corpus is the directory holding
it. The old default is then checked *below* the directory as well, and that is not the walk
repeated — it lies in the opposite direction. Without it a repository that never migrated would
stop being found from its own root, which is the one place everybody runs commands from.

**`dir` is a name, not a computed path.** `name()` takes what the configuration declared, or the
basename of the corpus directory, and never a path relative to the working directory. Those differ
the moment somebody stands in a subdirectory, and a tool that calls one corpus `docs` from one
shell and `../../../docs` from another produces output that cannot be pasted or compared. It also
matches how everything else in a corpus is addressed: a document is `specs/invoicing` wherever you
are, because the path is the id.

**`config.ts`** takes the configuration's path rather than a corpus directory, and gains `root:`.
That is what lets the file be read before anybody knows where the corpus is — which has to be
possible, because the file is what says.

# CLI

`bin.ts` locates once and refuses once, and seven copies of
`if (!existsSync(join(root, CONFIG_FILE))) fail(...)` come out. Commands take a `Corpus` instead of
a root and a display name, so no command can construct a corpus path of its own.

The order in `bin.ts` is the design, and each step is before the next because being after it would
be a worse message:

```
--version         asked for, and answerable when everything else is broken
--help            asked for, so answered rather than validated — for the command it was asked of
checkFlags        a flag refused while refusing is still free — after a write it is an apology
unknown command   `molly frobnicate` gets a typo's message, not a corpus's
init              creates rather than finds, so it never searches
locate            once, for everything else
readConfig        problems refuse here, before any command has run
```

**`--help` resolves to a command before it renders.** `molly help` with nothing after it is the
listing; `molly help <name>` and `molly <name> --help` are one entry; a name that is no command
falls through to the unknown-command message rather than growing a second refusal of its own. All
of it sits above `checkFlags`, which is why an unknown flag alongside `--help` does not pre-empt
the answer.

**`COMMANDS` is one record per command, and it is one table because three surfaces read it.** The
listing renders `usage` and `summary`; `checkFlags` reads `flags`; `--help` renders all of it plus
`refuses`. They were two tables — an ordered array of usage-and-summary pairs, and a record of flag
names — keyed by the same names in two shapes, and the per-command knowledge the dispatcher held
was a flag array with no words in it. That gap is why `molly publish --help` printed the listing.

`hidden` keeps `version` out of the listing and still answerable, because it is a flag people type
rather than a verb worth teaching — and denying that it is a command when asked would be a
different kind of wrong.

**`refuses` is the field that can drift**, and it is the only one not derivable from the source: a
refusal is a `fail()` deep in a command rather than something the table could read. So it names
refusals rather than describing them, and the harness provokes every line.

`OUTSIDE` holds the commands that do not act on a corpus. It is a set holding one id — `agents` —
and it is a set because the next command to be added has to answer *does this act on a corpus*
somewhere, and a named set is a place to answer it rather than a condition to copy.

**The silent fallback is closed by where the read happens, not by a check.** A configuration whose
problems are read once, centrally, before dispatch, has no path along which a command can act on a
guess. The previous shape had no bug in any one command: each was individually reasonable, and the
degradation lived in the seam between them, which is the argument for the seam being one place.

# What this constrains afterwards

**No command computes a corpus path from the working directory.** There is one locator and every
command is handed its result.

**A configuration that will not parse is refused, never worked around** — see [what a command may
never do silently](../what-a-command-may-never-do-silently/spec.md). A fallback that guesses is how
a tool reports success over something it did not look at, and this one guessed plausibly enough to
survive a migration.

# What proves it

Sixteen assertions in `scripts/smoke.sh` under `finding the corpus`, and five more under `init`
where the file's own location is asserted — all against real corpora in temporary directories.
Eleven more under `help`, and fourteen under `the refusals a help entry names`.

**Where the file is**, under `init` — above the corpus, saying `root: docs`, recording the
language, *not* inside the corpus, and naming the directory `--root` asked for. The middle one is
a refutation, and it is the assertion that would still pass if the file had merely been copied.

**Finding it** — a command three levels down with no flag, naming the corpus `docs/...` from there
rather than a path relative to the shell, and outside any corpus saying so and where it looked.

**One configuration, one corpus** — a second here refused and naming what configures it; one below
another allowed, and the nearer one found. The last is what makes nesting mean anything.

**The old layout** — read, found from below, and `init` refusing to double it; `--root` still
pointing at a corpus that is not at `docs/`.

**What is not about a corpus** — `agents` in an uninitialised repository, and an unknown command
answered before anything is located.

**What a command says of itself**, every assertion of it run outside a corpus deliberately: an
entry that is not the listing, the same answer through `molly help <command>`, a refusal named in
it, an unknown flag failing to pre-empt it, and a typo still getting the typo's message. Both
directions over the table too — every listed command answers for itself, and the listing holds
every command but the hidden one.

**The refusals a help entry names**, each provoked and its exit code asserted. This is the half
that keeps the field honest: the text is written by hand because it cannot be derived, so the only
thing standing between it and a false claim about the tool is that the claim is executed.

**The silent fallback**, which is the one that matters: a configuration that will not parse is
refused and names the line, *and does not report an empty corpus*. It exited `0` over a corpus it
had never looked at, and an assertion that only checked the exit code would have passed on the
version that did.
