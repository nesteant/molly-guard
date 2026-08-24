---
title: The knowledge base can be read
lang: en
---

# What this slice is for

**`molly publish` fills `specs/` and `decisions/`, and no command looks at either afterwards.**
Eight specifications and three decisions are filed, and the tool stops at the edge of the thing it
exists to protect.

Everything here is one missing piece and three payoffs on top of it.

# The features, in order

## In order

**1. A scan of the knowledge base.** Three things become possible at once, which is the argument
for building it once rather than three times:

- `molly status` can say what is *true*, not only what is in flight.
- A `capability:` on a *published* specification can be resolved. Today the check exists and is
  aimed at half the corpus — and the half it cannot see is the permanent half.
- `alters:` can resolve. It was deferred while the areas were empty, because a check that passes
  for want of anything to fail it is indistinguishable from one that does not work. That reason
  is gone.

**2. `molly context <capability>`** — the narrow read: the decisions in force, the open roadmap
entries and the specifications in one capability, budgeted. Never the corpus whole, and never
handed to a model whole. A capability is currently visible and unusable; this is the payoff the
grouping exists for.

**3. A derived overview.** The specifications in force, grouped by capability, generated on demand
and never committed as a second copy. Two rules it must keep: **a table of contents is generated,
never written**, because a hand-written one is a projection nothing checks and drifts within a
month; and **reading order lives in frontmatter, not in nested directories** — `specs/<name>/`
stays flat and one level deep, because the path is the id. Filing structure is an *address*;
reading structure is a *view*.

**4. A renderer, as a separate package or repository.** The thing being replaced is Confluence:
documentation that stays in sync because the process that changes the product is the process that
changes the documents. That sets the sizing — a capability reads as a parent or an epic, a
specification as a feature-sized document. A corpus that reads well in exactly one viewer is
locked to it, and this one is plain markdown with a small frontmatter record: close to what Astro
Starlight (first-class i18n, which matters here), VitePress (lighter, weaker i18n) or Material for
MkDocs (best navigation, but Python) already expect. **The adoption path matters more than the
choice**: the corpus becomes the source of truth before the viewer changes — tools like `mark`
push rendered markdown into existing Confluence spaces, so governance moves first while readers
stay where they are.

## Why none of it is a change yet

Step 1 is unblocked and is the largest single unlock on this roadmap. It should be shaped with 2
and 3 in view rather than fitted to `status` alone.

Open in 2: what "budgeted" means, what is dropped first when a capability outgrows one read, and
whether the unit is documents or tokens. Open in 3: where reading order is declared and what
happens to a document that declares none — appended, alphabetical, or reported; a default that
quietly buries a document is the failure worth designing against. Step 4 waits on 3 and should not
pick a viewer before there is something to view.

# What has been decided

Nothing beyond what the features state above.

# What is done

Nothing yet.
