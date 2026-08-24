---
title: The knowledge base is read back
lang: en
part: plan
---

# How it will be built

One scan in the store, three readers in the CLI. The shape is `readChanges` and `readCapabilities`
already use, which is what keeps this small: the areas differ in whether they are bundled, and the
scanner already knows that from the area table.

## The scan

**`store/base.ts`** — `readBase(root)` returns the publishable areas' contents:

- `specs`: bundled, so a folder with its `entry` file. Slug, node, and the record — `title`,
  `lang`, `capability`.
- `decisions`: files. Slug, node, `title`, `lang`. **No capability**, because the area table says
  `grouped` is not set on it: a decision is found by whatever it constrains, not by reading a
  slice, and inventing a grouping for one would be inventing a rule the corpus has not got.
- `unreadable`: one line per document that would not parse, per the rule that what cannot be read
  is said out loud.

Driven from `AREAS` rather than from two hardcoded names, so the next publishable area is scanned
without editing this.

## The three readers

**The report.** `Report` gains `specs` and `decisions`, each `{ name, title, capability? }`, and
the table prints specifications grouped by capability with the decisions listed after. An absent
capability renders as the same `—` a change with no filing gets.

**A published `capability:` resolves, and fails.** Same severity as the in-flight check and for the
same reason — a specification nothing points at is present and unreachable, which is worse than
absent because absence is visible. It is `dangling-capability` with the node naming the spec.

**`alters:` resolves, and does not fail.** A change in flight naming a base document that is not
there is reported. Not failed, because the document may be published by this very change or by one
still in flight — the author is describing intent, and the tool cannot tell a typo from a plan. An
archived change is not asked: it is the finished shape of the link, and reporting it would turn
every correct publication into a finding, exactly as with `--realises`.

## Where it must not be duplicated

`molly publish` already resolves a capability for the documents it is about to write. It keeps
doing that: the refusal has to fire at the write, which is the last moment the answer is still
recoverable. This scan answers a different question — what is *already* filed — and the two must
not be merged into one pass that fires at the wrong time.

## What is deliberately not built

**`molly context <capability>`** and **the derived overview**. Both sit on this scan and both are
their own claim. Landing them here would make one change out of three.

**No body is read.** Everything reported comes from frontmatter and from the path.

# What this constrains afterwards

**The scan is the one way the base is read.** Anything later that needs to know what is filed —
`context`, an overview, a renderer's input, `verify` — calls `readBase` rather than walking the
directories again. Two walks over one area is how two answers to one question start.

**A finding about the base fails when it makes truth unreachable and reports otherwise.** A
dangling capability fails; an `alters:` that has not arrived yet does not. The line is whether the
corpus is wrong now or merely incomplete, and it is worth restating whenever a finding is added
here, because the knowledge base is the area where over-failing makes the tool unusable and
under-failing makes it pointless.
