# How it will be built

Three packages, and the boundary between them is the design. `@mollyguard/core` decides what
a change *is* and holds no I/O. `@mollyguard/store` writes it. `mollyguard` parses argv
and prints. The command is a thin caller: it validates its arguments, asks core for the
shapes, and hands them to store.

**Core — what a change is.**

`change.ts` names the four parts and the four kinds. `slug.ts` mints the directory name from
the title: ASCII, lowercase, hyphenated, capped at 60 characters and clipped at a word
boundary rather than mid-word — a slug is a filename people type, and `…-inside-the-li` reads
as corruption where `…-inside-the` reads as abbreviation. `frontmatter.ts` serialises the
record and deliberately admits scalars and arrays of scalars only: once frontmatter can hold
a tree, documents start carrying structure that the prose below them contradicts.

`templates.ts` is the seam. It exports a `Templates` interface — `bodyFor(part)` — with the
built-in as one implementation rather than four string constants at the call site, so a
format slice substitutes it whole. The templates it ships carry no requirement form at all.

**Store — writing it.**

`writeChangeBundle` composes all four documents in memory and checks the target directory is
free *before* creating anything. A half-written bundle exists as far as a listing is
concerned and is incomplete as far as anything reading it is concerned, with nothing to say
which — so a collision returns rather than throws, and leaves the disk untouched.

**CLI — refusing well.**

Four refusals, each naming the remedy rather than the rule: no corpus at the root, a title
that reduces to no usable name, a directory that already exists, and a `--kind` that is not
one of the four, which lists the four. A change with nowhere to land is *reported* and not
refused, because either half of the answer can be decided after the bundle exists and the
moment to notice is while the author is still at the terminal.

`--alters` is collected from raw argv rather than from the parsed flag map, because the
parser keeps the last value for a repeated flag and a change may alter more than one thing.

# What this constrains afterwards

<!-- decision: core-never-parses-a-body -->

**Core never parses a document body.** It is handed an opaque string and has no opinion about
what is inside it. Structure, when something needs it, is carried in frontmatter or read by a
slice — never inferred by the engine from prose.

Two things depend on this and both are load-bearing. A corpus can be written in any language,
because no keyword the engine recognises appears in the text. And any acceptance-criteria
form can be supplied by an extension, because the engine has not already claimed one — which
is the difference between a format being pluggable and a format being replaceable-in-theory.

It also leaves the next decision genuinely open. When publishing has to locate what a change alters,
it may match on headings, on markers, or on something a slice supplies; all three remain
available exactly as long as the engine has read nothing.

The rule is checkable and is checked: `@mollyguard/core` declares no dependencies and the
harness refuses any `node:` import, `Date.now` or `new Date` under its source.
