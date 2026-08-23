# How it is built

Three packages, and the boundary between them is the design. `@mollyguard/core` decides what a
change *is* and holds no I/O. `@mollyguard/store` writes it. `mollyguard` parses argv and
prints. The command is a thin caller: it validates its arguments, asks core for the shapes, and
hands them to store.

# Core — what a change is

`change.ts` names the four parts and the four kinds, and the record they are written from: a
title, a language, a kind, the capability the work is filed under, what it alters, and the
roadmap entry it realises. The last is a bare slug like the capability, and optional in the same
way — the field is absent rather than empty where nothing was declared.

`slug.ts` mints the directory name. Lowercase ASCII, hyphen-separated, capped at
`SLUG_LIMIT` = 60 and clipped at the last hyphen inside the cap; the hard cut is the fallback
only when the first word is itself over the limit.

Beside `slugify` sits `lostWords`, which says what that reduction discarded. A word counts as lost
when it holds a letter or a digit and reduces to nothing — both halves are needed, because without
the first the em dash in *Invoice — immutability* is a lost word and every one becomes a refusal,
and without the second nothing is ever lost. Both read through one `reduce`, so *what would this
become* is answered by the code that makes it become that.

`naming.ts` is the shape a corpus may ask its names to have — `isNamePattern`, `needsOrdinal`,
`renderName`, `matchName` — and is pure string work. Exactly one `{slug}` and at most one
`{ordinal:n}`, everything else literal; a pattern holding two of either is refused rather than
rendered, because a name without its words is a number nobody can read and one carrying them twice
is a name no reader parses back. `matchName` returning nothing is the ordinary answer rather than
an error: a corpus that adopts a pattern still holds every name minted before it did, and those
are simply names this pattern did not produce.

`frontmatter.ts` serialises the record and deliberately admits scalars and arrays of scalars
only. Once frontmatter can hold a tree, documents start carrying structure that the prose below
them contradicts. A field with no value is omitted rather than emitted blank.

`templates.ts` is the seam. It exports a `Templates` interface — `bodyFor(part)` — with the
built-in as one implementation rather than four string constants at the call site, so a format
slice substitutes it whole. `DocumentPart` covers the four parts of a bundle and each document
that stands on its own, so the next standalone document is one more member of the union rather
than a second method.

Core is handed its timestamps and never reads the clock, which is what makes the shapes it
produces reproducible and testable.

# Store — writing it

`config.ts` reads `mollyguard.yml`, and *checks* it. A pattern that will not parse and an area
nobody has are each named rather than skipped, and both are refused before any command acts —
silently ignoring `chnages:` is how a repository spends a month believing it numbers its
decisions.

`naming.ts` allocates: the area, the archive named by `AREAS`, and every node the ledger has ever
mentioned in that area, highest plus one. The third source is the reason this belongs in the tool
at all — a person reading a directory listing sees the first of the three.

`writeChangeBundle` composes all four documents in memory and checks the target directory is
free *before* creating anything. A collision returns rather than throws, and leaves the disk
untouched — so the caller decides how to say it, and nothing half-made survives the refusal.

Only the entry is serialised with frontmatter; the other three are the template body verbatim.

# CLI — refusing well

`nameFor` is the one place a name is derived, and the commands that mint call it rather than
carrying the block each. It applies the corpus's pattern last, after the reduction and both
refusals. A `--name` given by hand is checked for being typable and for nothing else — not for
losing words, and not against the pattern: the policy exists to spare people the allocation rather
than to forbid them an exception, and the migration of a corpus onto a pattern is made entirely of
such exceptions. Order matters inside it: a title reducing to *nothing* keeps the message
it always had, because `"" would be named ""` is not a sentence, and only a partial name gets the
one that names the words.

Each refusal names the remedy rather than the rule, and each one runs before the write:
the corpus, the title, the kind, the capability, the roadmap entry, and — inside store — the
collision. A change with nowhere to land is *reported* and not refused, because either half of
the answer can be decided after the bundle exists.

`requireEntry` reads `roadmap/` and asks one question: is that entry there. It does not ask
whether the entry is ready, or whether anything it mentions has to land first — ordering planned
work against itself is a planning tool's job, and the reasoning is in
[planning what is not a change yet](../planning-what-is-not-a-change-yet/architecture.md).

`--alters` is collected from raw argv rather than from the parsed flag map, because the parser
keeps the last value for a repeated flag and a change may alter more than one thing.

The `created` event is appended after the bundle is on disk, so the ledger never carries a line
for a change that was not written.

# What this constrains afterwards

Core never parses a document body — see [decisions/core-never-parses-a-body](../../decisions/core-never-parses-a-body.md).
The rule is checkable and is checked: `@mollyguard/core` declares no dependencies, and the
harness refuses any `node:` import, `Date.now` or `new Date` under its source.

# What proves it

Twenty-seven assertions in `scripts/smoke.sh` under `change new`, and a section of its own under
`naming is a policy` — including the case a directory listing cannot answer, where a change
deleted with `rm -rf` does not free its number. Nearly all of them are refusals,
because a check that silently stops refusing looks exactly like one that is working and nothing
else in the system notices.

Three of them defend the seam rather than the behaviour, and are the ones worth naming:
`plan.md` contains no `---` anywhere, and no file in a generated bundle contains `given:` or
`SHALL`. All three fail the moment someone adds a helpful example to a template — which is
exactly when the corpus would quietly acquire a house form nobody chose. Four titles that
disagree, likewise, produce no error at all, so the absence of frontmatter in the parts has to
be asserted rather than assumed.
