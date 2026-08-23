---
title: What a command may never do silently
lang: en
capability: the-corpus
---

# The rule

**No command destroys, discards or conceals something that was already there and then reports
success.** Everything below is that one sentence applied to a place where the tool had got it
wrong, and they are one document because they were one failure said four ways.

It is also the rule this product exists to enforce on other people's documents, which is what
makes breaking it here expensive. A corpus is a claim that what you are reading is what is true; a
tool that quietly writes over its user's work while exiting `0` is making the same false report it
was built to catch.

# A file that is already there is left alone

`molly init` writes into a directory somebody else's repository already had — `docs/` is the
default root, and `docs/README.md` is a file a great many repositories already have. Every file
init places is placed only where there is nothing, and whatever it found instead is named at the
end, by path.

- **The corpus is still made.** Keeping a file is not a refusal: the areas that were absent get
  their explainers, the run exits `0`, and the summary says what it left.
- **Named, not counted.** A count tells somebody a file of theirs was met and leaves them to work
  out which — and the whole point of keeping it was that what was there was worth more than the
  explainer it would otherwise have been given.
- **The ledger is named on its own.** An explainer is prose nothing reads, and deleting it and
  running again produces this one. `history.jsonl` is the single file in a corpus that cannot be
  written again from anything else, so a corpus found where one existed before keeps its record,
  and is told so rather than left to notice.

`mollyguard.yml` is the exception, and it is not an exception to the rule. An existing
configuration is not a file to keep; it is a corpus, and the whole command refuses rather than
becoming a second answer to *where is the corpus*.

# A name is derived from the whole title, or not at all

Stated where names are minted, in [creating a change](../creating-a-change/spec.md), and belonging
here because it is the same failure: a title that reduces only partly is refused, and the refusal
names the words that would have been lost. Deriving `entra-id` from *Вхід через Entra ID* discards
two thirds of a title, and a name is minted once and never translated — which is precisely what
makes a silently partial one permanent.

This is not a formatting problem. Refusing costs one flag, at the one moment the answer is still
free to change. Not refusing costs a name for as long as the corpus lives.

# Every area a corpus has is an area the report shows

`molly status` is what a planner reads instead of `ls`, so an area that exists and is absent from
the report is an area that cannot be seen. `roadmap/` was that area: the corpus README calls it
*read while planning*, and it was the one directory no command showed. Its entries now appear in
the table and in `--json`, read the same way capabilities are.

A listing that omits an area without saying so is worse than no listing, because it is *believed*.
Somebody planning against the report concludes nothing was intended and drafts a change that
contradicts an entry sitting in the corpus.

**Intent is reported and never fails.** An unreadable *change* fails a run, because a change is a
governed unit and a listing missing one vouches for a corpus it has not seen. A roadmap entry is a
note: a folder where a file belongs, a name nobody could type, a record that will not parse — each
is reported, and the exit code stays `0`. Failing a build over a broken YAML block in a planning
note would be refusing somebody's notes for existing.

# A corpus that cannot be located is not guessed at

`mollyguard.yml` says where the corpus is, so a configuration that will not parse leaves the tool
without the one answer it needs. The obvious recovery is the old layout — take the corpus to be
the directory holding the file — and it is wrong in the way this document is about: the guess
lands on a directory that has nothing in it, `molly status` reports an empty corpus, and the run
exits `0` while the real corpus sits untouched beside it.

This one was not reported. It happened here, during the migration onto the new layout, and the
report was believed for as long as it took to notice the corpus had not moved.

- **The refusal names the line.** A configuration is refused with the parser's position in it,
  because *it will not parse* sends somebody to read a file they have already read.
- **It is refused before any command runs**, not by each command that needs it. Read once,
  centrally, ahead of dispatch: no command had a bug, and the degradation lived in the seam
  between seven of them that each did something reasonable.
- **An empty corpus and a corpus nobody looked at print the same thing.** That is what makes this
  the expensive kind of wrong rather than a rough edge — there is no reading of the output that
  tells them apart, so the only place the difference can exist is in whether the run happened.

The rule is set out where the searching is, in [finding the
corpus](../finding-the-corpus/spec.md).

# What this rules out afterwards

**A file the tool did not write is not written at all.** `init` skips what it finds, `publish`
writes only into a corpus that is its own, and `agents` writes only `molly`-namespaced paths. The
one command that edited a file belonging to somebody else — merging its own grants into
`.claude/settings.json` — now names them and writes nothing, because a careful edit to a file
holding somebody's judgement about risk is still an edit they did not make.

That is the stronger form of this rule and the one worth stating: *not overwritten* still admits
a command that writes into another tool's file, provided it does so tidily. The next command that
wants to write outside a corpus answers this before it is built rather than after somebody loses
a file — and the harness walks what `init` and `agents` leave behind, so the answer is checked
rather than agreed to.

**A derived name goes through the one seam that refuses.** Reduction alone is not minting. Minting
is the reduction plus both refusals, and the refusals are the half that has to be impossible to
forget.

**A fallback is a guess, and a guess reports on something nobody looked at.** Where the tool
cannot read what it needs it stops. The recovery that looks harmless — assume the older shape,
carry on — is the exact move this rule forbids, because a correct-looking report over the wrong
directory is indistinguishable from a correct one.

**An area added to the corpus is an area added to the report.** `specs/`, `decisions/` and
`history/` were always reachable through the changes that published them. `roadmap/` was reachable
through nothing, which is what made it the one that broke.

# What is deliberately left undone

A roadmap entry is not checked the way a change is. One naming a capability that does not exist is
still not reported — a finding names its subject `change`, and generalising that is a change to
the shape of the report rather than to what the report can see.
