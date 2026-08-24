---
title: A capability can retire, and a concern can cross one
lang: en
---

# What this slice is for

**A capability boundary can be moved without breaking what was filed before it moved, and a concern
that genuinely crosses boundaries has somewhere to live that is not a second capability.**

# The features, in order

## 1. Deprecation

**No new work may be filed under a deprecated capability, and everything already filed under it
keeps resolving.** The second half is what makes deprecating safe enough to do — a deprecation that
broke every existing reference is one nobody would ever perform.

**A status, not a lifecycle**, and this is the line that must not blur. A lifecycle is folded from
the ledger, moved with `molly move`, and projected into `state:`. A status is a fact declared in the
document and nothing else — the shape the corpus already uses everywhere. So a capability may carry
a status field, must never carry `state:`, and `molly move` must never touch one.

**`superseded_by:` rather than `deprecated: true`.** A bare deprecation is a dead end: the author is
told no and not told what instead. Naming the successor gives the refusal something to say, and it
is the shape supersession will take on a specification.

Where it bites: `molly change new --capability <deprecated>` refuses; `molly publish` refuses to
file new truth there; `molly status` reports what is still filed under one *without failing*,
because existing work is not wrong for having been filed before the boundary moved.

## 2. What crosses

**`tags:`** is for genuinely cross-cutting concerns — compliance, performance, anything a reader
wants to gather across capabilities. A tag is not a grouping and does not scope a read, which is
exactly why it may be plural where `capability:` may not.

That asymmetry is settled. On a specification a capability is a *reading* boundary: one filed in two
places is found twice and read twice, and "read the billing slice" stops being a bounded read. The
moment somebody wants two, either the edge is drawn wrong or it is two specifications — and both
are worth being told about rather than absorbed by a list. On a change the field only ever describes
what the change *creates*, because anything it alters already declares its own.

**`tracker:`** is the same shape for the same reason — `tracker: [JIRA-1234, JIRA-1241]`. A ticket
is a reference, not an identity, so the field can hold several and a change with no ticket is not
thereby nameless.

## Why none of it is a change yet

With two capabilities and eight specifications there is nothing to redirect, and a refusal nobody
can trigger is a refusal nobody has tested. The field's shape is settled above so it can be added
later without reopening the question.

Both fields in 2 are cheap and blocked by nothing except want: a field nothing reads means whatever
the first reader assumes. They arrive alongside the cross-cutting read, most likely with
`the-knowledge-base-can-be-read`, where the contrast between a slice and a gather becomes visible.

# What has been decided

**A capability nothing is filed under is not reported.** On the day it is made that is every
capability, so reporting it would be reporting the normal case. It becomes a reasonable finding once
a corpus is old enough that an empty grouping means a boundary nobody uses — a judgement about size,
and the tool does not know the size yet.

# What is done

Nothing yet.
