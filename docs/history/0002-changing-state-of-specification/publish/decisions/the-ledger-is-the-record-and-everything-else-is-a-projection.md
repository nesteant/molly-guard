---
title: The ledger is the record and everything else is a projection
lang: en
---

# The constraint

One place is authoritative for any fact, and everything else derived from it must be checkable
against it. The transition ledger is the record of what happened; `state:` in a document is a
projection of it; **a projection is only allowed to exist where something compares the two and
reports a disagreement.**

# Why it is binding

This is what makes it safe to put a fact in a second, more convenient place — and it is the rule
that says when it is not. A cached value nothing verifies is indistinguishable from a stale one,
and the failure is silent, which is the worst property any part of an audit trail can have.

The check ships with the projection, never after it. Adding it afterwards means shipping a
second source of truth first and hoping nothing reads it in the meantime.

# What follows from it

**Nothing may offer to repair the ledger from a document.** Correction runs the other way: the
record is what happened, and the projection is what someone wrote down. A tool that reconciled
in the other direction would let anyone rewrite history by editing a file.

**A hash taken over a change must exclude `state:`**, or advancing a change would revoke its own
approval on the very next step.
