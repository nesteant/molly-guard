---
title: A move can be refused on its merits
lang: en
---

# What this slice is for

**The flow can say no for a reason, and the reason is somebody else's to write.**

# The features, in order

## 1. The hook seam

The sequence in core is an order, not a set of permitted edges: `molly move` records any state
after any other. `ChoiceFilter` narrows what the *picker* offers and that is all it does — it
cannot stop `molly move x published` typed directly. What a move *requires* is policy, and policy
belongs to a slice or to whatever orchestrates the work, so between now and then the tool records
whatever it is told. That is deliberate, and this is what it costs.

Refusing needs an event fired at the transition point whose subscribers answer **pass**, **refuse**
with findings, or **defer**. All three already have homes: a refusal is a finding; a deferral is
the `blocked` event, which stops advancement without stopping recovery; an external answer arrives
as a verdict posted back, pinned to the content hash it judged, so a late reply cannot approve text
nobody looked at.

**The first slice worth writing against it restores what was deliberately removed: strict
sequencing**, refusing any move that is not to the adjacent state. Teams that want the old
behaviour install it, and it doubles as the worked example of the extension model.

## 2. Undoing a publication

Entering the terminal state is closed: `molly move x published` is refused and points at `molly
publish`, and the picker does not offer it — recording a publication that never happened would
leave the ledger claiming a fold with an empty `specs/`.

Leaving it is the half still open. It does not arise by accident, because a published change is
archived into `history/` and no command in flight can find it — so the way to undo a publication is
currently `git checkout`, which works precisely because every effect is a file.

What is missing is the deliberate case: a published specification that turns out to be wrong, where
the correction is meant to be a new change rather than a retreat. The two candidate answers are a
**refusal** that names the correction as a new change, or a **recorded reversal** that unwinds the
write and says so in the ledger. The second is more honest and more work.

## Why none of it is a change yet

The seam is the design, and it is worth having something that reads the corpus before it is drawn —
a subscriber that cannot see `specs/` can only refuse on the argument, which is what `move` already
does. So it follows `the-knowledge-base-can-be-read`.

Also open in 1: whether a verdict lives in the ledger or beside it, and what a `blocked` event
holds that a refusal does not.

**Neither answer in 2 should be built before somebody actually wants to undo a publication.** A
reversal designed against an imagined case is a second write path through the archive, and the
archive's whole value is that nothing writes to it twice.

# What has been decided

Nothing beyond what the features state above.

# What is done

Nothing yet.
