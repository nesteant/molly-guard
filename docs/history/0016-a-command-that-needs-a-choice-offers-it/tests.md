---
title: A command that needs a choice offers it
lang: en
part: tests
---

# What will prove it

The suite runs with no TTY, which makes the non-interactive half free to assert and the
interactive half impossible. That split is the honest shape of this change and is stated rather
than worked around.

## The half a pipeline takes, asserted

Every one of these runs with stdin and stdout not a TTY, which is how CI and every agent invokes
the tool.

- `molly change new "…" --capability nope` exits `1` and lists the capabilities that exist.
  Unchanged from today, and the assertion is that it is unchanged — the refusal must not have
  been traded for a prompt that hangs.
- `molly change new "…" --realises nope` exits `1` and lists the entries.
- `molly change new "…"` with no capability and no alters exits `0`, writes the bundle, and prints
  the note. **The non-interactive path must not become a refusal** — a change that only alters is
  legitimate, and failing a scripted creation for not answering an optional question would break
  every existing caller.
- `molly move` and `molly publish` with no arguments exit `1` and list the changes, exactly as
  they do today. Step 2 rewrites their internals and must change no output.
- **No command blocks.** Every assertion runs under a timeout, and a hang is a failure rather than
  a suite that never returns. This is the one that catches the mistake this change could make.

## Empty sets

- `molly change new "…" --capability x` in a corpus with no capabilities exits `1` and says to
  write one first. Never an empty menu.
- The same for `--realises` in a corpus with an empty roadmap.

## Nothing is written when nothing is chosen

- With the prompts moved ahead of the write, a creation that refuses leaves no directory behind.
  Asserted by refusing on a bad `--capability` and then listing `changes/` — one stale bundle from
  an abandoned prompt is a corpus with a change nobody made.

## The half that needs a person

**Whether the prompt is usable cannot be asserted here**, and a smoke suite that claimed otherwise
would be the failure this product exists to name.

Checked by hand before this change advances, and the result written into this document:

- `molly change new "A thing"` on a terminal offers the capabilities, offers *none of these*, and
  files the change under what was chosen.
- Choosing *none of these* prints today's note and exits `0`.
- Ctrl+C at the prompt exits `1` with nothing written — nothing happened, so `0` would be the
  tool vouching for work it did not do.
- `--capability` mistyped offers the list rather than exiting, and the chosen value is what lands
  in the frontmatter.

## The decision is installed, not just written

- `molly publish` files `decisions/a-command-that-needs-a-choice-offers-it.md` into the base.
- The generated skills tell an agent to read every file in `decisions/`, so the constraint reaches
  the next contributor without anybody remembering to mention it. The existing assertion that the
  skills point at `docs/decisions/` covers this and must still pass.
