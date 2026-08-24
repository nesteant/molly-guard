---
title: Publishing names what it moved out from under
lang: en
kind: feature
capability: the-corpus
state: published
alters:
  - specs/publishing-a-change
  - specs/what-a-command-may-never-do-silently
---

# What this change makes true

**`molly publish` names every live document whose relative link resolved into the change it just
archived and no longer does** — by file, by line, and by the path that broke:

```
* changes/0003-run-in-a-deployed-environment published — deployed → published, ana
  ! 1 reference now resolves to nothing
    changes/0004-sign-in-with-entra-id/change.md:28
      ../0003-run-in-a-deployed-environment/change.md → history/0003-run-in-a-deployed-environment/
```

**It rewrites none of them, and the publication is not in doubt.** The exit code stays `0`: the
documents were filed, the bundle was archived, and the references are a finding about the corpus
rather than a fault in the publication.

# Why

Publishing moves `changes/<name>/` to `history/<name>/`, and nothing else in the corpus is told.
Everything that pointed at the old path is now wrong, and the tool that made it wrong says nothing.

**Three publications in one adopting repository produced three variants of it.** Two were absorbed
by that project's own checker — a dependency row resolved against `history/` after the entry it
named retired, and the archive excluded from a link walk once links *inside* a sealed bundle
stopped resolving. The third could not be: a link **from a live change into** the change being
published, `0004/change.md:28` pointing at `../0003-.../change.md`. No exclusion helps, because the
source is a change still being drafted and it is right to check it. It was repaired by hand, and it
will recur on every publication where a live document references the one being published.

**The author had no path they could have written that would survive.** The link was correct when it
was written. That is what makes this the tool's to report rather than a convention to remember: the
mistake is not in the document, it is in the fact that a directory moved underneath it.

**Publishing is the only moment both halves are held at once.** The command knows exactly which
paths it moved — it performs the move — and the corpus is markdown it can read. Afterwards the two
facts are in different places and nobody has both.

# Why it reports and does not repair

**A reference is resolved, never rewritten.** [The corpus](../../capabilities/the-corpus.md) states
it as its own edge: *nothing here rewrites a reference to keep it valid, and nothing renames on
somebody else's behalf. A reference that has stopped resolving is reported, because the alternative
— editing documents nobody asked to change — is how a tidying operation silently revokes a review.*

That is not a preference. Rewriting a link inside a change in flight edits a document under review,
and where the reference is an `alters:` line it moves that change's content hash — which would
un-approve every change pointing at a document somebody merely tidied. A publication that
invalidates a reference is a small problem; a publication that silently revokes approvals while
fixing it is the failure this product exists to prevent.

So the whole remedy is saying so, at the moment it happens, to the person who caused it. That
converts a red build in somebody else's change, days later, into a line in the output of the
command that did it.

# What this must not become

**A refusal.** Refusing the publication would make "edit a document belonging to an unrelated
change" a precondition for publishing, which is worse than the break — and the write has already
happened by the time the references can be checked against their new state.

**A link checker.** It reports references that *this publication* invalidated, and nothing else. A
corpus full of links that were broken before the command ran is not this command's finding, and
reporting them here would bury the one line that is.

**A walk of `history/`.** An archived bundle is sealed and never re-checked — that is what the area
is. Links inside one that point at a sibling are wrong from the moment they are archived and are
deliberately not this tool's business.
