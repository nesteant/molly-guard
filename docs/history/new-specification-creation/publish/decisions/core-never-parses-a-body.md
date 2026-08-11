---
title: Core never parses a document body
lang: en
---

# The constraint

`@mollyguard/core` is handed an opaque string and has no opinion about what is inside it.
Structure, when something needs it, is carried in frontmatter or read by a slice — never
inferred by the engine from prose.

# Why it is binding

Two things depend on it and both are load-bearing.

**A corpus can be written in any language**, because no keyword the engine recognises appears
in the text. A rule that reads a heading is a rule that reads an English heading.

**Any acceptance-criteria form can be supplied by an extension**, because the engine has not
already claimed one. That is the difference between a format being pluggable and a format being
replaceable-in-theory.

It also leaves later decisions genuinely open. When something has to locate what a change
alters, it may match on headings, on markers, or on something a slice supplies; all three
remain available exactly as long as the engine has read nothing.

# How it is held

The rule is checkable and is checked. `@mollyguard/core` declares no dependencies, and the
harness refuses any `node:` import, `Date.now` or `new Date` under its source — a property
grepped for, not a promise made in a review.
