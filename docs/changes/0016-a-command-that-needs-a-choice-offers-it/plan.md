---
title: A command that needs a choice offers it
lang: en
part: plan
---

# How it will be built

The mechanism exists. `pick.ts` is a thin shell over pure lists in core — `interactive()` reports
whether both streams are a TTY, `abandoned()` recognises Ctrl+C as not-a-failure, and
`chooseChange` is already shared between two commands precisely so the refusal cannot drift. What
is missing is that the same shell is not reached for from `change new`.

## One helper, not three

`pick.ts` gains `chooseFrom(items, { usage, empty })` — the shape `chooseChange` already has,
generalised over anything with a slug and a title:

- interactive: render the list, return the chosen slug, treat Ctrl+C as abandonment (exit `0`,
  nothing written)
- not interactive: `fail(usage, "…: <the list>")` — the refusal that exists today, unchanged
- empty set: `fail(usage, <the remedy>)` — never an empty menu, because a list of nothing is a
  question with no answer

`chooseChange` is rewritten in terms of it, so there is one implementation of *ask, or refuse with
the list* rather than one per caller.

## Where it is called

`requireCapability` and `requireEntry` in `change.ts` become *resolve*: given a value, check it as
now; given nothing, offer. So `--capability` and `--realises` behave the same whether they were
mistyped or omitted.

The unfiled case changes from a note to a question. `molly change new "…"` with no `--capability`
and no `--alters` currently prints *nothing to publish into yet* and exits `0`. It will ask which
capability to file under, with **an explicit "none of these" option** — because filing nowhere is a
legitimate answer for a change that only alters, and a menu that cannot be declined is a
requirement wearing a menu's clothes. Declining prints the note that is printed today.

## Order of operations, which matters

The prompt comes **before anything is written**, so abandoning leaves no half-made bundle. Today's
sequence writes the bundle and then reports what is missing; the questions move ahead of the write.

## What is deliberately not done

**No prompting for a title.** A title is authorship, and a tool that offers a list of titles is
composing text.

**No prompting for `--alters`.** It names documents that may not exist yet, so there is no set.

**No prompting for `--name`.** It is derived from the title and already only asked about when the
derivation fails.

**No `--yes` or `--no-input` flag.** `interactive()` already answers the question from the streams,
and a flag would be a second way to say the same thing that can disagree with the first.

# What this constrains afterwards

**The decision this change publishes binds every command added later**, and it is written to be
read by somebody proposing one: if the corpus can enumerate the answers and a person is present,
ask; otherwise refuse with the list. That is the whole rule, and its two bounds — never wait when
nothing is reading input, never offer an empty menu — are part of it rather than caveats to it.

**Interactive and non-interactive runs stay deliberately different.** One asks, one refuses. That
asymmetry is the design, not a gap to be closed later by making CI prompt or by making the terminal
silent.

**Refusals keep naming the remedy.** Offering a choice does not replace a good refusal; it is what
happens when there is somebody to offer it to. The non-interactive path is the one every agent and
every pipeline takes, so it stays the path that is tested hardest.
