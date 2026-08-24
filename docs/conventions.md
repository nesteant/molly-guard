# How this repository works in its own corpus

The installed skills say how a MollyGuard corpus works in general. This says how *this* repository
uses it, and where the two differ this wins.

It is a plain file rather than published truth, deliberately: it is the pointer the generated
skills name, so it reaches every agent tool at the moment of use, and it says nothing about the
product — only about working here. Nothing in it is copied into a skill, because a copy is a second
answer to a question this file already answers, and it would go stale silently.

## The product this repository builds is MollyGuard, and it is built through MollyGuard

`packages/core`, `packages/store` and `packages/cli` are the tool. `docs/` is that same tool's
specification, governed by the tool itself. So the corpus is not documentation *about* the code
kept alongside it — it is the record the code is answerable to, and the two are kept in agreement
by the same flow every other corpus uses.

**A change to what the tool does starts as a change bundle, not as an edit to `packages/`.**

```bash
npm run build                       # molly is not on the PATH here; the workspace script is
npm run molly -- status
npm run molly -- change new "<title>" --capability <name> [--alters specs/<name>] [--realises <entry>]
```

Then the four documents, then `npm run molly -- move`, then `publish/`, then
`npm run molly -- publish`. `npm run molly -- help` lists the rest.

## What needs a change, and what does not

**A change** — anything that alters what a command does, what it refuses, what it writes, where it
writes it, or what it says while doing so. That includes a refusal being added or removed, a new
flag, a new file written outside the corpus, a message a caller could be automating against, and a
refactor that moves a decision from one place to another. `0014-molly-writes-in-its-corpus-and-nowhere-it-does-not-own`
is `kind: refactor` and went through the whole flow, which is the calibration.

**Not a change** — a build fix, a dependency bump, formatting, a comment, a typo in prose that
states nothing new, or a test that covers behaviour already specified.

When it is genuinely unclear, it is a change. The cost of one bundle nobody needed is four short
documents; the cost of a behaviour nothing specified is a tool whose specification is wrong and
says nothing about being wrong.

## Adding a command

`decisions/a-command-that-needs-a-choice-offers-it` binds this and is the one most easily missed,
because the wrong version looks finished: a command that needs a value the corpus can enumerate
**offers the list to a person and refuses with the list to a pipeline**. A refusal that names what
could have been chosen is one round trip short of the job when somebody is sitting at a terminal.

The bounds are part of the rule, not exceptions to it — never wait when nothing is reading input,
never show an empty menu, let an optional value be declined, and ask before anything is written.
Reach for `chooseFrom` in `pick.ts`; a second copy of *ask, or refuse with the list* is what review
is looking for.

Every command is listed in `molly help` and the harness checks that listing is complete, so adding
one is visible — which is the moment this is meant to be read.

## The specification is read before the code is changed

Before altering a command, read the specification that governs it — `molly status` lists the
capabilities, and `docs/specs/` holds the eight in force. **Where the code and a published
specification disagree, that is a finding to state in `change.md`, not licence to edit either
one into agreement.** The whole product is an argument that a document nobody checks drifts; this
repository is the first place that has to hold.

`docs/decisions/` holds standing constraints, and they bind work here the way they bind work
anywhere. Three are in force, and `the-tool-writes-only-what-it-owns` is the one most often
reached for, because the tempting change is nearly always one more helpful file written somewhere
this tool was never given.

## Intent lives in `docs/roadmap/`, never in a file at the root

`molly roadmap new "<title>"` writes a **slice** — a body of planned work holding what it is for,
its features in the order they are wanted, what has been decided, and what is done. `molly status`
lists the slices. A `ROADMAP.md` at the repository root existed once and was migrated into the
area: a plan outside the corpus is a record nothing manages, which is the half-governed state this
tool exists to prevent.

**Read the slice before drafting.** The order is prose and nothing parses it — the `molly-roadmap`
skill is how to act on one, and it carries the prohibitions that matter: never invent a feature the
slice does not name, never reorder or reprioritise unasked, never mark a feature done that has not
published.

A change that implements a feature names its slice with `--realises <slice>`, and the title comes
from the *feature* rather than the slice — one named after a body of work makes several claims.
Several changes realise one slice over its life; `molly status` names them and asks whether the
plan is still current. Keeping *what is done* true is a direct edit, because no change alters a
slice.

## The corpus reads and writes in `en`

`lang: en` in `mollyguard.yml`. Names are lowercase ASCII, minted once, and never translated.

## What is never edited by hand

`docs/specs/`, `docs/decisions/`, `docs/history/`, `docs/.mollyguard/history.jsonl`, and `state:`
in any document. The first two are filled only by `molly publish`; the third is sealed; the fourth
is the ledger; the fifth is a projection of it, and a document disagreeing with the ledger is
refused.

The generated files under `.agents/`, `.claude/` and the other tool roots are outputs of
`molly agents` and are not edited either — change `packages/core/src/scaffold.ts` and reinstall.
`npm run molly -- agents --check` says whether they are current.

## Before finishing

```bash
npm run build && npm run smoke && npm run molly -- status
```

`molly status` exiting `0` with no findings is part of the definition of done, because a corpus
this tool cannot vouch for is the one thing this repository may not ship.
